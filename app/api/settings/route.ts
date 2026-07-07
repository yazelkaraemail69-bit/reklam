import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSettings, StorageWriteError, updateSettings } from "@/lib/store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const siteName = typeof body.siteName === "string" ? body.siteName.trim() : "";
  const siteDescription = typeof body.siteDescription === "string" ? body.siteDescription.trim() : "";
  const globalHeadScript = typeof body.globalHeadScript === "string" ? body.globalHeadScript : "";

  if (!siteName) {
    return NextResponse.json({ error: "Site adı zorunludur." }, { status: 400 });
  }

  try {
    const settings = await updateSettings({ siteName, siteDescription, globalHeadScript });
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Ayarlar güncellenemedi." }, { status: 500 });
  }
}
