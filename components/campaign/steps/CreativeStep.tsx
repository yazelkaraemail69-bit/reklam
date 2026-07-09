"use client";

import { useRef, useState } from "react";
import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { compressImageFile, fileToDataUrl } from "@/lib/client-image";
import { cropAllAspectRatios } from "@/lib/crop-image";
import { Button } from "@/components/ui/Button";
import { ImageIcon, LoaderIcon } from "@/components/ui/icons";
import { AdImageCropper } from "@/components/campaign/AdImageCropper";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function CreativeStep({ draft, onChange }: StepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      const compressed = await compressImageFile(file);
      const dataUrl = await fileToDataUrl(compressed);
      onChange({ sourceImageUrl: dataUrl, croppedImages: {} });
      const cropped = await cropAllAspectRatios(dataUrl);
      onChange({ sourceImageUrl: dataUrl, croppedImages: cropped });
    } catch {
      setError("Görsel işlenemedi. Başka bir fotoğraf deneyin.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Reklam görselinizi hazırlayın</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tek fotoğraf yükleyin; Instagram (1:1), Reels (9:16) ve Google Ads (16:9) için otomatik
          kırpılsın.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-brand hover:bg-brand-50"
      >
        {processing ? (
          <LoaderIcon className="h-8 w-8 text-brand" />
        ) : (
          <ImageIcon className="h-8 w-8 text-brand-dark" />
        )}
        <span className="font-bold text-emerald-950">
          {draft.sourceImageUrl ? "Görseli değiştir" : "Görsel yükle"}
        </span>
        <span className="text-xs text-slate-500">JPG, PNG · otomatik sıkıştırma ve kırpma</span>
      </button>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <AdImageCropper
        sourceUrl={draft.sourceImageUrl}
        croppedImages={draft.croppedImages}
        isProcessing={processing}
      />

      {draft.sourceImageUrl ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processing}
            onClick={async () => {
              setProcessing(true);
              try {
                const cropped = await cropAllAspectRatios(draft.sourceImageUrl);
                onChange({ croppedImages: cropped });
              } finally {
                setProcessing(false);
              }
            }}
          >
            Ortalayarak yeniden kırp
          </Button>
        </div>
      ) : null}

      <CroTip>
        Yüz, ürün veya mekan net görünsün. Metin dolu afişler küçük ekranda okunmaz — sade görsel
        + reklam metni daha iyi dönüşüm getirir.
      </CroTip>
    </div>
  );
}
