"use client";

import { useEffect, useState } from "react";
import type { AdAspectRatio } from "@/lib/types";
import { AD_ASPECT_RATIOS } from "@/lib/constants";
import { cropImageToDataUrl, type ImageFitMode } from "@/lib/crop-image";
import { Button } from "@/components/ui/Button";
import { LoaderIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const BG_PRESETS = [
  { id: "white", label: "Beyaz", value: "#ffffff" },
  { id: "black", label: "Siyah", value: "#0f172a" },
  { id: "brand", label: "Yeşil", value: "#064e3b" },
  { id: "cream", label: "Krem", value: "#f8fafc" },
] as const;

interface ImageFitEditorProps {
  sourceUrl: string;
  aspectRatio: AdAspectRatio;
  initialPreview?: string;
  onApply: (dataUrl: string) => void;
  onClose: () => void;
}

export function ImageFitEditor({
  sourceUrl,
  aspectRatio,
  initialPreview,
  onApply,
  onClose,
}: ImageFitEditorProps) {
  const meta = AD_ASPECT_RATIOS.find((item) => item.value === aspectRatio);
  const [mode, setMode] = useState<ImageFitMode>(
    aspectRatio === "9:16" ? "contain" : "cover"
  );
  const [background, setBackground] = useState("#ffffff");
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [preview, setPreview] = useState(initialPreview || sourceUrl);
  const [rendering, setRendering] = useState(false);
  const [applying, setApplying] = useState(false);

  const previewAspect =
    aspectRatio === "1:1"
      ? "aspect-square"
      : aspectRatio === "9:16"
        ? "aspect-[9/16]"
        : "aspect-video";

  useEffect(() => {
    let cancelled = false;
    setRendering(true);
    const timer = window.setTimeout(() => {
      void cropImageToDataUrl(sourceUrl, aspectRatio, undefined, 720, {
        mode,
        background,
        offsetX,
        offsetY,
        scale,
      })
        .then((url) => {
          if (!cancelled) setPreview(url);
        })
        .catch(() => {
          /* keep last preview */
        })
        .finally(() => {
          if (!cancelled) setRendering(false);
        });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [sourceUrl, aspectRatio, mode, background, offsetX, offsetY, scale]);

  async function handleApply() {
    setApplying(true);
    try {
      const url = await cropImageToDataUrl(sourceUrl, aspectRatio, undefined, 1080, {
        mode,
        background,
        offsetX,
        offsetY,
        scale,
      });
      onApply(url);
      onClose();
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Görsel sığdırma"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-emerald-950">
              {meta?.label ?? aspectRatio} ayarla
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Logo veya ürün görselini çerçeveye sığdırın. Hikâye için &quot;Sığdır&quot; önerilir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            Kapat
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <div
            className={cn(
              "relative w-full max-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100",
              previewAspect
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Sığdırma önizleme" className="h-full w-full object-cover" />
            {rendering ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <LoaderIcon className="h-5 w-5 text-brand" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-emerald-950">Yerleşim</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("contain")}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                  mode === "contain"
                    ? "border-brand bg-brand-50 ring-2 ring-brand/30"
                    : "border-slate-200 hover:border-brand/40"
                )}
              >
                <span className="font-bold text-emerald-950">Sığdır</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Logo tamamen görünsün
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode("cover")}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                  mode === "cover"
                    ? "border-brand bg-brand-50 ring-2 ring-brand/30"
                    : "border-slate-200 hover:border-brand/40"
                )}
              >
                <span className="font-bold text-emerald-950">Doldur</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Çerçeveyi kapla (kırpabilir)
                </span>
              </button>
            </div>
          </div>

          {mode === "contain" ? (
            <div>
              <p className="text-sm font-semibold text-emerald-950">Arka plan</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setBackground(preset.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold",
                      background === preset.value
                        ? "border-brand ring-2 ring-brand/30"
                        : "border-slate-200"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-slate-200"
                      style={{ background: preset.value }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <label className="block text-sm">
            <span className="font-semibold text-emerald-950">Boyut</span>
            <input
              type="range"
              min={0.6}
              max={1.8}
              step={0.02}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="mt-2 w-full accent-brand"
            />
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-emerald-950">Yatay kaydır</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.02}
              value={offsetX}
              onChange={(e) => setOffsetX(Number(e.target.value))}
              className="mt-2 w-full accent-brand"
            />
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-emerald-950">Dikey kaydır</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.02}
              value={offsetY}
              onChange={(e) => setOffsetY(Number(e.target.value))}
              className="mt-2 w-full accent-brand"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="button" onClick={handleApply} disabled={applying}>
            {applying ? <LoaderIcon className="h-4 w-4" /> : null}
            Uygula
          </Button>
        </div>
      </div>
    </div>
  );
}
