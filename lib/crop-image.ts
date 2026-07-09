import type { AdAspectRatio } from "@/lib/types";
import { AD_ASPECT_RATIOS } from "@/lib/constants";

export interface CropRect {
  /** Kaynak görsel üzerinde kırpılacak alan (piksel) */
  x: number;
  y: number;
  width: number;
  height: number;
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
  return {
    x: 0,
    y: (imageHeight - height) / 2,
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

/**
 * Kaynak görseli verilen dikdörtgenden kırpıp hedef oranda data URL üretir.
 * Sadece tarayıcıda çalışır.
 */
export async function cropImageToDataUrl(
  sourceUrl: string,
  aspectRatio: AdAspectRatio,
  crop?: CropRect,
  outputMaxEdge = 1080
): Promise<string> {
  const img = await loadImage(sourceUrl);
  const rect = crop ?? centerCropRect(img.naturalWidth, img.naturalHeight, aspectRatio);
  const meta = AD_ASPECT_RATIOS.find((item) => item.value === aspectRatio);
  const outW = meta?.width ?? 1080;
  const outH = meta?.height ?? 1080;
  const scale = Math.min(1, outputMaxEdge / Math.max(outW, outH));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(outW * scale);
  canvas.height = Math.round(outH * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor.");

  ctx.drawImage(
    img,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function cropAllAspectRatios(
  sourceUrl: string
): Promise<Partial<Record<AdAspectRatio, string>>> {
  const ratios: AdAspectRatio[] = ["1:1", "9:16", "16:9"];
  const entries = await Promise.all(
    ratios.map(async (ratio) => [ratio, await cropImageToDataUrl(sourceUrl, ratio)] as const)
  );
  return Object.fromEntries(entries);
}
