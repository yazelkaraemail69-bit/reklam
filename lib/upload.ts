import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const hasBlob = Boolean(BLOB_TOKEN);

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_UPLOAD_PREFIX = "/uploads";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB (istemci tarafında zaten sıkıştırılıyor)

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function buildFileName(contentType: string): string {
  const ext = EXTENSION_BY_TYPE[contentType] ?? "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export function isPersistentUploadStorageConfigured(): boolean {
  return hasBlob;
}

/**
 * Yüklenen görsel dosyasını kalıcı depoya kaydeder ve herkese açık URL döner.
 * `BLOB_READ_WRITE_TOKEN` tanımlıysa Vercel Blob'a, aksi halde yerel
 * `public/uploads` klasörüne yazar (Vercel'de bu klasör salt-okunurdur; bu
 * yüzden production'da Blob önerilir — tıpkı `lib/store.ts`'teki Upstash
 * deseninde olduğu gibi).
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new UploadError("Sadece JPG, PNG, WEBP veya GIF formatında görsel yükleyebilirsiniz.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("Görsel boyutu en fazla 8 MB olabilir.");
  }

  const fileName = buildFileName(file.type);

  if (hasBlob) {
    const blob = await put(`shop-images/${fileName}`, file, {
      access: "public",
      contentType: file.type,
      token: BLOB_TOKEN,
    });
    return blob.url;
  }

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    return `${PUBLIC_UPLOAD_PREFIX}/${fileName}`;
  } catch {
    throw new UploadError(
      "Kalıcı görsel depolama yapılandırılmamış. Bu ortamda yüklenen görseller saklanamaz. Vercel projenizde Storage sekmesinden Blob bağlayın.",
      503
    );
  }
}
