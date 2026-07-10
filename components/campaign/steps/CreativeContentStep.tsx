"use client";

import { useRef, useState } from "react";
import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { compressImageFile, fileToDataUrl } from "@/lib/client-image";
import { cropAllAspectRatios } from "@/lib/crop-image";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ImageIcon, LoaderIcon } from "@/components/ui/icons";
import { AdImageCropper } from "@/components/campaign/AdImageCropper";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function CreativeContentStep({ draft, onChange }: StepProps) {
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
      // Hikâye/logo için varsayılan: sığdır (contain) — kare logolar kesilmesin
      const cropped = await cropAllAspectRatios(dataUrl, {
        mode: "contain",
        background: "#ffffff",
      });
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
        <h2 className="text-xl font-black text-emerald-950">Teklif ve görsel</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ne sattığınızı yazın, bir fotoğraf veya logo yükleyin. Hikâye boyutu için
          &quot;Logoyu sığdır&quot; ile çerçeveye oturtun.
        </p>
      </div>

      <Textarea
        label="Teklif / hizmet metni"
        required
        rows={4}
        value={draft.rawOfferText}
        onChange={(e) => onChange({ rawOfferText: e.target.value })}
        placeholder="Örn. Kadıköy'de profesyonel cilt bakımı. İlk seansa %20 indirim. WhatsApp'tan aynı gün randevu."
      />

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
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-brand hover:bg-brand-50"
      >
        {processing ? (
          <LoaderIcon className="h-8 w-8 text-brand" />
        ) : (
          <ImageIcon className="h-8 w-8 text-brand-dark" />
        )}
        <span className="font-bold text-emerald-950">
          {draft.sourceImageUrl ? "Görseli değiştir" : "Görsel / logo yükle"}
        </span>
        <span className="text-xs text-slate-500">JPG, PNG · otomatik sıkıştırma ve formatlama</span>
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
        onCroppedChange={(croppedImages) => onChange({ croppedImages })}
      />

      {draft.sourceImageUrl ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processing}
            onClick={async () => {
              setProcessing(true);
              try {
                const cropped = await cropAllAspectRatios(draft.sourceImageUrl, {
                  mode: "contain",
                  background: "#ffffff",
                });
                onChange({ croppedImages: cropped });
              } finally {
                setProcessing(false);
              }
            }}
          >
            Tümünü logoya göre sığdır
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processing}
            onClick={async () => {
              setProcessing(true);
              try {
                const cropped = await cropAllAspectRatios(draft.sourceImageUrl, {
                  mode: "cover",
                });
                onChange({ croppedImages: cropped });
              } finally {
                setProcessing(false);
              }
            }}
          >
            Tümünü doldurarak kırp
          </Button>
        </div>
      ) : null}

      <CroTip>
        Logo kullanıyorsanız Hikâye (9:16) kartında &quot;Logoyu sığdır / ayarla&quot;ya tıklayın —
        arka plan rengi ve boyutu ayarlayabilirsiniz.
      </CroTip>
    </div>
  );
}
