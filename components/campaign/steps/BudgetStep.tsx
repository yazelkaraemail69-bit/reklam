"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { Input } from "@/components/ui/Input";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function BudgetStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Ne kadar harcayabilirsiniz?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Küçük bütçeyle öğrenin; kazanan varyasyonu sonra ölçekleyin.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Günlük bütçe (TL)"
          required
          type="number"
          min={50}
          value={draft.dailyBudget}
          onChange={(e) => onChange({ dailyBudget: Number(e.target.value) || 0 })}
          hint="Önerilen başlangıç: 100–250 TL / gün"
        />
        <Input
          label="Toplam bütçe (TL, isteğe bağlı)"
          type="number"
          min={0}
          value={draft.totalBudget || ""}
          onChange={(e) => onChange({ totalBudget: Number(e.target.value) || 0 })}
          placeholder="Örn. 3000"
          hint="Dolarsanız kampanya bu tutarda durur."
        />
      </div>

      <CroTip>
        A/B testi için günlük bütçeyi en az 3–5 gün çalıştırın. İlk hafta öğrenme aşamasıdır —
        hemen kapatmayın, veri biriksin.
      </CroTip>
    </div>
  );
}
