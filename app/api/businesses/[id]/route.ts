import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteBusiness, getBusinessById, StorageWriteError, updateBusiness } from "@/lib/store";
import { normalizeBusinessInput, validateBusinessInput } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) {
    return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ business });
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const validationError = validateBusinessInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const updated = await updateBusiness(id, normalizeBusinessInput(body));
    if (!updated) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ business: updated });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "İşletme güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const deleted = await deleteBusiness(id);
    if (!deleted) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "İşletme silinemedi." }, { status: 500 });
  }
}
