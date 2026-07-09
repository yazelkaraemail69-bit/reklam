import type { AdCta, CampaignObjective } from "@/lib/types";
import type {
  CopyGenerationRequest,
  CopyGenerationResult,
  CopyProvider,
  GeneratedCopyVariant,
} from "./types";

const CTA_BY_OBJECTIVE: Record<CampaignObjective, AdCta> = {
  messages: "whatsapp",
  leads: "get_offer",
  traffic: "learn_more",
  awareness: "learn_more",
};

function truncate(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trim()}…`;
}

/**
 * Kural tabanlı "satış odaklı" metin üretici.
 * Gerçek AI yokken wizard ve A/B akışını uçtan uca test etmeyi sağlar.
 * OpenAI/DeepSeek eklendiğinde `OpenAiCopyProvider` ile değiştirilir.
 */
export class MockCopyProvider implements CopyProvider {
  readonly id = "mock-template";

  async generate(request: CopyGenerationRequest): Promise<CopyGenerationResult> {
    const count = Math.min(Math.max(request.count ?? 3, 1), 5);
    const place = request.district
      ? `${request.district}, ${request.city}`
      : request.city || "bölgenizde";
    const offer = truncate(request.rawOfferText || "Hizmetlerimiz", 90);
    const audienceHint = truncate(request.targetAudience || "hedef kitleniz", 60);
    const cta = CTA_BY_OBJECTIVE[request.objective];
    const name = request.businessName || "İşletmeniz";

    const pool: GeneratedCopyVariant[] = [
      {
        label: "A",
        headline: truncate(`${place}'de ${name}`, 40),
        primaryText: truncate(
          `${offer} ${audienceHint} için özel fırsat. Hemen iletişime geçin, aynı gün dönüş alın.`,
          125
        ),
        cta,
        rationale: "Lokasyon + işletme adı — yerel aramalarda güven sinyali.",
      },
      {
        label: "B",
        headline: truncate(offer.includes("%") ? offer : `Özel Fırsat: ${offer}`, 40),
        primaryText: truncate(
          `${name} — ${place}. ${audienceHint}. Kısa süreli kampanya, yeriniz dolmadan yazın.`,
          125
        ),
        cta: request.objective === "messages" ? "whatsapp" : "get_offer",
        rationale: "Teklif / indirim odaklı — aciliyet ve somut fayda.",
      },
      {
        label: "C",
        headline: truncate(`Komşularınızın Tercihi: ${name}`, 40),
        primaryText: truncate(
          `${place} içinde güvenilir ${request.category || "hizmet"}. ${offer} Randevunuzu 1 dakikada alın.`,
          125
        ),
        cta: request.objective === "leads" ? "book_now" : cta,
        rationale: "Sosyal kanıt + kolay CTA — kararsız kitleyi iter.",
      },
      {
        label: "D",
        headline: truncate(`${request.category || "Hizmet"} — ${place}`, 40),
        primaryText: truncate(
          `${name}: ${offer} Hedef: ${audienceHint}. Bugün yazın, yarın başlayın.`,
          125
        ),
        cta: "call_now",
        rationale: "Kategori + şehir — keşif amaçlı gösterimlerde netlik.",
      },
      {
        label: "E",
        headline: truncate("Bugün Yer Ayırtın", 40),
        primaryText: truncate(
          `${name} (${place}). ${offer} ${audienceHint} için sınırlı kontenjan.`,
          125
        ),
        cta: "book_now",
        rationale: "Kıtlık / aciliyet — randevu dönüşümüne baskı.",
      },
    ];

    return {
      variants: pool.slice(0, count),
      provider: this.id,
    };
  }
}
