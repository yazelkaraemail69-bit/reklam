import type { BillingDetails, Campaign } from "../types";

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  customerEmail: string;
  billing: BillingDetails;
  packageName: string;
  durationDays: number;
  totalAmount: number;
  vatAmount: number; // %20 KDV
  netAmount: number;
  iyzicoPaymentId?: string;
}

export function buildInvoiceData(campaign: Campaign, paymentId?: string): InvoiceData {
  const totalAmount = campaign.totalBudget || campaign.dailyBudget * 14 || 2990;
  const netAmount = Math.round((totalAmount / 1.2) * 100) / 100;
  const vatAmount = Math.round((totalAmount - netAmount) * 100) / 100;

  const defaultBilling: BillingDetails = campaign.billing || {
    type: "individual",
    fullName: campaign.businessName || "Değerli Müşteri",
    taxNumber: "11111111111",
    address: campaign.location?.city ? `${campaign.location.city}, Türkiye` : "Türkiye",
    city: campaign.location?.city || "İstanbul",
  };

  return {
    invoiceNumber: `RKV-${Date.now().toString().slice(-8)}`,
    issueDate: new Date().toLocaleDateString("tr-TR"),
    customerEmail: campaign.customerEmail || "bildirim@reklavitrin.com",
    billing: defaultBilling,
    packageName: campaign.packageId ? `${campaign.packageId.toUpperCase()} Paketi` : "Büyüme Paketi",
    durationDays: 14,
    totalAmount,
    vatAmount,
    netAmount,
    iyzicoPaymentId: paymentId || `IYZ-${Date.now().toString().slice(-6)}`,
  };
}

export function generateInvoiceHtml(invoice: InvoiceData): string {
  const companyTitle =
    invoice.billing.type === "corporate"
      ? invoice.billing.companyName || "Kurumsal Müşteri"
      : invoice.billing.fullName || "Bireysel Müşteri";

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Fatura - ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; background: #fff; color: #1e293b; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #064e3b; }
    .logo span { color: #22c55e; }
    .badge { background: #dcfce7; color: #166534; font-weight: bold; padding: 6px 12px; border-radius: 6px; font-size: 14px; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .details h4 { margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; }
    .details p { margin: 0; font-weight: 500; font-size: 14px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f8fafc; text-align: left; padding: 12px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .totals { width: 300px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .totals .final { font-size: 18px; font-weight: bold; color: #064e3b; border-top: 2px solid #e2e8f0; padding-top: 12px; }
    .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div class="logo">Reklam<span>Vitrini</span></div>
      <div class="badge">E-FATURA / MAKBUZ</div>
    </div>

    <div class="details">
      <div>
        <h4>Hizmet Sağlayıcı</h4>
        <p><strong>Reklam Vitrini SaaS Platformu</strong></p>
        <p>Vergi Dairesi: Maslak V.D.</p>
        <p>VKN: 9876543210</p>
        <p>Destek: bildirim@reklavitrin.com</p>
      </div>
      <div>
        <h4>Müşteri Bilgileri</h4>
        <p><strong>${companyTitle}</strong></p>
        <p>VKN / TCKN: ${invoice.billing.taxNumber}</p>
        ${invoice.billing.taxOffice ? `<p>Vergi D.: ${invoice.billing.taxOffice}</p>` : ""}
        <p>Adres: ${invoice.billing.address}, ${invoice.billing.city}</p>
      </div>
    </div>

    <div class="details" style="margin-bottom: 20px;">
      <div>
        <h4>Fatura No</h4>
        <p>${invoice.invoiceNumber}</p>
      </div>
      <div>
        <h4>Düzenlenme Tarihi</h4>
        <p>${invoice.issueDate}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>HİZMET / PAKET AÇIKLAMASI</th>
          <th>SÜRE</th>
          <th style="text-align: right;">NET TUTAR</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${invoice.packageName}</strong><br>
            <span style="font-size: 12px; color: #64748b;">Google Ads RSA + Meta Ads Yayın Hizmeti & Mobil Vitrin Sayfası</span>
          </td>
          <td>${invoice.durationDays} Gün</td>
          <td style="text-align: right;">${invoice.netAmount.toLocaleString("tr-TR")} TRY</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div>
        <span>Ara Toplam (Matrah):</span>
        <span>${invoice.netAmount.toLocaleString("tr-TR")} TRY</span>
      </div>
      <div>
        <span>KDV (%20):</span>
        <span>${invoice.vatAmount.toLocaleString("tr-TR")} TRY</span>
      </div>
      <div class="final">
        <span>Ödenen Toplam Tutar:</span>
        <span>${invoice.totalAmount.toLocaleString("tr-TR")} TRY</span>
      </div>
    </div>

    <div class="footer">
      <p>İşlem Kodu: ${invoice.iyzicoPaymentId} | Bu belge 213 sayılı VUK uyarınca elektronik ortamda düzenlenmiştir.</p>
    </div>
  </div>
</body>
</html>
`;
}
