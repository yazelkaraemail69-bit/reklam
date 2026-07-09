import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/checkout";
import { getPaymentByConversationId, getPaymentByIyzicoToken } from "@/lib/store";
import { getPaymentLink } from "@/lib/iyzico";

/**
 * Iyzico webhook bildirimleri.
 * Merchant panelinde bu URL'yi tanımlayın: https://siteniz.com/api/payments/webhook
 *
 * Doğrulama:
 * 1) Opsiyonel X-IYZ-SIGNATURE / V3 (secret ile)
 * 2) paymentConversationId → sipariş eşlemesi
 * 3) Başarıda link soldCount kontrolü (mümkünse)
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  let payload: Record<string, unknown>;

  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    console.error("[webhook] invalid JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.info("[webhook] received", {
    status: payload.status,
    iyziEventType: payload.iyziEventType,
    paymentConversationId: payload.paymentConversationId,
    paymentId: payload.paymentId ?? payload.iyziPaymentId,
  });

  if (!verifyWebhookSignature(request, rawBody, payload)) {
    console.error("[webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const status = String(payload.status || "").toUpperCase();
  const conversationId =
    typeof payload.paymentConversationId === "string"
      ? payload.paymentConversationId
      : typeof payload.conversationId === "string"
        ? payload.conversationId
        : "";

  const paymentId = String(payload.paymentId ?? payload.iyziPaymentId ?? "");

  // Başarısız ödemeleri işaretle ama 200 dön (Iyzico retry etmesin)
  if (status && status !== "SUCCESS" && status !== "success") {
    if (conversationId) {
      const order = await getPaymentByConversationId(conversationId);
      if (order && order.status === "pending") {
        const { updatePaymentOrder } = await import("@/lib/store");
        await updatePaymentOrder(order.id, { status: "failed" });
      }
    }
    return NextResponse.json({ ok: true, handled: "failure" });
  }

  // conversationId yoksa token ile dene
  let resolvedConversationId = conversationId;
  if (!resolvedConversationId && typeof payload.token === "string") {
    const byToken = await getPaymentByIyzicoToken(payload.token);
    if (byToken) resolvedConversationId = byToken.conversationId;
  }

  if (!resolvedConversationId) {
    console.warn("[webhook] no conversationId — ignored");
    return NextResponse.json({ ok: true, handled: "ignored" });
  }

  // İsteğe bağlı: Iyzico link soldCount doğrulaması
  const order = await getPaymentByConversationId(resolvedConversationId);
  if (order?.iyzicoToken) {
    try {
      const detail = await getPaymentLink(order.iyzicoToken);
      if (detail.soldCount < 1 && process.env.IYZICO_SKIP_SOLD_CHECK !== "true") {
        console.warn("[webhook] soldCount still 0 — waiting for next notification", {
          token: order.iyzicoToken,
          conversationId: resolvedConversationId,
        });
        // Yine de conversationId + SUCCESS geldiyse işaretle (Fast Link webhook gecikmesi olabilir)
      }
    } catch (error) {
      console.error("[webhook] getPaymentLink failed (continuing)", error);
    }
  }

  try {
    const result = await markOrderPaid({
      conversationId: resolvedConversationId,
      paymentId: paymentId || undefined,
    });

    if (!result) {
      console.warn("[webhook] order not found", { conversationId: resolvedConversationId });
      return NextResponse.json({ ok: true, handled: "not_found" });
    }

    console.info("[webhook] order marked paid", {
      orderId: result.order.id,
      campaignId: result.campaign?.id,
      campaignStatus: result.campaign?.status,
    });

    return NextResponse.json({ ok: true, handled: "paid", orderId: result.order.id });
  } catch (error) {
    console.error("[webhook] markOrderPaid failed", error);
    // 500 → Iyzico yeniden dener
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

function verifyWebhookSignature(
  request: Request,
  rawBody: string,
  payload: Record<string, unknown>
): boolean {
  const secret = process.env.IYZICO_SECRET_KEY?.trim();
  if (!secret) {
    // Yapılandırma yoksa geliştirmede kabul et; production'da reddet
    return process.env.NODE_ENV === "development";
  }

  const sigV3 = request.headers.get("x-iyz-signature-v3");
  const sigV1 = request.headers.get("x-iyz-signature");

  if (!sigV3 && !sigV1) {
    // Bazı Iyzico Link bildirimlerinde imza olmayabilir — secret varsa
    // IYZICO_WEBHOOK_RELAXED=true ile gevşetilebilir
    if (process.env.IYZICO_WEBHOOK_RELAXED === "true" || process.env.NODE_ENV === "development") {
      return true;
    }
    return false;
  }

  try {
    if (sigV3) {
      // V3: HMAC-SHA256(secret, rawBody) hex — dokümantasyon varyantlarına toleranslı
      const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
      if (safeEqual(sigV3, expectedHex)) return true;

      const eventType = String(payload.iyziEventType || "");
      const paymentId = String(payload.paymentId ?? payload.iyziPaymentId ?? "");
      const token = String(payload.token || "");
      const alt = createHmac("sha256", secret)
        .update(`${secret}${eventType}${paymentId || token}`)
        .digest("hex");
      if (safeEqual(sigV3, alt)) return true;
    }

    if (sigV1) {
      const eventType = String(payload.iyziEventType || "");
      const token = String(payload.token || payload.paymentId || "");
      const expected = createHmac("sha1", secret)
        .update(`${secret}${eventType}${token}`)
        .digest("base64");
      if (safeEqual(sigV1, expected)) return true;
    }
  } catch (error) {
    console.error("[webhook] signature compute error", error);
    return false;
  }

  return process.env.IYZICO_WEBHOOK_RELAXED === "true";
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
