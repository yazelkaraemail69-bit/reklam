import type { Campaign, CampaignInput, PaymentOrder } from "@/lib/types";
import {
  createCampaign,
  createPaymentOrder,
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

/**
 * Kampanya kaydı + Iyzico link + ödeme e-postası.
 * Iyzico/e-posta hatalarında sistem çökmez; order pending kalır, uyarılar döner.
 */
export async function registerCampaignCheckout(
  input: CheckoutRegistrationInput
): Promise<CheckoutRegistrationResult> {
  const email = input.customerEmail.trim().toLowerCase();
  if (!isValidEmail(email)) {
    throw new Error("Geçerli bir e-posta adresi girin.");
  }

  const amount = resolveAmount(input.campaign, input.amount, input.packageId);
  if (amount < 10) {
    throw new Error("Ödeme tutarı en az 10 TL olmalıdır.");
  }

  const pkg = getAdPackage(input.packageId || input.campaign.packageId);

  const customerName =
    input.customerName?.trim() ||
    input.campaign.name.split("—")[0]?.trim() ||
    "Değerli Müşterimiz";

  const campaign = await createCampaign({
    ...input.campaign,
    customerEmail: email,
    packageId: pkg.id,
    dailyBudget: pkg.dailyBudget,
    totalBudget: pkg.price,
    status: "pending_payment",
    variations: (input.campaign.variations ?? []).map((v) => ({
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

  return { campaign, order, paymentUrl, emailSent, warnings };
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
