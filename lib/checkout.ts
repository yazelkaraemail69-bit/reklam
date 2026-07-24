import type { Campaign, CampaignInput, PaymentOrder } from "@/lib/types";
import {
  createBusiness,
  createCampaign,
  createPaymentOrder,
  getBusinessById,
  getCampaignById,
  getPaymentByConversationId,
  getPaymentById,
  updateCampaign,
  updatePaymentOrder,
} from "@/lib/store";
import { createPaymentLink, isIyzicoConfigured, IyzicoError } from "@/lib/iyzico";
import { EmailError, sendPaymentLinkEmail } from "@/lib/email";
import { orderToEmailPayload } from "@/lib/email/templates";
import { getAdPackage } from "@/lib/constants";
import { persistImageReference, UploadError } from "@/lib/upload";

export interface CheckoutRegistrationInput {
  campaign: CampaignInput;
  customerEmail: string;
  customerName?: string;
  packageId?: string;
  /** Ödeme tutarı; paket veya totalBudget / dailyBudget*7 */
  amount?: number;
}

export interface CheckoutRegistrationResult {
  campaign: Campaign;
  order: PaymentOrder;
  businessSlug?: string;
  paymentUrl?: string;
  emailSent: boolean;
  warnings: string[];
}

function resolveAmount(
  campaign: CampaignInput,
  explicit?: number,
  packageId?: string
): number {
  if (typeof explicit === "number" && Number.isFinite(explicit) && explicit > 0) {
    return Math.round(explicit * 100) / 100;
  }
  if (packageId || campaign.packageId) {
    const pkg = getAdPackage(packageId || campaign.packageId);
    return pkg.price;
  }
  if (campaign.totalBudget && campaign.totalBudget > 0) {
    return Math.round(campaign.totalBudget * 100) / 100;
  }
  return Math.round(campaign.dailyBudget * 7 * 100) / 100;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** data: URL görselleri Blob/yerel depoya yazar; Upstash'e şişirmez. */
async function persistCampaignMedia(campaign: CampaignInput): Promise<CampaignInput> {
  try {
    const sourceImageUrl = await persistImageReference(campaign.sourceImageUrl);
    const variations = await Promise.all(
      (campaign.variations ?? []).map(async (variation) => ({
        ...variation,
        imageUrl: await persistImageReference(variation.imageUrl),
      }))
    );
    return { ...campaign, sourceImageUrl, variations };
  } catch (error) {
    console.warn("[Media Warning] Could not persist image reference, preserving original image:", error);
    return campaign;
  }
}

/**
 * Kampanya kaydı + Iyzico link + ödeme e-postası.
 * Müşteri başvurusu admin paneline (kampanyalar) otomatik düşer.
 */
export async function registerCampaignCheckout(
  input: CheckoutRegistrationInput
): Promise<CheckoutRegistrationResult> {
  const email = input.customerEmail.trim().toLowerCase();
  if (!isValidEmail(email)) {
    throw new Error("Geçerli bir e-posta adresi girin.");
  }

  const pkg = getAdPackage(input.packageId || input.campaign.packageId);
  const customerName =
    input.customerName?.trim() ||
    input.campaign.businessName?.trim() ||
    input.campaign.name.split("—")[0]?.trim() ||
    "Değerli Müşterimiz";

  const amount = resolveAmount(input.campaign, input.amount, input.packageId);
  if (amount < 10) {
    throw new Error("Ödeme tutarı en az 10 TL olmalıdır.");
  }

  const mediaReady = await persistCampaignMedia(input.campaign);

  const businessName = mediaReady.businessName || mediaReady.name?.split("—")[0]?.trim() || "Canlı İşletme";
  const category = mediaReady.category || "Diğer";

  let business = mediaReady.businessId ? await getBusinessById(mediaReady.businessId) : null;
  if (!business) {
    business = await createBusiness({
      name: businessName,
      slogan: mediaReady.rawOfferText || `${businessName} Hizmetleri`,
      description: mediaReady.rawOfferText || `${businessName} kurumsal dijital vitrin sayfası.`,
      category,
      city: mediaReady.location?.city || "İstanbul",
      phone: "905551234567",
      whatsapp: "905551234567",
      coverImageUrl: mediaReady.sourceImageUrl || "/uploads/default-cover.jpg",
      galleryImages: mediaReady.sourceImageUrl ? [mediaReady.sourceImageUrl] : [],
      services: [{ title: category, description: mediaReady.rawOfferText || "Kaliteli hizmet" }],
      social: {},
      isPublished: true,
    });
  }

  const campaign = await createCampaign({
    ...mediaReady,
    businessId: business?.id || mediaReady.businessId,
    customerEmail: email,
    packageId: pkg.id,
    dailyBudget: pkg.dailyBudget,
    totalBudget: pkg.price,
    status: "pending_payment",
    variations: (mediaReady.variations ?? []).map((v) => ({
      ...v,
      status: "draft" as const,
    })),
  });

  const conversationId = `ord-${campaign.id}`;
  let order = await createPaymentOrder({
    campaignId: campaign.id,
    customerEmail: email,
    customerName,
    amount,
    currency: "TRY",
    packageId: pkg.id,
    status: "pending",
    conversationId,
  });

  const warnings: string[] = [];
  let paymentUrl: string | undefined;
  let emailSent = false;

  if (!isIyzicoConfigured()) {
    warnings.push(
      "Iyzico yapılandırılmamış; ödeme linki oluşturulamadı. Admin panelinden manuel takip edin."
    );
    console.warn("[checkout] Iyzico not configured", {
      orderId: order.id,
      campaignId: campaign.id,
    });
  } else {
    try {
      const link = await createPaymentLink({
        conversationId: order.conversationId,
        name: `${pkg.name} Paketi — ${campaign.name}`.slice(0, 100),
        description: `${customerName} · ${pkg.name} paketi (${pkg.durationDays} gün) · ${amount} TL. Sipariş: ${order.id}`,
        price: amount,
        singleUse: true,
        addressIgnorable: true,
      });

      order =
        (await updatePaymentOrder(order.id, {
          iyzicoToken: link.token,
          iyzicoPaymentUrl: link.url,
          iyzicoMode: link.mode,
        })) ?? order;

      paymentUrl = link.url;
    } catch (error) {
      const message =
        error instanceof IyzicoError ? error.message : "Iyzico link oluşturulamadı.";
      warnings.push(message);
      console.error("[checkout] iyzico link failed", {
        orderId: order.id,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  if (paymentUrl) {
    const payload = orderToEmailPayload(order, campaign.name);
    if (payload) {
      try {
        await sendPaymentLinkEmail(payload);
        order =
          (await updatePaymentOrder(order.id, {
            emailSentAt: new Date().toISOString(),
            emailError: undefined,
          })) ?? order;
        emailSent = true;
      } catch (error) {
        const message = error instanceof EmailError ? error.message : "E-posta gönderilemedi.";
        warnings.push(message);
        console.error("[checkout] email failed", { orderId: order.id, message });
        order =
          (await updatePaymentOrder(order.id, {
            emailError: message,
          })) ?? order;
      }
    }
  }

  return { campaign, order, businessSlug: business?.slug, paymentUrl, emailSent, warnings };
}

/**
 * Webhook / manuel onay: siparişi paid, kampanyayı ready yapar.
 */
export async function markOrderPaid(options: {
  orderId?: string;
  conversationId?: string;
  paymentId?: string;
}): Promise<{ order: PaymentOrder; campaign: Campaign | null } | null> {
  let order: PaymentOrder | null = null;
  if (options.orderId) {
    order = await getPaymentById(options.orderId);
  } else if (options.conversationId) {
    order = await getPaymentByConversationId(options.conversationId);
  }

  if (!order) return null;
  if (order.status === "paid") {
    const campaign = await getCampaignById(order.campaignId);
    return { order, campaign };
  }

  const paidAt = new Date().toISOString();
  const updatedOrder = await updatePaymentOrder(order.id, {
    status: "paid",
    paidAt,
    iyzicoPaymentId: options.paymentId || order.iyzicoPaymentId,
  });

  if (!updatedOrder) return null;

  let campaign = await getCampaignById(order.campaignId);
  if (campaign && campaign.status === "pending_payment") {
    campaign = await updateCampaign(campaign.id, { status: "ready" });
  }

  return { order: updatedOrder, campaign };
}
