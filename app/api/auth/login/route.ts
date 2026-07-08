import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/rate-limit";

async function getClientIdentifier(): Promise<string> {
  const headerStore = await headers();
  // Vercel/proxy'ler gercek istemci IP'sini bu basliga ekler; ilk deger
  // orijinal istemcidir. Hicbiri yoksa (ornegin yerel gelistirme) tum
  // istekleri tek bir kovada toplayan sabit bir anahtara dus.
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headerStore.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const identifier = await getClientIdentifier();
  const rateLimit = await checkLoginRateLimit(identifier);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Çok fazla başarısız giriş denemesi. Lütfen ${Math.ceil(
          rateLimit.retryAfterSeconds / 60
        )} dakika sonra tekrar deneyin.`,
      },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE.maxAge,
  });

  return NextResponse.json({ ok: true });
}
