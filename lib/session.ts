import crypto from "crypto";
import type { SessionPayload } from "./types";

/**
 * Pure Node `crypto` based session helpers with NO dependency on `next/headers`.
 * Kept separate from `lib/auth.ts` so that `proxy.ts` (Next.js middleware) can
 * import it without accidentally bundling Server Component / Route Handler
 * only APIs into the proxy runtime.
 */

export const SESSION_COOKIE_NAME = "rv_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 gun

/**
 * `SESSION_SECRET` ayarlanmamışsa, kaynak kodunda sabit/görünür bir varsayılan
 * KULLANMIYORUZ (eskiden öyleydi - bu, repoyu görebilen herkesin geçerli
 * oturum token'ı üretebilmesi anlamına gelen kritik bir açıktı). Bunun yerine
 * süreç başına bir kere, rastgele ve tahmin edilemez bir anahtar üretiyoruz.
 * Bunun bedeli: ortam değişkeni tanımlı değilse, sunucu her yeniden
 * başlatıldığında (redeploy, fonksiyon soğuk başlangıcı vb.) önceki tüm
 * oturumlar geçersiz olur - bu, güvensiz bir varsayılanın sessizce çalışmaya
 * devam etmesinden çok daha güvenli bir davranıştır.
 */
let processSecretFallback: string | null = null;
function getProcessSecretFallback(): string {
  if (!processSecretFallback) {
    processSecretFallback = crypto.randomBytes(32).toString("hex");
    console.warn(
      "[guvenlik] SESSION_SECRET ortam degiskeni tanimli degil. Gecici, rastgele bir anahtar " +
        "kullaniliyor; sunucu yeniden baslatildiginda tum oturumlar sonlanir. Kalici ve guvenli " +
        "oturumlar icin .env.local / Vercel Environment Variables kismina SESSION_SECRET ekleyin."
    );
  }
  return processSecretFallback;
}

/**
 * İmzalama anahtarını `SESSION_SECRET` ile mevcut `ADMIN_PASSWORD`'ün
 * özetini birleştirerek türetiyoruz. Böylece admin şifresini
 * değiştirdiğinizde (örn. başka birinin şifreyi öğrendiğinden şüphelenirseniz)
 * daha önce verilmiş TÜM oturum çerezleri anında geçersiz olur - kimseyi
 * tek tek "çıkışa zorlamanıza" gerek kalmaz.
 */
function getSecret(): string {
  const base = process.env.SESSION_SECRET || getProcessSecretFallback();
  const passwordFingerprint = crypto
    .createHash("sha256")
    .update(process.env.ADMIN_PASSWORD || "")
    .digest("hex");
  return `${base}:${passwordFingerprint}`;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const payload: SessionPayload = { role: "admin", issuedAt: Date.now() };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [data, signature] = parts;
  const expected = sign(data);
  if (!timingSafeEqual(expected, signature)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    ) as SessionPayload;
    const age = Date.now() - payload.issuedAt;
    return payload.role === "admin" && age >= 0 && age <= SESSION_MAX_AGE_SECONDS * 1000;
  } catch {
    return false;
  }
}

let warnedMissingPassword = false;

/**
 * `ADMIN_PASSWORD` tanımlı değilse eskiden "admin123" gibi herkesçe bilinen
 * bir varsayılana düşülüyordu - bu, ortam değişkeni unutulursa admin
 * panelinin herkese açık kalması anlamına gelen kritik bir açıktı. Artık
 * ortam değişkeni ayarlanmadan HİÇBİR şifre kabul edilmiyor (fail closed):
 * panel, siz gerçek bir şifre tanımlayana kadar kilitli kalır.
 */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    if (!warnedMissingPassword) {
      warnedMissingPassword = true;
      console.warn(
        "[guvenlik] ADMIN_PASSWORD ortam degiskeni tanimli degil. Guvenlik nedeniyle admin " +
          "paneline hicbir sifreyle giris yapilamaz. .env.local / Vercel Environment Variables " +
          "kismina guclu bir ADMIN_PASSWORD ekleyin."
      );
    }
    return false;
  }
  return timingSafeEqual(password, expected);
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export const SESSION_COOKIE = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_MAX_AGE_SECONDS,
};
