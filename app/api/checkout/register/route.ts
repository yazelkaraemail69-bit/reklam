import { NextResponse } from "next/server";
import { registerCampaignCheckout } from "@/lib/checkout";
import { StorageWriteError } from "@/lib/store";
import { UploadError } from "@/lib/upload";
import { normalizeCampaignInput, validateCampaignInput } from "@/lib/validation";

/**
 * Kampanya kaydı + Iyzico ödeme linki + e-posta.
 * Body: { campaign: CampaignInput, customerEmail, customerName?, amount? }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const campaignBody =
    data.campaign && typeof data.campaign === "object"
      ? data.campaign
      : body;

  const validationError = validateCampaignInput(campaignBody);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const customerEmail =
    typeof data.customerEmail === "string"
      ? data.customerEmail
      : typeof (campaignBody as Record<string, unknown>).customerEmail === "string"
        ? String((campaignBody as Record<string, unknown>).customerEmail)
        : "";

  if (!customerEmail.trim()) {
    return NextResponse.json({ error: "customerEmail zorunludur." }, { status: 400 });
  }

  const amount =
    typeof data.amount === "number"
      ? data.amount
      : typeof data.amount === "string"
        ? Number(data.amount)
        : undefined;

  const packageId =
    typeof data.packageId === "string"
      ? data.packageId
      : typeof (campaignBody as Record<string, unknown>).packageId === "string"
        ? String((campaignBody as Record<string, unknown>).packageId)
        : undefined;

  try {
    const result = await registerCampaignCheckout({
      campaign: normalizeCampaignInput(campaignBody as Record<string, unknown>),
      customerEmail,
      customerName: typeof data.customerName === "string" ? data.customerName : undefined,
      packageId,
      amount: Number.isFinite(amount) ? amount : undefined,
    });

    return NextResponse.json(
      {
        campaign: result.campaign,
        order: result.order,
        paymentUrl: result.paymentUrl,
        emailSent: result.emailSent,
        warnings: result.warnings,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Kayıt tamamlanamadı.";
    console.error("[api/checkout/register]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
