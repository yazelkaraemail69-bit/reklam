import { NextResponse } from "next/server";
import { createPaymentLink, isIyzicoConfigured, IyzicoError } from "@/lib/iyzico";

/**
 * Geliştirme / smoke-test uç noktası.
 * Production'da admin oturumu ile korunmalı; şimdilik Iyzico yapılandırılmışsa
 * test linki üretir. Gerçek kayıt akışı Adım 3'te wizard'a bağlanacak.
 */
export async function POST(request: Request) {
  if (!isIyzicoConfigured()) {
    return NextResponse.json(
      {
        error:
          "Iyzico yapılandırılmamış. .env.local dosyasına IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin.",
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const price = typeof data.price === "number" ? data.price : Number(data.price);
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "Reklam kampanyası paketi";

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Geçerli bir price (tutar) gerekli." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "name (ürün adı) gerekli." }, { status: 400 });
  }

  const conversationId =
    (typeof data.conversationId === "string" && data.conversationId.trim()) ||
    `test-${crypto.randomUUID()}`;

  try {
    const link = await createPaymentLink({
      conversationId,
      name,
      description,
      price,
      singleUse: true,
      addressIgnorable: true,
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (error instanceof IyzicoError) {
      console.error("[api/payments/create-link]", error.code, error.message);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode && error.statusCode >= 400 ? error.statusCode : 502 }
      );
    }
    console.error("[api/payments/create-link] unexpected", error);
    return NextResponse.json({ error: "Ödeme linki oluşturulamadı." }, { status: 500 });
  }
}
