"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import type { AdPlatform } from "@/lib/types";
import { AD_PLATFORMS } from "@/lib/constants";
import { CroTip } from "@/components/campaign/CroTip";
import { cn } from "@/lib/utils";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function PlatformsStep({ draft, onChange }: StepProps) {
  function toggle(platform: AdPlatform) {
    const selected = draft.platforms.includes(platform);
    if (selected) {
      // En az bir platform kalsın
      if (draft.platforms.length === 1) return;
      onChange({ platforms: draft.platforms.filter((p) => p !== platform) });
      return;
    }
    onChange({ platforms: [...draft.platforms, platform] });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Nerede yayınlansın?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Meta Ads veya Google Ads seçin — ikisini birden de seçebilirsiniz. Siz Ads paneline
          girmezsiniz; ekibimiz seçtiğiniz platformda kampanyayı açar.
        </p>
      </div>

      <div className="grid gap-4">
        {AD_PLATFORMS.map((platform) => {
          const checked = draft.platforms.includes(platform.value);
          return (
            <button
              key={platform.value}
              type="button"
              onClick={() => toggle(platform.value)}
              aria-pressed={checked}
              className={cn(
                "rounded-2xl border p-5 text-left transition-colors",
                checked
                  ? "border-brand bg-brand-50 ring-2 ring-brand/30"
                  : "border-slate-200 bg-white hover:border-brand/40"
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold",
                    checked
                      ? "border-brand bg-brand text-white"
                      : "border-slate-300 bg-white text-transparent"
                  )}
                >
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-lg font-black text-emerald-950">{platform.label}</p>
                    <p className="text-sm font-semibold text-brand-dark">{platform.shortLabel}</p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{platform.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {platform.channels.map((channel) => (
                      <span
                        key={channel}
                        className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    En uygun: {platform.bestFor}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <CroTip title="Nasıl seçmeliyim?">
        Yerel esnaf ve WhatsApp mesajı için önce <strong>Meta Ads</strong>. Site / vitrin trafiği
        ve bilinirlik için <strong>Google Ads</strong> ekleyin. İkisini seçerseniz bütçe paketiniz
        her iki kanala da dağıtılır.
      </CroTip>
    </div>
  );
}
