import type { PaymentOrder } from "@/lib/types";

export interface PaymentEmailPayload {
  customerName: string;
  customerEmail: string;
  campaignName: string;
  amount: number;
  paymentUrl: string;
  orderId: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function buildPaymentEmailHtml(payload: PaymentEmailPayload): string {
  const amount = formatMoney(payload.amount);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Reklam Vitrini";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reklam Kampanyanız Hazır</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#064e3b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0fdf4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d1fae5;">
          <tr>
            <td style="background:#064e3b;padding:28px 32px;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#86efac;">${siteName}</p>
              <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">Reklam Kampanyanız Hazır!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
                Merhaba <strong>${escapeHtml(payload.customerName)}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
                <strong>${escapeHtml(payload.campaignName)}</strong> kampanyanız oluşturuldu.
                Yayına almak için ödemenizi güvenli Iyzico linki üzerinden tamamlayın.
              </p>
              <table role="presentation" width="100%" style="background:#f0fdf4;border-radius:12px;margin:24px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#047857;">Ödenecek tutar</p>
                    <p style="margin:0;font-size:28px;font-weight:800;color:#064e3b;">${amount}</p>
                    <p style="margin:8px 0 0;font-size:12px;color:#64748b;">Sipariş No: ${escapeHtml(payload.orderId)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${escapeAttr(payload.paymentUrl)}"
                   style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:10px;">
                  Ödemeyi Tamamla
                </a>
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
                Buton çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:<br />
                <a href="${escapeAttr(payload.paymentUrl)}" style="color:#047857;word-break:break-all;">${escapeHtml(payload.paymentUrl)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                Bu e-posta ${escapeHtml(payload.customerEmail)} adresine gönderilmiştir.
                Ödeme Iyzico güvencesiyle alınır. Sorularınız için yanıtlayabilirsiniz.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPaymentEmailText(payload: PaymentEmailPayload): string {
  return [
    `Merhaba ${payload.customerName},`,
    "",
    `"${payload.campaignName}" kampanyanız hazır.`,
    `Yayına almak için ödemenizi tamamlayın: ${formatMoney(payload.amount)}`,
    "",
    `Ödeme linki: ${payload.paymentUrl}`,
    `Sipariş No: ${payload.orderId}`,
    "",
    "Reklam Vitrini",
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function orderToEmailPayload(
  order: PaymentOrder,
  campaignName: string
): PaymentEmailPayload | null {
  if (!order.iyzicoPaymentUrl) return null;
  return {
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    campaignName,
    amount: order.amount,
    paymentUrl: order.iyzicoPaymentUrl,
    orderId: order.id,
  };
}
