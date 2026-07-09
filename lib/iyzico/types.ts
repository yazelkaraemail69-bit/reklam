/**
 * Iyzico Link (Pay by Link) istemci tipleri.
 * Resmi dokümantasyon: https://docs.iyzico.com/en/products/iyzico-link/iyzico-link-api
 */

export type IyzicoCurrency = "TRY" | "USD" | "EUR" | "GBP";

export interface CreatePaymentLinkInput {
  /** Sipariş / ödeme kaydı ID'si — conversationId olarak Iyzico'ya gider */
  conversationId: string;
  /** Müşteriye görünen ürün adı */
  name: string;
  /** Müşteriye görünen açıklama */
  description: string;
  /** Tutar (TRY). Örn. 1500.5 */
  price: number;
  currencyCode?: IyzicoCurrency;
  /**
   * true ise adres sorulmaz (dijital hizmet / reklam paketi için uygun).
   * Varsayılan: true
   */
  addressIgnorable?: boolean;
  /** Taksit açık mı? Reklam paketlerinde genelde kapalı. Varsayılan: false */
  installmentRequested?: boolean;
  /**
   * Tek kullanımlık link için stok=1.
   * Fast Link (≤750 TL) kullanıldığında Iyzico zaten tek kullanımlıktır.
   */
  singleUse?: boolean;
  /** Opsiyonel base64 görsel; verilmezse dahili placeholder kullanılır */
  encodedImageFile?: string;
}

export interface PaymentLinkResult {
  token: string;
  url: string;
  imageUrl?: string;
  /** Hangi endpoint kullanıldı */
  mode: "iyzilink" | "fastlink";
  conversationId: string;
  price: number;
  currencyCode: IyzicoCurrency;
}

export class IyzicoError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly raw?: unknown;

  constructor(message: string, code = "IYZICO_ERROR", statusCode?: number, raw?: unknown) {
    super(message);
    this.name = "IyzicoError";
    this.code = code;
    this.statusCode = statusCode;
    this.raw = raw;
  }
}
