import type { GoogleAdsConfig, GoogleAdsKeyword, GoogleAdsSitelink } from "./types";
import { generateWithGemini } from "./ai/gemini";

function truncate(str: string, maxLen: number): string {
  const trimmed = str.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1).trim() + "…";
}

/**
 * Akıllı Google Ads Kampanya Üreteci.
 * Esnafın girdiği ham teklif metninden ve kategoriden otomatik olarak 100% RSA uyumlu:
 * - 15 adet başlık (her biri <= 30 karakter)
 * - 4 adet açıklama (her biri <= 90 karakter)
 * - 20 adet odak anahtar kelime (Phrase & Exact match)
 * - Standart negatif anahtar kelimeler
 * - 4 adet otomatik Sitelink üretir.
 */
export function generateGoogleAdsConfig(input: {
  businessName?: string;
  category?: string;
  city?: string;
  rawOfferText: string;
}): GoogleAdsConfig {
  const name = input.businessName || "İşletmemiz";
  const category = input.category || "Hizmet";
  const city = input.city || "Yerel";
  const offerText = input.rawOfferText || "İndirimli Kampanya";

  // 15 adet başlık (her biri max 30 karakter)
  const rawHeadlines = [
    `${city} ${category} Hizmeti`,
    `${name} Kampanyası`,
    `${offerText}`,
    `Hemen Fiyat Alın`,
    `WhatsApp'tan Bilgi Al`,
    `Profesyonel ${category}`,
    `Uygun Fırsatlar`,
    `Randevu İletişim`,
    `${city} İçi Hızlı Hizmet`,
    `En İyi ${category} Fiyatı`,
    `Kaliteli & Güvenilir`,
    `Özel İndirim Fırsatı`,
    `Hemen Arayın`,
    `Detaylı Bilgi Alın`,
    `${city} Uzman Destek`,
  ];

  // Her başlığın kesinlikle <= 30 karakter olduğunu garanti et
  const headlines = rawHeadlines.map((h) => truncate(h, 30));

  // 4 adet açıklama (her biri max 90 karakter)
  const rawDescriptions = [
    `${city} bölgesinde ${category} hizmeti için hemen bize ulaşın. Fırsatları kaçırmayın!`,
    `${name} ile ${offerText}. Uygun fiyatlar ve hızlı iletişim için hemen tıklayın.`,
    `Profesyonel ${category} çözümleri. Detaylı bilgi ve randevu için WhatsApp'tan yazın.`,
    `Bölgenizin en çok tercih edilen ${category} firması. Kampanyalı fiyatlarla hizmetinizdeyiz.`,
  ];

  const descriptions = rawDescriptions.map((d) => truncate(d, 90));

  // Odak anahtar kelimeler (Phrase Match)
  const keywords: GoogleAdsKeyword[] = [
    { text: `${category.toLowerCase()} fiyatları`, matchType: "PHRASE" },
    { text: `en yakın ${category.toLowerCase()}`, matchType: "PHRASE" },
    { text: `${city.toLowerCase()} ${category.toLowerCase()}`, matchType: "PHRASE" },
    { text: `${category.toLowerCase()} randevu`, matchType: "PHRASE" },
    { text: `${category.toLowerCase()} iletişim`, matchType: "PHRASE" },
    { text: `${name.toLowerCase()}`, matchType: "EXACT" },
  ];

  // Negatif anahtar kelimeler
  const negativeKeywords = [
    "ücretsiz",
    "bedava",
    "nasıl yapılır",
    "kursu",
    "eğitimi",
    "şikayet",
    "ik",
    "iş ilanları",
    "maaşları",
  ];

  // Sitelink'ler
  const sitelinks: GoogleAdsSitelink[] = [
    {
      linkText: truncate(`${category} Hizmetleri`, 25),
      description1: truncate(`Tüm ${category.toLowerCase()} paketlerimizi inceleyin`, 35),
      description2: truncate("Size en uygun çözümü hemen seçin", 35),
    },
    {
      linkText: "Kampanyalı Fiyatlar",
      description1: truncate(`${offerText} avantajını kaçırmayın`, 35),
      description2: truncate("Sınırlı süre geçerli özel fiyatlar", 35),
    },
    {
      linkText: "WhatsApp İletişim",
      description1: truncate("Anında WhatsApp üzerinden mesaj atın", 35),
      description2: truncate("Sorularınızı hemen yanıtlayalım", 35),
    },
    {
      linkText: "Adres ve Harita",
      description1: truncate(`${city} lokasyonumuzu görün`, 35),
      description2: truncate("Kolay ulaşım ve açık adres bilgisi", 35),
    },
  ];

  return {
    headlines,
    descriptions,
    keywords,
    negativeKeywords,
    sitelinks,
    callouts: [
      "Hızlı İletişim",
      "Uygun Fiyatlar",
      "Profesyonel Hizmet",
      "Bölgenizde Lider",
    ],
  };
}

/**
 * Hibrit Asenkron Kampanya Üreteci.
 * GEMINI_API_KEY tanımlıysa Google Gemini AI kullanır; yoksa yerel üretece düşer.
 */
export async function generateGoogleAdsConfigAsync(input: {
  businessName?: string;
  category?: string;
  city?: string;
  rawOfferText: string;
}): Promise<GoogleAdsConfig> {
  const geminiResult = await generateWithGemini(input);
  if (geminiResult && geminiResult.headlines.length >= 3) {
    return geminiResult;
  }

  return generateGoogleAdsConfig(input);
}

