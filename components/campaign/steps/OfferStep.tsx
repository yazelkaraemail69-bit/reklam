"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { Textarea } from "@/components/ui/Textarea";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function OfferStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Ne satıyorsunuz?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ham metninizi yazın; bir sonraki adımlarda satış odaklı sloganlara dönüştüreceğiz.
        </p>
      </div>

      <Textarea
        label="Teklif / hizmet metni"
        required
        rows={5}
        value={draft.rawOfferText}
        onChange={(e) => onChange({ rawOfferText: e.target.value })}
        placeholder="Örn. Kadıköy'de profesyonel cilt bakımı. İlk seansa %20 indirim. WhatsApp'tan aynı gün randevu."
      />

      <CroTip title="Satış odaklı yazım">
        <ul className="list-disc space-y-1 pl-4">
          <li>Somut fayda yazın (ne kazanacak?)</li>
          <li>İndirim, süre veya kontenjan ekleyin (aciliyet)</li>
          <li>Nasıl iletişime geçileceğini ima edin (WhatsApp, ara, randevu)</li>
        </ul>
      </CroTip>
    </div>
  );
}
