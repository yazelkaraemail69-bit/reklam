import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
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
