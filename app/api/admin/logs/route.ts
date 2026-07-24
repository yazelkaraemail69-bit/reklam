import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { clearTelemetryLogs, getTelemetryLogs, logTelemetry, type TelemetryCategory } from "@/lib/logger/telemetry";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") as TelemetryCategory) || undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  const logs = await getTelemetryLogs(limit, category);
  return NextResponse.json({ logs }, { status: 200 });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const ok = await clearTelemetryLogs();
  return NextResponse.json({ success: ok }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const entry = await logTelemetry({
    level: body.level || "ERROR",
    category: body.category || "GENERAL",
    message: body.message || "Bilinmeyen İstemci Hatası",
    stack: body.stack,
    context: body.context,
  });

  return NextResponse.json({ entry }, { status: 201 });
}
