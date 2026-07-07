import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveUploadedImage, UploadError } from "@/lib/upload";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Görsel dosyası bulunamadı." }, { status: 400 });
  }

  try {
    const url = await saveUploadedImage(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Görsel yüklenemedi." }, { status: 500 });
  }
}
