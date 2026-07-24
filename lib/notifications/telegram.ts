/**
 * Telegram Bot API Notification Engine (%100 Ücretsiz & Sınırsız Bildirim).
 * SMS servislerine alternatif olarak siparişler, yeni müşteriler ve bildirimler için
 * Telegram botu üzerinden anlık zengin formatlı mesajlar gönderir.
 */

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Ortam değişkeni ayarlanmadıysa sessizce başarsız olmadan konsola log basar
    console.log("[Telegram Notification Skipped - Missing Credentials]:", message);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      console.error("[Telegram Error]: Response not ok", await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Telegram Notification Error]:", error);
    return false;
  }
}

/** Yeni Reklam Siparişi Bildirimi */
export async function notifyNewOrder(orderData: {
  customerName: string;
  customerEmail: string;
  amount: number;
  packageId?: string;
  campaignName?: string;
}) {
  const msg = `🚨 <b>Yeni Reklam Siparişi Alındı!</b>\n\n` +
    `👤 <b>Müşteri:</b> ${orderData.customerName}\n` +
    `📧 <b>E-posta:</b> ${orderData.customerEmail}\n` +
    `💰 <b>Tutar:</b> ${orderData.amount} TRY\n` +
    `📦 <b>Paket:</b> ${orderData.packageId || "Özel Kampanya"}\n` +
    `📢 <b>Kampanya:</b> ${orderData.campaignName || "Vitrin Reklamı"}\n\n` +
    `⏰ <b>Tarih:</b> ${new Date().toLocaleString("tr-TR")}`;

  return sendTelegramNotification(msg);
}

/** Yeni Potansiyel Müşteri / Form Bildirimi */
export async function notifyNewLead(leadData: {
  businessName: string;
  customerName: string;
  customerPhone: string;
  note?: string;
}) {
  const msg = `📩 <b>Yeni Vitrin Müşteri Talebi!</b>\n\n` +
    `🏢 <b>İşletme:</b> ${leadData.businessName}\n` +
    `👤 <b>Müşteri Adı:</b> ${leadData.customerName}\n` +
    `📞 <b>Telefon:</b> ${leadData.customerPhone}\n` +
    (leadData.note ? `💬 <b>Not:</b> ${leadData.note}\n\n` : "\n") +
    `⏰ <b>Tarih:</b> ${new Date().toLocaleString("tr-TR")}`;

  return sendTelegramNotification(msg);
}
