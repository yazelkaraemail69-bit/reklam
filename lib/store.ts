import { promises as fs } from "fs";
import path from "path";
import type { Business, BusinessInput, SiteSettings } from "./types";
import { slugify } from "./utils";

const DATA_DIR = path.join(process.cwd(), "data");
const BUSINESSES_FILE = path.join(DATA_DIR, "businesses.json");
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
    const raw = await upstash<string | null>(["GET", "businesses"]);
    if (!raw) return [];
    return JSON.parse(raw) as Business[];
  }
  return readJsonFile<Business[]>(BUSINESSES_FILE);
}

async function saveBusinesses(businesses: Business[]): Promise<void> {
  if (hasKv) {
    await upstash(["SET", "businesses", JSON.stringify(businesses)]);
    return;
  }
  await writeJsonFile(BUSINESSES_FILE, businesses);
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Reklam Vitrini",
  siteDescription: "İşletmeniz için saniyeler içinde profesyonel bir reklam vitrini oluşturun.",
  globalHeadScript: "",
  updatedAt: new Date(0).toISOString(),
};

async function loadSettings(): Promise<SiteSettings> {
  if (hasKv) {
    const raw = await upstash<string | null>(["GET", "settings"]);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<SiteSettings>) };
  }
  try {
    return await readJsonFile<SiteSettings>(SETTINGS_FILE);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: SiteSettings): Promise<void> {
  if (hasKv) {
    await upstash(["SET", "settings", JSON.stringify(settings)]);
    return;
  }
  await writeJsonFile(SETTINGS_FILE, settings);
}

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
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
