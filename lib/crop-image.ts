import type { AdAspectRatio } from "@/lib/types";
import { AD_ASPECT_RATIOS } from "@/lib/constants";

export interface CropRect {
  /** Kaynak görsel üzerinde kırpılacak alan (piksel) */
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageFitMode = "cover" | "contain";

export interface FitImageOptions {
  mode?: ImageFitMode;
  /** contain modunda boşluk rengi */
  background?: string;
  /** -1..1 arası kaydırma (cover/contain) */
  offsetX?: number;
  offsetY?: number;
  /** 0.5..2 ekstra ölçek */
  scale?: number;
}

/** Verilen aspect ratio için görselin ortasından maksimum kırpma dikdörtgeni */
export function centerCropRect(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: AdAspectRatio
): CropRect {
  const meta = AD_ASPECT_RATIOS.find((item) => item.value === aspectRatio);
  const target = meta ? meta.width / meta.height : 1;
  const imageAspect = imageWidth / imageHeight;

  if (imageAspect > target) {
    const width = imageHeight * target;
    return {
      x: (imageWidth - width) / 2,
      y: 0,
      width,
      height: imageHeight,
    };
  }

  const height = imageWidth / target;
  // Smart Top-Center Focus: Dikey fotoğraflarda insan başı ve tabela üst kısımdadır.
  // Üstten sadece %15 keser, kalan %85 kesintiyi alttan yapar.
  const y = Math.max(0, (imageHeight - height) * 0.15);
  return {
    x: 0,
    y,
    width: imageWidth,
    height,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Görsel okunamadı."));
    img.src = src;
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Kaynak görseli hedef orana göre üretir.
 * cover = çerçeveyi doldur (kenarlar kesilebilir)
 * contain = logoyu tamamen sığdır (boşluklar arka plan rengiyle dolar)
 */
export async function cropImageToDataUrl(
  sourceUrl: string,
  aspectRatio: AdAspectRatio,
  crop?: CropRect,
  outputMaxEdge = 1080,
  fit: FitImageOptions = {}
): Promise<string> {
  const mode = fit.mode ?? "cover";
  const img = await loadImage(sourceUrl);
  const meta = AD_ASPECT_RATIOS.find((item) => item.value === aspectRatio);
  const outW = meta?.width ?? 1080;
  const outH = meta?.height ?? 1080;
  const scaleOut = Math.min(1, outputMaxEdge / Math.max(outW, outH));
  const canvasW = Math.round(outW * scaleOut);
  const canvasH = Math.round(outH * scaleOut);

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor.");

  const userScale = clamp(fit.scale ?? 1, 0.5, 2.5);
  const offsetX = clamp(fit.offsetX ?? 0, -1, 1);
  const offsetY = clamp(fit.offsetY ?? 0, -1, 1);

  if (mode === "contain") {
    ctx.fillStyle = fit.background ?? "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);

    const fitScale =
      Math.min(canvasW / img.naturalWidth, canvasH / img.naturalHeight) * userScale;
    const drawW = img.naturalWidth * fitScale;
    const drawH = img.naturalHeight * fitScale;
    const maxShiftX = Math.max(0, (canvasW - drawW) / 2);
    const maxShiftY = Math.max(0, (canvasH - drawH) / 2);
    const dx = (canvasW - drawW) / 2 + offsetX * maxShiftX;
    const dy = (canvasH - drawH) / 2 + offsetY * maxShiftY;

    ctx.drawImage(img, dx, dy, drawW, drawH);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  // cover — mevcut davranış + kaydırma
  const rect = crop ?? centerCropRect(img.naturalWidth, img.naturalHeight, aspectRatio);
  const coverScale =
    Math.max(canvasW / rect.width, canvasH / rect.height) * userScale;
  const drawW = rect.width * coverScale;
  const drawH = rect.height * coverScale;
  const maxShiftX = Math.max(0, (drawW - canvasW) / 2);
  const maxShiftY = Math.max(0, (drawH - canvasH) / 2);
  const dx = (canvasW - drawW) / 2 - offsetX * maxShiftX;
  const dy = (canvasH - drawH) / 2 - offsetY * maxShiftY;

  ctx.drawImage(
    img,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    dx,
    dy,
    drawW,
    drawH
  );

  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function cropAllAspectRatios(
  sourceUrl: string,
  fit: FitImageOptions = {}
): Promise<Partial<Record<AdAspectRatio, string>>> {
  const ratios: AdAspectRatio[] = ["1:1", "9:16", "16:9"];
  const entries = await Promise.all(
    ratios.map(
      async (ratio) =>
        [ratio, await cropImageToDataUrl(sourceUrl, ratio, undefined, 1080, fit)] as const
    )
  );
  return Object.fromEntries(entries);
}
