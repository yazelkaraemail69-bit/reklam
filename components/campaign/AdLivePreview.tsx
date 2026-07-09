"use client";

import { useState } from "react";
import type { AdCta, AdVariationInput } from "@/lib/types";
import { AD_CTAS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PreviewMode = "feed" | "story";

interface AdLivePreviewProps {
  businessName: string;
  imageUrl?: string;
  croppedFeed?: string;
  croppedStory?: string;
  variation?: Pick<AdVariationInput, "headline" | "primaryText" | "cta"> | null;
  rawOfferText?: string;
}

function ctaLabel(cta?: AdCta): string {
  if (!cta) return "Daha Fazla Bilgi";
  return AD_CTAS.find((item) => item.value === cta)?.label ?? "Daha Fazla Bilgi";
}

export function AdLivePreview({
  businessName,
  imageUrl,
  croppedFeed,
  croppedStory,
  variation,
  rawOfferText,
}: AdLivePreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("feed");
  const headline = variation?.headline || businessName || "İşletme Adınız";
  const body =
    variation?.primaryText ||
    rawOfferText ||
    "Teklif metniniz ve görseliniz burada Instagram reklamı gibi görünecek.";
  const feedSrc = croppedFeed || imageUrl;
  const storySrc = croppedStory || imageUrl;
  const src = mode === "feed" ? feedSrc : storySrc;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-emerald-950">Canlı önizleme</p>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("feed")}
            className={cn(
              "rounded-md px-2.5 py-1 transition-colors",
              mode === "feed" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            Akış
          </button>
          <button
            type="button"
            onClick={() => setMode("story")}
            className={cn(
              "rounded-md px-2.5 py-1 transition-colors",
              mode === "story" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            Hikâye
          </button>
        </div>
      </div>

      {mode === "feed" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-[10px] font-black text-white">
              {(businessName || "R").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {businessName || "isletmeniz"}
              </p>
              <p className="text-[10px] text-slate-400">Sponsorlu</p>
            </div>
            <span className="text-slate-400">···</span>
          </div>
          <div className="relative aspect-square bg-slate-100">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="Reklam önizleme" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-xs text-slate-400">
                Görsel yükleyince burada görünecek
              </div>
            )}
          </div>
          <div className="space-y-2 px-3 py-3">
            <p className="text-sm font-bold leading-snug text-slate-900">{headline}</p>
            <p className="line-clamp-3 text-xs leading-5 text-slate-600">{body}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Instagram
              </span>
              <span className="rounded-md bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand-dark">
                {ctaLabel(variation?.cta)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[1.5rem] border-4 border-slate-900 bg-slate-900 shadow-lg">
          <div className="relative aspect-[9/16] bg-slate-800">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="Hikâye önizleme" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-[11px] text-white/50">
                Hikâye görseli burada
              </div>
            )}
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent px-3 pb-8 pt-3">
              <div className="mb-2 h-0.5 rounded-full bg-white/40">
                <div className="h-full w-1/3 rounded-full bg-white" />
              </div>
              <p className="truncate text-[11px] font-bold text-white">
                {businessName || "isletmeniz"}
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-4 pt-10">
              <p className="text-sm font-bold leading-snug text-white">{headline}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/85">{body}</p>
              <div className="mt-3 rounded-full bg-white py-2 text-center text-xs font-bold text-slate-900">
                {ctaLabel(variation?.cta)}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-500">
        Önizleme yaklaşıktır; gerçek yayın Meta hesabınızda açılır.
      </p>
    </div>
  );
}
