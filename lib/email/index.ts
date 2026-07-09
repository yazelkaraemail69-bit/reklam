import nodemailer from "nodemailer";
import {
  buildPaymentEmailHtml,
  buildPaymentEmailText,
  type PaymentEmailPayload,
} from "./templates";

export class EmailError extends Error {
  readonly code: string;

  constructor(message: string, code = "EMAIL_ERROR") {
    super(message);
    this.name = "EmailError";
    this.code = code;
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "noreply@localhost"
  );
}

/**
 * Ödeme linki e-postasını gönderir.
 * SMTP yoksa hata fırlatır (çağıran katman loglar / order.emailError yazar).
 * Geliştirmede SMTP_MOCK=true ile konsola yazıp başarılı sayılabilir.
 */
export async function sendPaymentLinkEmail(payload: PaymentEmailPayload): Promise<void> {
  const subject = "Reklam Kampanyanız Hazır! Yayına Almak İçin Ödemenizi Tamamlayın";
  const html = buildPaymentEmailHtml(payload);
  const text = buildPaymentEmailText(payload);

  if (process.env.SMTP_MOCK === "true" || process.env.SMTP_MOCK === "1") {
    console.info("[email:mock] payment link mail", {
      to: payload.customerEmail,
      subject,
      paymentUrl: payload.paymentUrl,
      orderId: payload.orderId,
    });
    return;
  }

  if (!isEmailConfigured()) {
    // Geliştirmede SMTP yoksa akışı kırma — linki logla
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev-fallback] payment link mail (SMTP yok)", {
        to: payload.customerEmail,
        subject,
        paymentUrl: payload.paymentUrl,
        orderId: payload.orderId,
      });
      return;
    }
    throw new EmailError(
      "E-posta yapılandırılmamış. SMTP_HOST, SMTP_USER, SMTP_PASS ekleyin veya SMTP_MOCK=true kullanın.",
      "EMAIL_NOT_CONFIGURED"
    );
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: payload.customerEmail,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("[email] send failed", {
      to: payload.customerEmail,
      error: error instanceof Error ? error.message : error,
    });
    throw new EmailError(
      error instanceof Error ? error.message : "E-posta gönderilemedi.",
      "EMAIL_SEND_FAILED"
    );
  }
}
