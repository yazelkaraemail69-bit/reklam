/**
 * Unsplash & Pexels Stok Görsel API Motoru (%100 Ücretsiz Stok Fotoğraf Servisi).
 * Görsel yüklemeyen esnafa kendi sektör ve kategorisine özel (berber, tesisatçı, lokanta)
 * yüksek çözünürlüklü telifsiz 4K kapak ve galeri görsellerini getirir.
 */

export interface StockPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  source: "unsplash" | "pexels" | "fallback";
}

/** Sektör bazlı varsayılan harika telifsiz Unsplash fotoğrafları (API Key yoksa bile çalışır) */
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  "Güzellik ve Bakım": [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
  ],
  "Sağlık ve Estetik": [
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  ],
  "Yeme ve İçme": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  ],
  "Teknik Servis": [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
  ],
  "Otomotiv": [
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  ],
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";

export async function searchStockPhotos(query: string, count = 3): Promise<StockPhoto[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (apiKey) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=${count}&orientation=landscape`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          return data.results.map((item: any) => ({
            id: item.id,
            url: item.urls?.regular || item.urls?.full,
            thumbnailUrl: item.urls?.small,
            photographer: item.user?.name || "Unsplash",
            source: "unsplash",
          }));
        }
      }
    } catch (error) {
      console.error("[Unsplash Stock Photos Error]:", error);
    }
  }

  // Fallback: Seçe uygun yüksek kaliteli statik stok fotoğraf dön
  const matched = CATEGORY_FALLBACKS[query] || [DEFAULT_COVER];
  return matched.map((url, index) => ({
    id: `fallback-${index}`,
    url,
    thumbnailUrl: url,
    photographer: "Unsplash Collection",
    source: "fallback",
  }));
}
