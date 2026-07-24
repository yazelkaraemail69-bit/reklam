/**
 * OpenStreetMap & Nominatim Geocoding API (%100 Ücretsiz & Açık Kaynak Harita Servisi).
 * Esnafın adresini harita koordinatlarına (Enlem / Boylam) çevirir
 * ve vitrin sayfasında gösterilmek üzere ücretsiz embed harita URL'si üretir.
 */

export interface GeoLocation {
  lat: number;
  lon: number;
  displayName: string;
}

/**
 * Adres metninden enlem/boylam bulur.
 */
export async function geocodeAddress(addressText: string): Promise<GeoLocation | null> {
  if (!addressText || addressText.trim().length === 0) {
    return null;
  }

  try {
    const query = encodeURIComponent(addressText);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ReklamVitrini/1.0",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const first = data[0];
    return {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch (error) {
    console.error("[OSM Geocoding Error]:", error);
    return null;
  }
}

/**
 * Enlem ve Boylam verisinden OpenStreetMap Embed harita URL'si üretir.
 */
export function getOSMEmbedUrl(lat: number, lon: number, zoom = 15): string {
  const bboxDelta = 0.005;
  const left = lon - bboxDelta;
  const bottom = lat - bboxDelta;
  const right = lon + bboxDelta;
  const top = lat + bboxDelta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${lat},${lon}`;
}
