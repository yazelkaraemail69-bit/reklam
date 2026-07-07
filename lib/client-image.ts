/** Sadece tarayıcıda çalışır. Büyük telefon fotoğraflarını yüklemeden önce
 * makul bir boyuta küçültüp sıkıştırarak hem yüklemeyi hızlandırır hem de
 * sunucu/işlev gövde boyutu sınırlarına takılmayı önler. */

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Görsel okunamadı."));
    img.src = src;
  });
}

export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Dosya okunamadı."));
      reader.readAsDataURL(file);
    });

    const img = await loadImage(dataUrl);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));

    // Zaten küçük ve PNG ise (muhtemelen logo/şeffaf görsel) olduğu gibi bırak.
    if (scale === 1 && file.type === "image/png") {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, JPEG_QUALITY)
    );

    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, outputType === "image/png" ? ".png" : ".jpg");
    return new File([blob], newName, { type: outputType });
  } catch {
    return file;
  }
}
