"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { AD_PACKAGES, type AdPackageId } from "@/lib/constants";
import { CroTip } from "@/components/campaign/CroTip";
import { cn } from "@/lib/utils";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetStep({ draft, onChange }: StepProps) {
  function selectPackage(id: AdPackageId) {
    const pkg = AD_PACKAGES.find((item) => item.id === id);
    if (!pkg) return;
    onChange({
      packageId: pkg.id,
      dailyBudget: pkg.dailyBudget,
      totalBudget: pkg.price,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Paketinizi seçin</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gizli ücret yok. Ne seçerseniz o kadar ödersiniz — kuruşu kuruşuna net.
        </p>
      </div>

      <div className="grid gap-4">
        {AD_PACKAGES.map((pkg) => {
          const selected = draft.packageId === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => selectPackage(pkg.id)}
              className={cn(
                "relative rounded-2xl border p-5 text-left transition-colors",
                selected
                  ? "border-brand bg-brand-50 ring-2 ring-brand/30"
                  : "border-slate-200 bg-white hover:border-brand/40"
              )}
            >
              {pkg.recommended ? (
                <span className="absolute -top-2.5 right-4 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  En çok tercih
                </span>
              ) : null}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-emerald-950">{pkg.name}</p>
                  <p className="text-sm text-slate-500">{pkg.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-brand-dark">{formatMoney(pkg.price)}</p>
                  <p className="text-xs text-slate-500">{pkg.durationDays} gün</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {pkg.features.map((feature) => (
                  <li key={feature} className="text-xs font-medium text-slate-600">
                    · {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <CroTip title="Nasıl çalışır?">
        Ödemeniz Iyzico ile alınır. Kampanyanız hazırlanır; ekibimiz 24 saat içinde Meta
        reklamlarınızı yayına alır. Gizli komisyon yok — paket fiyatı net tutardır.
      </CroTip>
    </div>
  );
}
