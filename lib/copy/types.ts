import type { AdCta, AdVariationInput, CampaignObjective } from "@/lib/types";

/** AI / şablon sağlayıcıya giden ham girdi */
export interface CopyGenerationRequest {
  businessName: string;
  category: string;
  city: string;
  district?: string;
  objective: CampaignObjective;
  targetAudience: string;
  rawOfferText: string;
  /** Kaç varyasyon isteniyor (varsayılan 3) */
  count?: number;
}

export interface GeneratedCopyVariant {
  label: string;
  headline: string;
  primaryText: string;
  cta: AdCta;
  rationale?: string;
}

export interface CopyGenerationResult {
  variants: GeneratedCopyVariant[];
  provider: string;
}

/**
 * Modüler metin sağlayıcı arayüzü.
 * DeepSeek / OpenAI bağlandığında yalnızca yeni bir sınıf yazılır;
 * wizard ve API aynı arayüzü kullanmaya devam eder.
 */
export interface CopyProvider {
  readonly id: string;
  generate(request: CopyGenerationRequest): Promise<CopyGenerationResult>;
}

export function toAdVariationInputs(
  variants: GeneratedCopyVariant[],
  source: "template" | "ai" = "template"
): AdVariationInput[] {
  const ratios = ["1:1", "9:16", "16:9"] as const;
  return variants.map((variant, index) => ({
    label: variant.label || String.fromCharCode(65 + index),
    headline: variant.headline,
    primaryText: variant.primaryText,
    cta: variant.cta,
    aspectRatio: ratios[index % ratios.length],
    status: "draft" as const,
    source,
  }));
}
