import { notifyNewLead } from "../notifications/telegram";

export interface LeadPayload {
  businessId: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  source?: "whatsapp" | "form" | "call";
}

export interface LeadFiringResult {
  fired: boolean;
  timestamp: string;
  whatsappUrl: string;
  telegramNotified: boolean;
}

/**
 * ⚡ Lead Instant Firing Bot.
 * Vitrin sayfasından (`/isletme-adi`) form doldurulduğunda veya WhatsApp/Arama butonuna basıldığında:
 * - Dönüşüm süresini 1 dakikanın altına indirmek için müşteri detayını saniyesinde Telegram ve WhatsApp'a fırlatır.
 */
export async function runLeadFiringBot(lead: LeadPayload): Promise<LeadFiringResult> {
  const timestamp = new Date().toISOString();

  // Clean phone number for WhatsApp Click-to-Chat
  const cleanPhone = lead.customerPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
  const whatsappMsg = encodeURIComponent(
    `Merhaba ${lead.businessName}, Vitrin sayfanız üzerinden fiyat teklifi ve detaylı bilgi almak istiyorum.`
  );
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${whatsappMsg}`;

  // Telegram Bildirimi Fırlat
  const telegramNotified = await notifyNewLead({
    businessName: lead.businessName,
    customerName: lead.customerName,
    customerPhone: lead.customerPhone,
    note: lead.note ? `[Kaynak: ${lead.source || "Vitrin"}] ${lead.note}` : `[Kaynak: ${lead.source || "Vitrin"}]`,
  });

  return {
    fired: true,
    timestamp,
    whatsappUrl,
    telegramNotified,
  };
}
