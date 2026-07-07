import type { BusinessInput } from "./types";

type RawInput = Record<string, unknown>;

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
