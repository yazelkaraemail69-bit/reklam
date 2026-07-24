/**
 * Client-side SHA-256 hashing utility for Google Ads Enhanced Conversions.
 * Standardizes email (lowercase, trim) and phone numbers (digits only, E.164 format)
 * before producing a hex SHA-256 digest via Web Crypto API.
 */

export async function sha256(text: string): Promise<string> {
  const normalized = text.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  
  // Fallback for non-browser or older environments
  return normalized;
}

export async function hashCustomerData(data: {
  email?: string;
  phone?: string;
}) {
  const result: { emailHash?: string; phoneHash?: string } = {};

  if (data.email) {
    result.emailHash = await sha256(data.email);
  }

  if (data.phone) {
    const cleanPhone = data.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("90")
      ? `+${cleanPhone}`
      : `+90${cleanPhone}`;
    result.phoneHash = await sha256(formattedPhone);
  }

  return result;
}
