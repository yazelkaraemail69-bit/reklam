import { promises as fs } from "fs";
import path from "path";
import type {
  AdVariation,
  AdVariationInput,
  Business,
  BusinessInput,
  Campaign,
  CampaignInput,
  CampaignMetrics,
  CampaignMetricsInput,
  CampaignMetricsSummary,
  PaymentOrder,
  PaymentOrderInput,
  SiteSettings,
} from "./types";
import { slugify } from "./utils";

const DATA_DIR = path.join(process.cwd(), "data");
const BUSINESSES_FILE = path.join(DATA_DIR, "businesses.json");
const CAMPAIGNS_FILE = path.join(DATA_DIR, "campaigns.json");
const METRICS_FILE = path.join(DATA_DIR, "metrics.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKv = Boolean(KV_URL && KV_TOKEN);

export class StorageWriteError extends Error {
  constructor(
    message = "Kalıcı depolama yapılandırılmamış. Bu ortamda değişiklikler saklanamaz. Vercel projenizde Storage sekmesinden Upstash for Redis bağlayın."
  ) {
    super(message);
    this.name = "StorageWriteError";
  }
}

async function upstash<T>(command: (string | number)[]): Promise<T> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Depolama isteği başarısız oldu (${res.status})`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    throw new StorageWriteError();
  }
}

async function loadBusinesses(): Promise<Business[]> {
  if (hasKv) {
    try {
      const raw = await upstash<string | null>(["GET", "businesses"]);
      if (!raw) return [];
      return JSON.parse(raw) as Business[];
    } catch (err) {
      console.warn("[Upstash KV Warning] Fetch failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  try {
    return await readJsonFile<Business[]>(BUSINESSES_FILE);
  } catch {
    return [];
  }
}

async function saveBusinesses(businesses: Business[]): Promise<void> {
  if (hasKv) {
    try {
      await upstash(["SET", "businesses", JSON.stringify(businesses)]);
      return;
    } catch (err) {
      console.warn("[Upstash KV Warning] Save failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  await writeJsonFile(BUSINESSES_FILE, businesses);
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Reklam Vitrini",
  siteDescription:
    "Reklam bilmeden dönüşüm odaklı kampanya oluşturun. Hedef kitle, bütçe, görsel ve A/B metinleri adım adım.",
  globalHeadScript: "",
  updatedAt: new Date(0).toISOString(),
};

async function loadSettings(): Promise<SiteSettings> {
  if (hasKv) {
    try {
      const raw = await upstash<string | null>(["GET", "settings"]);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<SiteSettings>) };
    } catch (err) {
      console.warn("[Upstash KV Warning] Settings fetch failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  try {
    return await readJsonFile<SiteSettings>(SETTINGS_FILE);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: SiteSettings): Promise<void> {
  if (hasKv) {
    try {
      await upstash(["SET", "settings", JSON.stringify(settings)]);
      return;
    } catch (err) {
      console.warn("[Upstash KV Warning] Settings save failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  await writeJsonFile(SETTINGS_FILE, settings);
}

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "kampanya",
  "vitrin",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

function nextUniqueSlug(desired: string, businesses: Business[], ignoreId?: string): string {
  const base = slugify(desired) || `isletme-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  const isTaken = (value: string) =>
    RESERVED_SLUGS.has(value) || businesses.some((b) => b.slug === value && b.id !== ignoreId);

  while (isTaken(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

export async function getBusinesses(): Promise<Business[]> {
  const all = await loadBusinesses();
  return [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getPublishedBusinesses(): Promise<Business[]> {
  const all = await getBusinesses();
  return all.filter((b) => b.isPublished);
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const all = await loadBusinesses();
  return all.find((b) => b.slug === slug) ?? null;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const all = await loadBusinesses();
  return all.find((b) => b.id === id) ?? null;
}

export async function createBusiness(input: BusinessInput): Promise<Business> {
  const all = await loadBusinesses();
  const slug = nextUniqueSlug(input.slug || input.name, all);
  const now = new Date().toISOString();
  const business: Business = {
    ...input,
    id: crypto.randomUUID(),
    slug,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(business);
  await saveBusinesses(all);
  return business;
}

export async function updateBusiness(
  id: string,
  patch: Partial<BusinessInput>
): Promise<Business | null> {
  const all = await loadBusinesses();
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const current = all[index];
  const slug = patch.slug && patch.slug !== current.slug
    ? nextUniqueSlug(patch.slug, all, id)
    : current.slug;

  const updated: Business = {
    ...current,
    ...patch,
    slug,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  await saveBusinesses(all);
  return updated;
}

export async function deleteBusiness(id: string): Promise<boolean> {
  const all = await loadBusinesses();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  await saveBusinesses(next);
  return true;
}

function stampVariations(inputs: AdVariationInput[] = [], now: string): AdVariation[] {
  return inputs.map((input, index) => ({
    ...input,
    id: crypto.randomUUID(),
    label: input.label || String.fromCharCode(65 + index),
    createdAt: now,
    updatedAt: now,
  }));
}

async function loadCampaigns(): Promise<Campaign[]> {
  if (hasKv) {
    try {
      const raw = await upstash<string | null>(["GET", "campaigns"]);
      if (!raw) return [];
      return JSON.parse(raw) as Campaign[];
    } catch (err) {
      console.warn("[Upstash KV Warning] Campaigns fetch failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  try {
    return await readJsonFile<Campaign[]>(CAMPAIGNS_FILE);
  } catch {
    return [];
  }
}

async function saveCampaigns(campaigns: Campaign[]): Promise<void> {
  if (hasKv) {
    try {
      await upstash(["SET", "campaigns", JSON.stringify(campaigns)]);
      return;
    } catch (err) {
      console.warn("[Upstash KV Warning] Campaigns save failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  await writeJsonFile(CAMPAIGNS_FILE, campaigns);
}

export async function getCampaigns(): Promise<Campaign[]> {
  const all = await loadCampaigns();
  return [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const all = await loadCampaigns();
  return all.find((c) => c.id === id) ?? null;
}

export async function getCampaignsByBusinessId(businessId: string): Promise<Campaign[]> {
  const all = await getCampaigns();
  return all.filter((c) => c.businessId === businessId);
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  const all = await loadCampaigns();
  const now = new Date().toISOString();
  const campaign: Campaign = {
    ...input,
    id: crypto.randomUUID(),
    variations: stampVariations(input.variations, now),
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(campaign);
  await saveCampaigns(all);
  return campaign;
}

export async function updateCampaign(
  id: string,
  patch: Partial<CampaignInput>
): Promise<Campaign | null> {
  const all = await loadCampaigns();
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = all[index];
  const now = new Date().toISOString();
  const nextVariations =
    patch.variations !== undefined
      ? stampVariations(patch.variations, now)
      : current.variations;

  const updated: Campaign = {
    ...current,
    ...patch,
    variations: nextVariations,
    updatedAt: now,
  };
  all[index] = updated;
  await saveCampaigns(all);
  return updated;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const all = await loadCampaigns();
  const next = all.filter((c) => c.id !== id);
  if (next.length === all.length) return false;
  await saveCampaigns(next);
  return true;
}

async function loadMetrics(): Promise<CampaignMetrics[]> {
  if (hasKv) {
    const raw = await upstash<string | null>(["GET", "metrics"]);
    if (!raw) return [];
    return JSON.parse(raw) as CampaignMetrics[];
  }
  try {
    return await readJsonFile<CampaignMetrics[]>(METRICS_FILE);
  } catch {
    return [];
  }
}

async function saveMetrics(metrics: CampaignMetrics[]): Promise<void> {
  if (hasKv) {
    await upstash(["SET", "metrics", JSON.stringify(metrics)]);
    return;
  }
  await writeJsonFile(METRICS_FILE, metrics);
}

export async function getMetrics(campaignId?: string): Promise<CampaignMetrics[]> {
  const all = await loadMetrics();
  const filtered = campaignId ? all.filter((m) => m.campaignId === campaignId) : all;
  return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function createMetric(input: CampaignMetricsInput): Promise<CampaignMetrics> {
  const all = await loadMetrics();
  const metric: CampaignMetrics = {
    ...input,
    id: crypto.randomUUID(),
  };
  all.push(metric);
  await saveMetrics(all);
  return metric;
}

export function summarizeMetrics(rows: CampaignMetrics[]): CampaignMetricsSummary {
  const totals = rows.reduce(
    (acc, row) => {
      acc.impressions += row.impressions;
      acc.clicks += row.clicks;
      acc.spend += row.spend;
      acc.messages += row.messages ?? 0;
      acc.leads += row.leads ?? 0;
      return acc;
    },
    { impressions: 0, clicks: 0, spend: 0, messages: 0, leads: 0 }
  );

  return {
    ...totals,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
  };
}

async function loadPayments(): Promise<PaymentOrder[]> {
  if (hasKv) {
    try {
      const raw = await upstash<string | null>(["GET", "payments"]);
      if (!raw) return [];
      return JSON.parse(raw) as PaymentOrder[];
    } catch (err) {
      console.warn("[Upstash KV Warning] Payments fetch failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  try {
    return await readJsonFile<PaymentOrder[]>(PAYMENTS_FILE);
  } catch {
    return [];
  }
}

async function savePayments(payments: PaymentOrder[]): Promise<void> {
  if (hasKv) {
    try {
      await upstash(["SET", "payments", JSON.stringify(payments)]);
      return;
    } catch (err) {
      console.warn("[Upstash KV Warning] Payments save failed, falling back to local file:", err instanceof Error ? err.message : err);
    }
  }
  await writeJsonFile(PAYMENTS_FILE, payments);
}

export async function getPayments(): Promise<PaymentOrder[]> {
  const all = await loadPayments();
  return [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getPaymentById(id: string): Promise<PaymentOrder | null> {
  const all = await loadPayments();
  return all.find((p) => p.id === id) ?? null;
}

export async function getPaymentByConversationId(
  conversationId: string
): Promise<PaymentOrder | null> {
  const all = await loadPayments();
  return all.find((p) => p.conversationId === conversationId) ?? null;
}

export async function getPaymentByIyzicoToken(token: string): Promise<PaymentOrder | null> {
  const all = await loadPayments();
  return all.find((p) => p.iyzicoToken === token) ?? null;
}

export async function getPaymentsByCampaignId(campaignId: string): Promise<PaymentOrder[]> {
  const all = await getPayments();
  return all.filter((p) => p.campaignId === campaignId);
}

export async function createPaymentOrder(input: PaymentOrderInput): Promise<PaymentOrder> {
  const all = await loadPayments();
  const now = new Date().toISOString();
  const order: PaymentOrder = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(order);
  await savePayments(all);
  return order;
}

export async function updatePaymentOrder(
  id: string,
  patch: Partial<PaymentOrderInput>
): Promise<PaymentOrder | null> {
  const all = await loadPayments();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: PaymentOrder = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  await savePayments(all);
  return updated;
}

export async function getSettings(): Promise<SiteSettings> {
  return loadSettings();
}

export async function updateSettings(
  patch: Partial<Omit<SiteSettings, "updatedAt">>
): Promise<SiteSettings> {
  const current = await loadSettings();
  const updated: SiteSettings = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await saveSettings(updated);
  return updated;
}

export function isPersistentStorageConfigured(): boolean {
  return hasKv;
}
