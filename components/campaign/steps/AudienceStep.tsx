"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import type { CampaignObjective } from "@/lib/types";
import { CAMPAIGN_OBJECTIVES } from "@/lib/constants";
import { Textarea } from "@/components/ui/Textarea";
import { CroTip } from "@/components/campaign/CroTip";
import { cn } from "@/lib/utils";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function AudienceStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Kime ulaşmak istiyorsunuz?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Hedef kitle net değilse reklam bütçesi yanlış kişilere gider.
        </p>
      </div>

      <Textarea
        label="Hedef kitle"
        required
        rows={3}
        value={draft.targetAudience}
        onChange={(e) => onChange({ targetAudience: e.target.value })}
        placeholder="Örn. 25-40 yaş kadınlar, cilt bakımı ve kaş tasarımı arayan, Anadolu yakası"
      />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-emerald-950">
          Kampanya hedefi <span className="text-red-600">*</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAMPAIGN_OBJECTIVES.map((item) => {
            const selected = draft.objective === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange({ objective: item.value as CampaignObjective })}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  selected
                    ? "border-brand bg-brand-50 ring-2 ring-brand/30"
                    : "border-slate-200 bg-white hover:border-brand/40"
                )}
              >
                <p className="font-bold text-emerald-950">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <CroTip>
        Yaş, cinsiyet ve ihtiyacı yazın. &quot;Herkes&quot; diye hedeflemek en pahalı hatadır. Örn:
        25-40 yaş kadın, cilt bakımı arayan.
      </CroTip>
    </div>
  );
}
