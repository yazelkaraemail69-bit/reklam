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

// Reklam gücü hesaplama yardımcı fonksiyonu
function calculateAdStrength(headline: string, primaryText: string, cta: string) {
  let score = 0;
  const tips: string[] = [];

  // Başlık kriteri
  const hl = headline.trim();
  if (hl.length >= 15 && hl.length <= 40) {
    score += 30;
  } else if (hl.length > 0) {
    score += 15;
    tips.push("Başlık ideal uzunlukta değil (15-40 karakter önerilir).");
  } else {
    tips.push("Lütfen bir başlık girin.");
  }

  // Açıklama/Ana metin kriteri
  const pt = primaryText.trim();
  if (pt.length >= 40 && pt.length <= 120) {
    score += 40;
  } else if (pt.length > 0) {
    score += 20;
    tips.push("Ana metin çok kısa veya uzun (40-120 karakter önerilir).");
  } else {
    tips.push("Lütfen ana metin açıklamasını girin.");
  }

  // Emoji kriteri (Sosyal medya reklamlarında dönüşüm artırır)
  const hasEmoji = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(hl + pt);
  if (hasEmoji) {
    score += 20;
  } else {
    tips.push("💡 Dikkat çekmek için metne veya başlığa en az bir emoji ekleyin.");
  }

  // Özel Çağrı Butonu kriteri
  if (cta && cta !== "learn_more") {
    score += 10;
  } else {
    tips.push("💡 Satışları artırmak için WhatsApp veya Randevu Al gibi doğrudan bir eylem seçin.");
  }

  let label = "Zayıf";
  let color = "bg-red-500";
  let textColor = "text-red-700";
  let bgColor = "bg-red-50";

  if (score >= 80) {
    label = "Mükemmel";
    color = "bg-brand";
    textColor = "text-brand-dark font-extrabold";
    bgColor = "bg-brand-50/50";
  } else if (score >= 50) {
    label = "Orta";
    color = "bg-amber-500";
    textColor = "text-amber-700 font-bold";
    bgColor = "bg-amber-50/50";
  }

  return { score, label, color, textColor, bgColor, tips };
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
          <LoaderIcon className="mx-auto h-8 w-8 text-brand animate-spin" />
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
        {draft.variations.map((variation, index) => {
          const strength = calculateAdStrength(
            variation.headline || "",
            variation.primaryText || "",
            variation.cta || ""
          );

          return (
            <div
              key={`${variation.label}-${index}`}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
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
              </div>

              <Input
                label="Başlık"
                value={variation.headline}
                onChange={(e) => updateVariation(index, { headline: e.target.value })}
                maxLength={60}
                placeholder="reklam başlığı yazın"
              />
              <Textarea
                label="Ana metin"
                rows={3}
                value={variation.primaryText}
                onChange={(e) => updateVariation(index, { primaryText: e.target.value })}
                maxLength={150}
                placeholder="reklam ana açıklaması yazın"
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

              {/* Reklam Gücü Ölçer */}
              <div className={`rounded-xl border border-slate-200/60 p-3 ${strength.bgColor} transition-all duration-300`}>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span className="uppercase tracking-wide">REKLAM GÜCÜ ANALİZİ</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${strength.textColor}`}>
                    {strength.label} ({strength.score}/100)
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                {strength.tips.length > 0 ? (
                  <ul className="mt-2.5 space-y-1 text-[10px] text-slate-500 pl-1 list-none font-medium">
                    {strength.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[10px] font-bold text-brand-dark flex items-center gap-1">
                    ✨ Mükemmel! Reklam metinleri dönüşüm için son derece optimize edilmiş görünüyor.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CroTip>
        En az 2 varyasyonu aynı anda yayınlayın; birkaç gün sonra mesaj oranına göre kazananı seçin.
      </CroTip>
    </div>
  );
}
