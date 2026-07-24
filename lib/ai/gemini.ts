import type { GoogleAdsConfig } from "../types";

/**
 * Google Gemini 1.5 Flash AI Engine (%100 Ücretsiz Google AI Studio API).
 * Esnafın girdiği ham tekliften yüksek performanslı reklam metinleri, başlıklar ve anahtar kelimeler üretir.
 */
export async function generateWithGemini(input: {
  businessName?: string;
  category?: string;
  city?: string;
  rawOfferText: string;
}): Promise<GoogleAdsConfig | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const prompt = `Sen uzman bir dijital reklam metin yazarısın. Aşağıdaki işletme bilgilerinden Google Ads Dinamik Arama Reklamı (RSA) için JSON formatında veri üret.
İşletme Adı: ${input.businessName || "İşletme"}
Kategori: ${input.category || "Genel"}
Şehir: ${input.city || "Türkiye"}
Teklif/Kampanya Metni: ${input.rawOfferText}

Aşağıdaki JSON şemasına BİREBİR UYGUN ve SADECE JSON verisi döndür (markdown kod bloğu yazma):
{
  "headlines": [15 adet başlık. Her biri KESİNLİKLE maksimum 30 karakter olmalı],
  "descriptions": [4 adet açıklama. Her biri KESİNLİKLE maksimum 90 karakter olmalı],
  "keywords": [{"text": "anahtar kelime", "matchType": "PHRASE"} formatında 10-15 adet kelime],
  "negativeKeywords": ["ücretsiz", "bedava", "şikayet", "ik", "iş ilanları"],
  "sitelinks": [{"linkText": "max 25 karakter", "description1": "max 35 karakter", "description2": "max 35 karakter"}]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[Gemini AI Error]: Response not ok", await res.text());
      return null;
    }

    const data = await res.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean JSON response
    const cleanJson = candidateText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Validate headline character limits (<= 30)
    const headlines = (parsed.headlines || []).map((h: string) =>
      h.trim().length <= 30 ? h.trim() : h.trim().slice(0, 29) + "…"
    );

    // Validate description character limits (<= 90)
    const descriptions = (parsed.descriptions || []).map((d: string) =>
      d.trim().length <= 90 ? d.trim() : d.trim().slice(0, 89) + "…"
    );

    return {
      headlines,
      descriptions,
      keywords: parsed.keywords || [],
      negativeKeywords: parsed.negativeKeywords || ["ücretsiz", "bedava"],
      sitelinks: parsed.sitelinks || [],
    };
  } catch (error) {
    console.error("[Gemini AI Generation Error]:", error);
    return null;
  }
}
