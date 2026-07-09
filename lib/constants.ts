export const BUSINESS_CATEGORIES = [
  "Güzellik ve Bakım",
  "Sağlık ve Estetik",
  "Yeme ve İçme",
  "Eğitim ve Kurs",
  "Teknik Servis",
  "Spor ve Wellness",
  "Emlak",
  "Otomotiv",
  "Moda ve Giyim",
  "Etkinlik ve Organizasyon",
  "Diğer",
] as const;

export const SITE_NAME_FALLBACK = "Reklam Vitrini";

/** Kampanya hedefleri — reklamveren dilinde, jargon olmadan */
export const CAMPAIGN_OBJECTIVES = [
  {
    value: "messages" as const,
    label: "WhatsApp / Mesaj",
    description: "Müşterilerin sizi araması veya yazması için optimize eder.",
  },
  {
    value: "leads" as const,
    label: "Teklif / Form",
    description: "Fiyat teklifi veya randevu formu dolduran kişi sayısını artırır.",
  },
  {
    value: "traffic" as const,
    label: "Site / Vitrin Trafiği",
    description: "Vitrin sayfanıza veya web sitenize tıklama getirir.",
  },
  {
    value: "awareness" as const,
    label: "Marka Bilinirliği",
    description: "Bölgenizde daha çok kişiye ulaşır; satıştan önce tanıtım için.",
  },
] as const;

export const AD_ASPECT_RATIOS = [
  {
    value: "1:1" as const,
    label: "Kare (1:1)",
    description: "Instagram / Facebook akış reklamı",
    width: 1080,
    height: 1080,
  },
  {
    value: "9:16" as const,
    label: "Dikey (9:16)",
    description: "Reels, Stories, TikTok",
    width: 1080,
    height: 1920,
  },
  {
    value: "16:9" as const,
    label: "Yatay (16:9)",
    description: "Google Display / YouTube",
    width: 1920,
    height: 1080,
  },
] as const;

export const AD_CTAS = [
  { value: "whatsapp" as const, label: "WhatsApp'tan Yaz" },
  { value: "call_now" as const, label: "Hemen Ara" },
  { value: "book_now" as const, label: "Randevu Al" },
  { value: "get_offer" as const, label: "Teklif Al" },
  { value: "learn_more" as const, label: "Daha Fazla Bilgi" },
  { value: "shop_now" as const, label: "Alışverişe Başla" },
] as const;

/**
 * Yayın platformları — müşteri Ads paneline girmez.
 * Seçim, ekibin hangi Ads hesabında (Meta / Google) kampanyayı açacağını belirler.
 */
export const AD_PLATFORMS = [
  {
    value: "meta" as const,
    label: "Meta Ads",
    shortLabel: "Instagram & Facebook",
    description:
      "Instagram akış, Reels, Hikâye ve Facebook. Yerel esnaf ve WhatsApp mesajı için en güçlü kanal.",
    channels: ["Instagram Akış", "Reels / Hikâye", "Facebook Akış"],
    bestFor: "Mesaj, randevu, yerel görünürlük",
    aspectHints: ["1:1", "9:16"] as const,
  },
  {
    value: "google" as const,
    label: "Google Ads",
    shortLabel: "Google Display & YouTube",
    description:
      "Google Display ağı ve YouTube. Arama / keşif sırasında markanızı gösteren yatay reklamlar.",
    channels: ["Google Display", "YouTube"],
    bestFor: "Bilinirlik, site / vitrin trafiği",
    aspectHints: ["16:9"] as const,
  },
] as const;

/**
 * Sabit reklam paketleri — esnaf kuruşu kuruşuna bilir.
 * price = Iyzico'ya giden tahsilat (medya + hazırlık hizmeti dahil paket fiyatı).
 * Yayın: ödeme sonrası ekip 24 saat içinde manuel açar (API otomasyonu sonraki aşama).
 */
export const AD_PACKAGES = [
  {
    id: "starter" as const,
    name: "Başlangıç",
    tagline: "Yerel esnaf için",
    price: 1490,
    durationDays: 7,
    dailyBudget: 150,
    recommended: false,
    features: [
      "7 gün yayın",
      "A/B metin varyasyonları",
      "Instagram + Reels görsel hazırlığı",
      "WhatsApp odaklı hedefleme",
      "24 saat içinde yayına alma",
    ],
  },
  {
    id: "growth" as const,
    name: "Büyüme",
    tagline: "Daha fazla mesaj",
    price: 2990,
    durationDays: 14,
    dailyBudget: 180,
    recommended: true,
    features: [
      "14 gün yayın",
      "3 A/B varyasyon + kazanan seçimi",
      "1:1 / 9:16 / 16:9 görseller",
      "Lokasyon + hedef kitle optimizasyonu",
      "Haftalık performans özeti",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    tagline: "Bölgede liderlik",
    price: 4990,
    durationDays: 30,
    dailyBudget: 140,
    recommended: false,
    features: [
      "30 gün yayın",
      "Öncelikli yayına alma",
      "Genişletilmiş A/B testi",
      "Vitrin sayfası dahil yönlendirme",
      "Dönüşüm odaklı metin revizyonu",
    ],
  },
] as const;

export type AdPackageId = (typeof AD_PACKAGES)[number]["id"];

export function getAdPackage(id: string | undefined) {
  return AD_PACKAGES.find((pkg) => pkg.id === id) ?? AD_PACKAGES[0];
}

/** Wizard adım sırası */
export const CAMPAIGN_WIZARD_STEPS = [
  { id: "identity", title: "İşletme", hint: "Kim olduğunuzu tanımlayın" },
  { id: "location", title: "Lokasyon", hint: "Nerede hizmet veriyorsunuz?" },
  { id: "audience", title: "Hedef Kitle", hint: "Kime ulaşmak istiyorsunuz?" },
  { id: "platforms", title: "Platform", hint: "Meta Ads mi, Google Ads mi?" },
  { id: "budget", title: "Paket", hint: "Ne kadar ödeyeceğinizi seçin" },
  { id: "offer", title: "Teklif Metni", hint: "Ne satıyorsunuz?" },
  { id: "creative", title: "Görsel", hint: "Reklam görsellerinizi hazırlayın" },
  { id: "variations", title: "Varyasyonlar", hint: "A/B test metinlerini onaylayın" },
] as const;

/**
 * Kartvizit/Menü/Shorts araç setinin (ayrı bir Next.js projesi, bkz.
 * `dijital-kartvizit-menu/`) canlı adresi. Reklamını veren işletmelere bu
 * araçları önermek için showcase sayfalarında ve ana demo sayfasında
 * kullanılır (bkz. `components/showcase/ToolsPromo.tsx`).
 *
 * Prod'da `NEXT_PUBLIC_TOOLS_SITE_URL` ortam değişkenini gerçek deploy
 * adresine ayarlayın (bkz. `.env.example`). Yerelde iki projeyi aynı anda
 * çalıştırırken ikinci projeyi farklı bir portta başlatın, örn:
 * `npm run dev -- -p 3001` (dijital-kartvizit-menu klasöründe).
 */
export const TOOLS_SITE_URL = process.env.NEXT_PUBLIC_TOOLS_SITE_URL || "http://localhost:3001";
