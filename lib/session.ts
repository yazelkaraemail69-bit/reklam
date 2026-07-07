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

function getSecret(): string {
  return process.env.SESSION_SECRET || "gelistirme-ortami-varsayilan-anahtari-lutfen-degistirin";
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

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  return timingSafeEqual(password, expected);
}

export const SESSION_COOKIE = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_MAX_AGE_SECONDS,
};
