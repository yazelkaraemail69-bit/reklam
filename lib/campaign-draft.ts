import type {
  AdAspectRatio,
  AdVariationInput,
  CampaignInput,
  CampaignObjective,
} from "@/lib/types";
import { CAMPAIGN_WIZARD_STEPS } from "@/lib/constants";

export type WizardStepId = (typeof CAMPAIGN_WIZARD_STEPS)[number]["id"];

/**
 * Wizard boyunca tutulan taslak.
 * Campaign modeline ek olarak işletme kimliği alanlarını taşır
 * (AI metin ve A/B üretimi için gerekli bağlam).
 */
export interface CampaignWizardDraft {
  businessName: string;
  category: string;
  campaignName: string;
  objective: CampaignObjective;
  city: string;
  district: string;
  radiusKm: number;
  targetAudience: string;
  dailyBudget: number;
  totalBudget: number;
  rawOfferText: string;
  sourceImageUrl: string;
  /** Format bazlı kırpılmış görseller */
  croppedImages: Partial<Record<AdAspectRatio, string>>;
  variations: AdVariationInput[];
}

export const EMPTY_WIZARD_DRAFT: CampaignWizardDraft = {
  businessName: "",
  category: "",
  campaignName: "",
  objective: "messages",
  city: "",
  district: "",
  radiusKm: 10,
  targetAudience: "",
  dailyBudget: 100,
  totalBudget: 0,
  rawOfferText: "",
  sourceImageUrl: "",
  croppedImages: {},
  variations: [],
};

export function draftToCampaignInput(draft: CampaignWizardDraft): CampaignInput {
  const name =
    draft.campaignName.trim() ||
    `${draft.businessName.trim() || "Kampanya"} — ${draft.city.trim() || "Yerel"}`;

  return {
    name,
    objective: draft.objective,
    targetAudience: draft.targetAudience.trim(),
    dailyBudget: draft.dailyBudget,
    totalBudget: draft.totalBudget > 0 ? draft.totalBudget : undefined,
    location: {
      city: draft.city.trim(),
      district: draft.district.trim() || undefined,
      radiusKm: draft.radiusKm > 0 ? draft.radiusKm : undefined,
    },
    rawOfferText: draft.rawOfferText.trim(),
    sourceImageUrl: draft.sourceImageUrl || undefined,
    variations: draft.variations,
    status: draft.variations.length > 0 ? "ready" : "draft",
  };
}

export function validateWizardStep(
  stepId: WizardStepId,
  draft: CampaignWizardDraft
): string | null {
  switch (stepId) {
    case "identity":
      if (!draft.businessName.trim()) return "İşletme adını girin.";
      if (!draft.category.trim()) return "Kategori seçin.";
      return null;
    case "location":
      if (!draft.city.trim()) return "Şehir zorunludur — reklamlar lokasyona göre hedeflenir.";
      return null;
    case "audience":
      if (!draft.targetAudience.trim() || draft.targetAudience.trim().length < 10) {
        return "Hedef kitlenizi en az birkaç kelimeyle tanımlayın (yaş, cinsiyet, ihtiyaç).";
      }
      return null;
    case "budget":
      if (!Number.isFinite(draft.dailyBudget) || draft.dailyBudget < 50) {
        return "Günlük bütçe en az 50 TL olmalıdır (anlamlı test için).";
      }
      return null;
    case "offer":
      if (!draft.rawOfferText.trim() || draft.rawOfferText.trim().length < 15) {
        return "Ne sattığınızı / teklifinizi kısaca yazın (en az 15 karakter).";
      }
      return null;
    case "creative":
      if (!draft.sourceImageUrl) {
        return "En az bir görsel yükleyin — reklamsız görsel dönüşüm getirmez.";
      }
      return null;
    case "variations":
      if (draft.variations.length < 2) {
        return "A/B testi için en az 2 varyasyon gerekli. Metinleri yeniden üretin.";
      }
      if (draft.variations.some((v) => !v.headline.trim() || !v.primaryText.trim())) {
        return "Tüm varyasyonlarda başlık ve metin dolu olmalıdır.";
      }
      return null;
    default:
      return null;
  }
}
