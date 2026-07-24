import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";

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

function getBlobToken(): string | undefined {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token || undefined;
}

function buildFileName(contentType: string): string {
  const ext = EXTENSION_BY_TYPE[contentType] ?? "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export function isPersistentUploadStorageConfigured(): boolean {
  return Boolean(getBlobToken());
}

/**
 * Yüklenen görsel dosyasını kalıcı depoya kaydeder ve herkese açık URL döner.
 * `BLOB_READ_WRITE_TOKEN` tanımlıysa Vercel Blob'a, aksi halde yerel
 * `public/uploads` klasörüne yazar (Vercel'de bu klasör salt-okunurdur).
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new UploadError("Sadece JPG, PNG, WEBP veya GIF formatında görsel yükleyebilirsiniz.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("Görsel boyutu en fazla 8 MB olabilir.");
  }

  const fileName = buildFileName(file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  return saveImageBuffer(buffer, file.type, fileName);
}

async function saveImageBuffer(
  buffer: Buffer,
  contentType: string,
  fileName: string
): Promise<string> {
  const blobToken = getBlobToken();
  if (blobToken) {
    try {
      const blob = await put(`shop-images/${fileName}`, buffer, {
        access: "public",
        contentType,
        token: blobToken,
      });
      return blob.url;
    } catch (err) {
      console.warn(
        "[Vercel Blob Warning] Remote upload failed, falling back to local file storage:",
        err instanceof Error ? err.message : err
      );
    }
  }

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    return `${PUBLIC_UPLOAD_PREFIX}/${fileName}`;
  } catch {
    // Safe fallback: Return base64 data URL if local public/uploads directory is unwriteable
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  }
}

/**
 * data: URL veya http(s) URL alır.
 * data URL ise Blob/yerel depoya yazar ve kalıcı URL döner; aksi halde aynen bırakır.
 */
export async function persistImageReference(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  if (!url.startsWith("data:")) return url;

  const match = /^data:([^;]+);base64,(.+)$/i.exec(url);
  if (!match) {
    throw new UploadError("Geçersiz görsel verisi.");
  }

  const contentType = match[1].toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new UploadError("Sadece JPG, PNG, WEBP veya GIF formatında görsel yükleyebilirsiniz.");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new UploadError("Görsel boyutu en fazla 8 MB olabilir.");
  }

  return saveImageBuffer(buffer, contentType, buildFileName(contentType));
}
