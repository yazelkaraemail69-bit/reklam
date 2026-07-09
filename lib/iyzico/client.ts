import { buildIyzicoAuthorizationHeader } from "./auth";
import { IYZICO_PLACEHOLDER_IMAGE_BASE64 } from "./placeholder-image";
import {
  IyzicoError,
  type CreatePaymentLinkInput,
  type IyzicoCurrency,
  type PaymentLinkResult,
} from "./types";

const SANDBOX_BASE = "https://sandbox-api.iyzipay.com";
const LIVE_BASE = "https://api.iyzipay.com";

/** Fast Link üst limiti (TRY) — Iyzico dokümantasyonu */
const FAST_LINK_MAX_TRY = 750;

interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  isSandbox: boolean;
}

function loadConfig(): IyzicoConfig {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  const baseOverride = process.env.IYZICO_BASE_URL?.trim();
  const isSandbox =
    process.env.IYZICO_SANDBOX === "true" ||
    process.env.IYZICO_SANDBOX === "1" ||
    Boolean(apiKey?.startsWith("sandbox-"));

  if (!apiKey || !secretKey) {
    throw new IyzicoError(
      "Iyzico API anahtarları eksik. .env dosyasına IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin.",
      "IYZICO_CONFIG_MISSING"
    );
  }

  return {
    apiKey,
    secretKey,
    baseUrl: baseOverride || (isSandbox ? SANDBOX_BASE : LIVE_BASE),
    isSandbox,
  };
}

export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY?.trim() && process.env.IYZICO_SECRET_KEY?.trim());
}

interface IyzicoApiResponse {
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  data?: {
    token?: string;
    url?: string;
    imageUrl?: string;
  };
}

async function iyzicoRequest<T extends IyzicoApiResponse>(
  config: IyzicoConfig,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  uriPath: string,
  bodyObject?: Record<string, unknown>
): Promise<T> {
  const body = bodyObject ? JSON.stringify(bodyObject) : "";
  const { authorization, randomKey } = buildIyzicoAuthorizationHeader({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    uriPath,
    body,
  });

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${uriPath}`, {
      method,
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
        "x-iyzi-rnd": randomKey,
      },
      body: method === "GET" || method === "DELETE" ? undefined : body,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[iyzico] network error", { uriPath, error });
    throw new IyzicoError(
      "Iyzico API'ye bağlanılamadı. Ağ bağlantısını kontrol edin.",
      "IYZICO_NETWORK",
      undefined,
      error
    );
  }

  const rawText = await response.text();
  let json: T;
  try {
    json = JSON.parse(rawText) as T;
  } catch {
    console.error("[iyzico] invalid JSON", { uriPath, status: response.status, rawText: rawText.slice(0, 500) });
    throw new IyzicoError(
      `Iyzico beklenmeyen yanıt döndü (HTTP ${response.status}).`,
      "IYZICO_INVALID_RESPONSE",
      response.status,
      rawText.slice(0, 500)
    );
  }

  if (!response.ok || json.status === "failure") {
    const message = json.errorMessage || `Iyzico isteği başarısız (HTTP ${response.status}).`;
    console.error("[iyzico] API failure", {
      uriPath,
      httpStatus: response.status,
      errorCode: json.errorCode,
      errorMessage: json.errorMessage,
      conversationId: json.conversationId,
    });
    throw new IyzicoError(message, json.errorCode || "IYZICO_API_FAILURE", response.status, json);
  }

  return json;
}

function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) {
    throw new IyzicoError("Ödeme tutarı 0'dan büyük olmalıdır.", "IYZICO_INVALID_PRICE");
  }
  // Iyzico decimal string bekler (örn. "1500.00")
  return price.toFixed(2);
}

/**
 * Paket / bütçe tutarına göre Iyzico ödeme linki oluşturur.
 *
 * - Tutar ≤ 750 TRY → Fast Link (tek kullanımlık, hızlı tahsilat)
 * - Tutar > 750 TRY → klasik iyzico Link (stok=1 ile tek kullanıma yaklaştırılır)
 *
 * Anahtarlar yalnızca ortam değişkenlerinden okunur; hata durumunda exception fırlatır,
 * çağıran katman loglayıp kullanıcıya güvenli mesaj göstermelidir.
 */
export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<PaymentLinkResult> {
  const config = loadConfig();
  const currencyCode: IyzicoCurrency = input.currencyCode ?? "TRY";
  const priceStr = formatPrice(input.price);
  const useFastLink =
    currencyCode === "TRY" && input.price <= FAST_LINK_MAX_TRY && input.singleUse !== false;

  if (useFastLink) {
    const uriPath = "/v2/iyzilink/fast-link/products";
    const response = await iyzicoRequest<IyzicoApiResponse>(config, "POST", uriPath, {
      locale: "tr",
      conversationId: input.conversationId,
      description: input.description.slice(0, 250),
      price: priceStr,
      currencyCode,
    });

    if (!response.data?.token || !response.data?.url) {
      throw new IyzicoError(
        "Iyzico Fast Link oluşturuldu ama token/url dönmedi.",
        "IYZICO_EMPTY_LINK",
        undefined,
        response
      );
    }

    return {
      token: response.data.token,
      url: response.data.url,
      imageUrl: response.data.imageUrl,
      mode: "fastlink",
      conversationId: input.conversationId,
      price: input.price,
      currencyCode,
    };
  }

  const uriPath = "/v2/iyzilink/products";
  const response = await iyzicoRequest<IyzicoApiResponse>(config, "POST", uriPath, {
    locale: "tr",
    conversationId: input.conversationId,
    name: input.name.slice(0, 100),
    description: input.description.slice(0, 250),
    price: priceStr,
    currencyCode,
    encodedImageFile: input.encodedImageFile || IYZICO_PLACEHOLDER_IMAGE_BASE64,
    addressIgnorable: input.addressIgnorable ?? true,
    installmentRequested: input.installmentRequested ?? false,
    stockEnabled: input.singleUse !== false,
    stockCount: input.singleUse === false ? undefined : 1,
  });

  if (!response.data?.token || !response.data?.url) {
    throw new IyzicoError(
      "Iyzico Link oluşturuldu ama token/url dönmedi.",
      "IYZICO_EMPTY_LINK",
      undefined,
      response
    );
  }

  return {
    token: response.data.token,
    url: response.data.url,
    imageUrl: response.data.imageUrl,
    mode: "iyzilink",
    conversationId: input.conversationId,
    price: input.price,
    currencyCode,
  };
}

/**
 * Mevcut link detayını token ile sorgular (ödeme sonrası soldCount kontrolü için).
 */
export async function getPaymentLink(token: string): Promise<{
  token: string;
  url?: string;
  soldCount: number;
  productStatus?: string;
  price?: string;
}> {
  const config = loadConfig();
  const uriPath = `/v2/iyzilink/products/${encodeURIComponent(token)}?locale=tr`;
  const response = await iyzicoRequest<
    IyzicoApiResponse & {
      data?: {
        token?: string;
        url?: string;
        soldCount?: number;
        productStatus?: string;
        price?: string;
      };
    }
  >(config, "GET", uriPath);

  return {
    token: response.data?.token || token,
    url: response.data?.url,
    soldCount: response.data?.soldCount ?? 0,
    productStatus: response.data?.productStatus,
    price: response.data?.price,
  };
}
