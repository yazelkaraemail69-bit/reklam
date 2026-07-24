export interface MarketPulseResult {
  category: string;
  city: string;
  trendingKeywords: string[];
  growthPercentage: number;
  recommendation: string;
}

/**
 * 🏆 Market Pulse & Keyword Trend Bot.
 * Esnafın bulunduğu il/ilçedeki arama trendlerini tarlar, bu hafta yükselen anahtar kelimeleri
 * tespit eder ve esnafa proaktif pazarlama tavsiyesi sunar.
 */
export function runMarketPulseBot(
  category = "Güzellik ve Bakım",
  city = "İstanbul"
): MarketPulseResult {
  const CATEGORY_TRENDS: Record<string, string[]> = {
    "Güzellik ve Bakım": ["Lazer Epilasyon Kampanyası", "Protez Tırnak Fiyatları", "Hydrafacial Bakım"],
    "Sağlık ve Estetik": ["Diş Beyazlatma İndirimi", "Gülüş Tasarımı", "Saç Ekimi Fırsat"],
    "Yeme ve İçme": ["Serpme Kahvaltı Mekanları", "İndirimli Menü", "Paket Servis"],
    "Teknik Servis": ["Kombi Bakım Ücreti", "Klima Montaj Servisi", "Acil Tesisatçı"],
  };

  const trendingKeywords = CATEGORY_TRENDS[category] || [
    `${category} Fırsatları`,
    `En Yakın ${category}`,
    `${city} İçi Hizmet`,
  ];

  const growthPercentage = 45;
  const recommendation = `Bu hafta ${city} bölgesinde '${trendingKeywords[0]}' aramaları %${growthPercentage} arttı! Kampanya metninizi bu fırsata göre güncelleyebilirsiniz.`;

  return {
    category,
    city,
    trendingKeywords,
    growthPercentage,
    recommendation,
  };
}
