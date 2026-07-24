/**
 * Resend Free Email Service (Aylık 3.000 Ücretsiz E-posta).
 * SMTP yapılandırmasına gerek duymadan e-posta bildirimlerini ve sipariş faturalarını sıfır ücretle gönderir.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmailWithResend(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[Resend Email Skipped - Missing RESEND_API_KEY]:", payload);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reklam Vitrini <onboarding@resend.dev>",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      console.error("[Resend Error]: Response not ok", await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Resend Service Error]:", error);
    return false;
  }
}
