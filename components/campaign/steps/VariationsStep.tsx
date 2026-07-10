"use client";

import { useEffect, useRef, useState } from "react";
import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import type { AdCta, AdVariationInput } from "@/lib/types";
import { AD_CTAS } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LoaderIcon, SparklesIcon } from "@/components/ui/icons";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function VariationsStep({ draft, onChange }: StepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoStarted = useRef(false);

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/copy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: draft.businessName,
          category: draft.category,
          city: draft.city,
          district: draft.district,
          objective: draft.objective,
          targetAudience: draft.targetAudience,
          rawOfferText: draft.rawOfferText,
          count: 3,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Metinler üretilemedi.");
      onChange({ variations: data.variations as AdVariationInput[] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Metinler üretilemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoStarted.current) return;
    if (draft.variations.length >= 2) return;
    autoStarted.current = true;
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only auto-run once on mount
  }, []);

  function updateVariation(index: number, patch: Partial<AdVariationInput>) {
    const next = draft.variations.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    onChange({ variations: next });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-emerald-950">Reklam metinlerinizi onaylayın</h2>
          <p className="mt-1 text-sm text-slate-600">
            Metinler otomatik üretildi. İsterseniz düzenleyin; en az 2 varyasyon gerekli.
          </p>
        </div>
        <Button type="button" onClick={generate} disabled={loading}>
          {loading ? <LoaderIcon className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
          {draft.variations.length ? "Yeniden üret" : "Metinleri üret"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading && draft.variations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <LoaderIcon className="mx-auto h-8 w-8 text-brand" />
          <p className="mt-3 font-semibold text-slate-700">Metinler hazırlanıyor…</p>
        </div>
      ) : null}

      {draft.variations.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="font-semibold text-slate-700">Henüz varyasyon yok</p>
          <p className="mt-1 text-sm text-slate-500">
            &quot;Metinleri üret&quot; ile 3 satış odaklı alternatif oluşturun.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {draft.variations.map((variation, index) => (
          <div
            key={`${variation.label}-${index}`}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-brand-dark px-2.5 py-1 text-xs font-bold text-white">
                Varyasyon {variation.label}
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {variation.aspectRatio}
              </span>
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                {variation.source === "ai" ? "AI" : variation.source === "template" ? "Şablon" : "Manuel"}
              </span>
            </div>

            <Input
              label="Başlık"
              value={variation.headline}
              onChange={(e) => updateVariation(index, { headline: e.target.value })}
              maxLength={60}
            />
            <Textarea
              label="Ana metin"
              rows={3}
              value={variation.primaryText}
              onChange={(e) => updateVariation(index, { primaryText: e.target.value })}
              maxLength={150}
            />
            <Select
              label="Çağrı (CTA)"
              value={variation.cta}
              onChange={(e) => updateVariation(index, { cta: e.target.value as AdCta })}
            >
              {AD_CTAS.map((cta) => (
                <option key={cta.value} value={cta.value}>
                  {cta.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>

      <CroTip>
        En az 2 varyasyonu aynı anda yayınlayın; birkaç gün sonra mesaj oranına göre kazananı seçin.
      </CroTip>
    </div>
  );
}
