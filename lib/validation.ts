import type {
  AdAspectRatio,
  AdCta,
  AdVariationInput,
  AdVariationStatus,
  BusinessInput,
  CampaignInput,
  CampaignObjective,
} from "./types";

type RawInput = Record<string, unknown>;

const CAMPAIGN_OBJECTIVES: CampaignObjective[] = [
  "traffic",
  "messages",
  "leads",
  "awareness",
];

const AD_ASPECT_RATIOS: AdAspectRatio[] = ["1:1", "9:16", "16:9"];

const AD_CTAS: AdCta[] = [
  "learn_more",
  "whatsapp",
  "call_now",
  "book_now",
  "get_offer",
  "shop_now",
];

const AD_VARIATION_STATUSES: AdVariationStatus[] = [
  "draft",
  "active",
  "paused",
  "winner",
];

const CAMPAIGN_STATUSES = [
  "draft",
  "pending_payment",
  "ready",
  "running",
  "paused",
  "completed",
] as const;

const REQUIRED_FIELDS: (keyof BusinessInput)[] = [
  "name",
  "slogan",
  "description",
  "category",
  "city",
  "phone",
  "whatsapp",
  "coverImageUrl",
];

export function validateBusinessInput(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Geçersiz istek gövdesi.";
  }
  const data = body as RawInput;

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      return `Zorunlu alan eksik veya boş: "${field}"`;
    }
  }

  if (data.whatsapp && String(data.whatsapp).replace(/\D/g, "").length < 10) {
    return "WhatsApp numarası ülke kodu ile birlikte en az 10 haneli olmalıdır. Örn: 905551234567";
  }

  return null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export function normalizeBusinessInput(body: RawInput): BusinessInput {
  const rawServices = Array.isArray(body.services) ? body.services : [];
  const rawGallery = Array.isArray(body.galleryImages) ? body.galleryImages : [];
  const rawSocial =
    body.social && typeof body.social === "object" && !Array.isArray(body.social)
      ? (body.social as RawInput)
      : {};

  const services = rawServices
    .filter((item): item is RawInput => typeof item === "object" && item !== null)
    .map((item) => ({
      title: asString(item.title),
      description: asString(item.description),
    }))
    .filter((item) => item.title.length > 0);

  const galleryImages = rawGallery.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );

  return {
    slug: asString(body.slug),
    name: asString(body.name),
    slogan: asString(body.slogan),
    description: asString(body.description),
    category: asString(body.category),
    city: asString(body.city),
    address: asString(body.address),
    phone: asString(body.phone),
    whatsapp: asString(body.whatsapp).replace(/\D/g, ""),
    email: asString(body.email),
    workingHours: asString(body.workingHours),
    logoUrl: asString(body.logoUrl),
    coverImageUrl: asString(body.coverImageUrl),
    galleryImages,
    services,
    social: {
      instagram: asString(rawSocial.instagram),
      facebook: asString(rawSocial.facebook),
      tiktok: asString(rawSocial.tiktok),
      website: asString(rawSocial.website),
    },
    seoTitle: asString(body.seoTitle),
    seoDescription: asString(body.seoDescription),
    customHeadScript: typeof body.customHeadScript === "string" ? body.customHeadScript : "",
    isPublished: Boolean(body.isPublished),
  };
}

export function validateCampaignInput(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Geçersiz istek gövdesi.";
  }
  const data = body as RawInput;

  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    return 'Zorunlu alan eksik veya boş: "name"';
  }

  if (
    typeof data.objective !== "string" ||
    !CAMPAIGN_OBJECTIVES.includes(data.objective as CampaignObjective)
  ) {
    return `Geçersiz kampanya hedefi. İzin verilenler: ${CAMPAIGN_OBJECTIVES.join(", ")}`;
  }

  if (typeof data.targetAudience !== "string" || data.targetAudience.trim().length === 0) {
    return 'Zorunlu alan eksik veya boş: "targetAudience"';
  }

  if (typeof data.dailyBudget !== "number" || !Number.isFinite(data.dailyBudget) || data.dailyBudget <= 0) {
    return "Günlük bütçe 0'dan büyük bir sayı olmalıdır.";
  }

  const location =
    data.location && typeof data.location === "object" && !Array.isArray(data.location)
      ? (data.location as RawInput)
      : null;
  if (!location || typeof location.city !== "string" || location.city.trim().length === 0) {
    return 'Zorunlu alan eksik veya boş: "location.city"';
  }

  if (typeof data.rawOfferText !== "string" || data.rawOfferText.trim().length === 0) {
    return 'Zorunlu alan eksik veya boş: "rawOfferText"';
  }

  if (data.variations !== undefined && !Array.isArray(data.variations)) {
    return '"variations" bir dizi olmalıdır.';
  }

  return null;
}

function normalizeVariation(item: RawInput, index: number): AdVariationInput {
  const aspectRatio = AD_ASPECT_RATIOS.includes(item.aspectRatio as AdAspectRatio)
    ? (item.aspectRatio as AdAspectRatio)
    : "1:1";
  const cta = AD_CTAS.includes(item.cta as AdCta) ? (item.cta as AdCta) : "whatsapp";
  const status = AD_VARIATION_STATUSES.includes(item.status as AdVariationStatus)
    ? (item.status as AdVariationStatus)
    : "draft";
  const source =
    item.source === "ai" || item.source === "template" || item.source === "manual"
      ? item.source
      : "manual";

  return {
    label: asString(item.label, String.fromCharCode(65 + index)),
    headline: asString(item.headline),
    primaryText: asString(item.primaryText),
    cta,
    aspectRatio,
    imageUrl: asString(item.imageUrl) || undefined,
    status,
    source,
  };
}

export function normalizeCampaignInput(body: RawInput): CampaignInput {
  const rawLocation =
    body.location && typeof body.location === "object" && !Array.isArray(body.location)
      ? (body.location as RawInput)
      : {};
  const rawVariations = Array.isArray(body.variations) ? body.variations : [];

  const radiusKm =
    typeof rawLocation.radiusKm === "number" && Number.isFinite(rawLocation.radiusKm)
      ? rawLocation.radiusKm
      : undefined;

  const totalBudget =
    typeof body.totalBudget === "number" && Number.isFinite(body.totalBudget)
      ? body.totalBudget
      : undefined;

  const status = CAMPAIGN_STATUSES.includes(
    body.status as (typeof CAMPAIGN_STATUSES)[number]
  )
    ? (body.status as CampaignInput["status"])
    : "draft";

  return {
    businessId: asString(body.businessId) || undefined,
    name: asString(body.name),
    objective: body.objective as CampaignObjective,
    targetAudience: asString(body.targetAudience),
    dailyBudget: Number(body.dailyBudget),
    totalBudget,
    location: {
      city: asString(rawLocation.city),
      district: asString(rawLocation.district) || undefined,
      radiusKm,
    },
    rawOfferText: asString(body.rawOfferText),
    sourceImageUrl: asString(body.sourceImageUrl) || undefined,
    variations: rawVariations
      .filter((item): item is RawInput => typeof item === "object" && item !== null)
      .map((item, index) => normalizeVariation(item, index)),
    status,
    customerEmail: asString(body.customerEmail) || undefined,
    packageId: asString(body.packageId) || undefined,
  };
}
