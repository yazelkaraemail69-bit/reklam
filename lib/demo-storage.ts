import type { DemoBusinessData } from "./types";

/**
 * Ana sayfadaki (app/page.tsx) "form -> vitrin" demosu için `localStorage`
 * okuma/yazma yardımcıları. Next.js Sunucu Bileşenlerinde `window` mevcut
 * olmadığından, her fonksiyon SSR sırasında çağrılırsa sessizce no-op/`null`
 * döner; gerçek okuma/yazma yalnızca tarayıcıda (client-side) gerçekleşir.
 */
const STORAGE_KEY = "reklam-vitrini:demo-business";

export function loadDemoBusiness(): DemoBusinessData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<DemoBusinessData> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.name) return null;

    return {
      name: parsed.name ?? "",
      slogan: parsed.slogan ?? "",
      description: parsed.description ?? "",
      category: parsed.category ?? "",
      city: parsed.city ?? "",
      phone: parsed.phone ?? "",
      whatsapp: parsed.whatsapp ?? "",
      logoUrl: parsed.logoUrl ?? "",
      coverImageUrl: parsed.coverImageUrl ?? "",
      services: Array.isArray(parsed.services) ? parsed.services : [],
    };
  } catch {
    // Bozuk/eski formatlı veri varsa demoyu sıfırdan başlat.
    return null;
  }
}

export function saveDemoBusiness(data: DemoBusinessData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage dolu/erişilemez olabilir (örn. gizli sekme kotası);
    // demo bu durumda sadece o oturum için bellekte kalmaya devam eder.
  }
}

export function clearDemoBusiness(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // yoksay
  }
}
