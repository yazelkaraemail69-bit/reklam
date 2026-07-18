"use client";

import { useEffect, useState } from "react";
import type { AdCta, AdPlatform, AdVariationInput } from "@/lib/types";
import { AD_CTAS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PreviewMode = "feed" | "story" | "display";

interface AdLivePreviewProps {
  businessName: string;
  imageUrl?: string;
  croppedFeed?: string;
  croppedStory?: string;
  croppedLandscape?: string;
  platforms?: AdPlatform[];
  variation?: Pick<AdVariationInput, "headline" | "primaryText" | "cta"> | null;
  variations?: Pick<AdVariationInput, "headline" | "primaryText" | "cta" | "label">[];
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
  croppedLandscape,
  platforms = ["meta"],
  variation,
  variations = [],
  rawOfferText,
}: AdLivePreviewProps) {
  const hasMeta = platforms.includes("meta");
  const hasGoogle = platforms.includes("google");
  
  const [mode, setMode] = useState<PreviewMode>(hasMeta ? "feed" : "display");
  const [activeVarIdx, setActiveVarIdx] = useState(0);

  // Sync mode based on selected platforms
  useEffect(() => {
    if (mode === "display" && !hasGoogle) setMode("feed");
    if ((mode === "feed" || mode === "story") && !hasMeta && hasGoogle) setMode("display");
  }, [hasMeta, hasGoogle, mode]);

  // Sync active variation index if variations size changes
  useEffect(() => {
    if (variations.length > 0 && activeVarIdx >= variations.length) {
      setActiveVarIdx(0);
    }
  }, [variations, activeVarIdx]);

  // Resolve current active variation
  const activeVar =
    variations.length > 0 ? variations[activeVarIdx] : variation;

  const headline = activeVar?.headline || businessName || "İşletme Adınız";
  const body =
    activeVar?.primaryText ||
    rawOfferText ||
    "Teklif metniniz ve görseliniz burada reklam gibi görünecek.";
    
  const feedSrc = croppedFeed || imageUrl;
  const storySrc = croppedStory || imageUrl;
  const displaySrc = croppedLandscape || imageUrl;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-emerald-950">Canlı önizleme</p>

        {/* Varyasyon Seçici Sekmeler */}
        {variations.length > 1 ? (
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-[11px] font-bold">
            {variations.map((v, idx) => (
              <button
                key={v.label || idx}
                type="button"
                onClick={() => setActiveVarIdx(idx)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-center transition-all",
                  activeVarIdx === idx
                    ? "bg-white text-emerald-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Varyasyon {v.label || String.fromCharCode(65 + idx)}
              </button>
            ))}
          </div>
        ) : null}

        {/* Platform/Biçim Seçici Sekmeler */}
        <div className="flex flex-wrap rounded-xl border border-slate-200 bg-white p-1 text-[11px] font-bold">
          {hasMeta ? (
            <>
              <button
                type="button"
                onClick={() => setMode("feed")}
                className={cn(
                  "flex-1 rounded-lg py-1.5 transition-colors text-center",
                  mode === "feed" ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                IG Akış
              </button>
              <button
                type="button"
                onClick={() => setMode("story")}
                className={cn(
                  "flex-1 rounded-lg py-1.5 transition-colors text-center",
                  mode === "story" ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                Hikâye
              </button>
            </>
          ) : null}
          {hasGoogle ? (
            <button
              type="button"
              onClick={() => setMode("display")}
              className={cn(
                "flex-1 rounded-lg py-1.5 transition-colors text-center",
                mode === "display" ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              Google
            </button>
          ) : null}
        </div>
      </div>

      {/* Önizleme Kartları */}
      {mode === "feed" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-[10px] font-black text-white shadow-inner">
              {(businessName || "R").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {businessName || "isletmeniz"}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Sponsorlu · Meta Ads</p>
            </div>
          </div>
          <div className="relative aspect-square bg-slate-50 border-y border-slate-100">
            {feedSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={feedSrc} alt="Reklam önizleme" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-xs text-slate-400 font-medium">
                Görsel yükleyince burada görünecek
              </div>
            )}
          </div>
          <div className="space-y-2 px-4 py-3.5">
            <p className="text-sm font-black leading-snug text-slate-900">{headline}</p>
            <p className="line-clamp-3 text-xs leading-relaxed text-slate-600 font-medium">{body}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Instagram Feed
              </span>
              <span className="rounded-xl bg-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand-dark shadow-sm">
                {ctaLabel(activeVar?.cta)}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "story" ? (
        <div className="mx-auto w-full max-w-[240px] overflow-hidden rounded-[2rem] border-8 border-slate-950 bg-slate-950 shadow-xl ring-4 ring-brand/15">
          <div className="relative aspect-[9/16] bg-slate-900">
            {storySrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storySrc} alt="Hikâye önizleme" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-xs text-white/40 font-medium">
                Hikâye görseli burada
              </div>
            )}
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-3 pb-8 pt-4">
              <div className="mb-2 h-0.5 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-white animate-pulse" />
              </div>
              <p className="truncate text-[10px] font-bold text-white tracking-wide">
                {businessName || "isletmeniz"}
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-5 pt-12">
              <p className="text-sm font-black leading-snug text-white">{headline}</p>
              <p className="mt-1 line-clamp-3 text-[10px] leading-relaxed text-white/80 font-medium">{body}</p>
              <div className="mt-4 rounded-xl bg-white py-2 text-center text-xs font-bold text-slate-900 shadow-lg active:scale-95 transition-transform">
                {ctaLabel(activeVar?.cta)}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "display" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="relative aspect-video bg-slate-50 border-b border-slate-100">
            {displaySrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displaySrc} alt="Google Display önizleme" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-xs text-slate-400 font-medium">
                16:9 Google Display görseli
              </div>
            )}
          </div>
          <div className="space-y-2 px-4 py-3.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Google Ads · Display
            </p>
            <p className="text-sm font-black leading-snug text-slate-900">{headline}</p>
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium">{body}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Google Ağı</span>
              <span className="inline-block rounded-xl bg-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand-dark">
                {ctaLabel(activeVar?.cta)}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <p className="text-center text-[10px] text-slate-400 font-medium">
        Önizleme yaklaşıktır. Gerçek yayın seçtiğiniz Ads platformunda açılır.
      </p>
    </div>
  );
}
