"use client";

import type { AdAspectRatio } from "@/lib/types";
import { AD_ASPECT_RATIOS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AdImageCropperProps {
  sourceUrl?: string;
  croppedImages: Partial<Record<AdAspectRatio, string>>;
  isProcessing?: boolean;
}

export function AdImageCropper({
  sourceUrl,
  croppedImages,
  isProcessing,
}: AdImageCropperProps) {
  if (!sourceUrl && !Object.keys(croppedImages).length) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {AD_ASPECT_RATIOS.map((ratio) => {
        const src = croppedImages[ratio.value] || sourceUrl;
        const previewAspect =
          ratio.value === "1:1" ? "aspect-square" : ratio.value === "9:16" ? "aspect-[9/16]" : "aspect-video";

        return (
          <div key={ratio.value} className="space-y-2">
            <div>
              <p className="text-sm font-bold text-emerald-950">{ratio.label}</p>
              <p className="text-xs text-slate-500">{ratio.description}</p>
            </div>
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100",
                previewAspect,
                ratio.value === "9:16" && "max-h-64 mx-auto w-auto"
              )}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`${ratio.label} önizleme`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Önizleme yok
                </div>
              )}
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-semibold text-brand-dark">
                  Kırpılıyor…
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
