import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createBusiness, getBusinesses, StorageWriteError } from "@/lib/store";
import { normalizeBusinessInput, validateBusinessInput } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const businesses = await getBusinesses();
  return NextResponse.json({ businesses });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validationError = validateBusinessInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const business = await createBusiness(normalizeBusinessInput(body));
    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "İşletme oluşturulamadı." }, { status: 500 });
  }
}
