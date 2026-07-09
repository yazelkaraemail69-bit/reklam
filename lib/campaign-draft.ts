import type {
  AdAspectRatio,
  AdVariationInput,
  CampaignInput,
  CampaignObjective,
} from "@/lib/types";
import { CAMPAIGN_WIZARD_STEPS, getAdPackage, type AdPackageId } from "@/lib/constants";

export type WizardStepId = (typeof CAMPAIGN_WIZARD_STEPS)[number]["id"];

/**
 * Wizard boyunca tutulan taslak.
 * Campaign modeline ek olarak işletme kimliği alanlarını taşır
 * (AI metin ve A/B üretimi için gerekli bağlam).
 */
export interface CampaignWizardDraft {
  businessName: string;
  customerEmail: string;
  category: string;
  campaignName: string;
  objective: CampaignObjective;
  city: string;
  district: string;
  radiusKm: number;
  targetAudience: string;
  packageId: AdPackageId;
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
  customerEmail: "",
  category: "",
  campaignName: "",
  objective: "messages",
  city: "",
  district: "",
  radiusKm: 10,
  targetAudience: "",
  packageId: "growth",
  dailyBudget: 180,
  totalBudget: 2990,
  rawOfferText: "",
  sourceImageUrl: "",
  croppedImages: {},
  variations: [],
};

export function draftToCampaignInput(draft: CampaignWizardDraft): CampaignInput {
  const pkg = getAdPackage(draft.packageId);
  const name =
    draft.campaignName.trim() ||
    `${draft.businessName.trim() || "Kampanya"} — ${draft.city.trim() || "Yerel"}`;

  return {
    name,
    objective: draft.objective,
    targetAudience: draft.targetAudience.trim(),
    dailyBudget: pkg.dailyBudget,
    totalBudget: pkg.price,
    packageId: pkg.id,
    location: {
      city: draft.city.trim(),
      district: draft.district.trim() || undefined,
      radiusKm: draft.radiusKm > 0 ? draft.radiusKm : undefined,
    },
    rawOfferText: draft.rawOfferText.trim(),
    sourceImageUrl: draft.sourceImageUrl || undefined,
    variations: draft.variations,
    status: "pending_payment",
    customerEmail: draft.customerEmail.trim() || undefined,
  };
}

export function validateWizardStep(
  stepId: WizardStepId,
  draft: CampaignWizardDraft
): string | null {
  switch (stepId) {
    case "identity":
      if (!draft.businessName.trim()) return "İşletme adını girin.";
      if (!draft.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.customerEmail)) {
        return "Geçerli bir e-posta adresi girin — ödeme linki buraya gönderilir.";
      }
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
      if (!draft.packageId || !getAdPackage(draft.packageId)) {
        return "Bir reklam paketi seçin — ödeyeceğiniz tutar net olsun.";
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
