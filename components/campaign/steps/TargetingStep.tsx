"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import type { AdPlatform, CampaignObjective } from "@/lib/types";
import { AD_PLATFORMS, CAMPAIGN_OBJECTIVES } from "@/lib/constants";
import { Textarea } from "@/components/ui/Textarea";
import { CroTip } from "@/components/campaign/CroTip";
import { cn } from "@/lib/utils";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function TargetingStep({ draft, onChange }: StepProps) {
  function toggle(platform: AdPlatform) {
    const selected = draft.platforms.includes(platform);
    if (selected) {
      if (draft.platforms.length === 1) return;
      onChange({ platforms: draft.platforms.filter((p) => p !== platform) });
      return;
    }
    onChange({ platforms: [...draft.platforms, platform] });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Kime ve nerede?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Varsayılan: WhatsApp mesajı + Meta Ads. Çoğu yerel işletme için en doğru başlangıç.
        </p>
      </div>

      <Textarea
        label="Hedef kitle"
        required
        rows={3}
        value={draft.targetAudience}
        onChange={(e) => onChange({ targetAudience: e.target.value })}
        placeholder="Örn. 25-40 yaş kadınlar, cilt bakımı arayan, Anadolu yakası"
      />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-emerald-950">Kampanya hedefi</p>
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

      <div className="space-y-2">
        <p className="text-sm font-semibold text-emerald-950">Yayın kanalı</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {AD_PLATFORMS.map((platform) => {
            const checked = draft.platforms.includes(platform.value);
            return (
              <button
                key={platform.value}
                type="button"
                onClick={() => toggle(platform.value)}
                aria-pressed={checked}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  checked
                    ? "border-brand bg-brand-50 ring-2 ring-brand/30"
                    : "border-slate-200 bg-white hover:border-brand/40"
                )}
              >
                <p className="font-bold text-emerald-950">{platform.shortLabel}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{platform.bestFor}</p>
              </button>
            );
          })}
        </div>
      </div>

      <CroTip>
        Yerel esnaf için önce Meta + WhatsApp. Site trafiği istiyorsanız Google’ı da ekleyin.
      </CroTip>
    </div>
  );
}
