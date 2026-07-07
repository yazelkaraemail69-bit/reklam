import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicAdminPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
