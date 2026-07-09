export interface BusinessService {
  title: string;
  description: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
}

export interface Business {
  id: string;
  /** URL slug, e.g. /kagan-berber -> "kagan-berber" */
  slug: string;
  name: string;
  slogan: string;
  description: string;
  category: string;
  city: string;
  address?: string;
  phone: string;
  /** Only digits, with country code, e.g. 905551234567 */
  whatsapp: string;
  email?: string;
  workingHours?: string;
  logoUrl?: string;
  coverImageUrl: string;
  galleryImages: string[];
  services: BusinessService[];
  social: SocialLinks;
  seoTitle?: string;
  seoDescription?: string;
  /** Analytics/ads script injected only on this business page (e.g. Meta Pixel) */
  customHeadScript?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BusinessInput = Omit<Business, "id" | "createdAt" | "updatedAt">;

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  /** Injected into every page's <head>, e.g. Google Analytics / GTM */
  globalHeadScript?: string;
  updatedAt: string;
}

export interface SessionPayload {
  role: "admin";
  issuedAt: number;
}

/** Reklam kampanyasının birincil dönüşüm hedefi */
export type CampaignObjective = "traffic" | "messages" | "leads" | "awareness";

/** Yayın kanalı — müşteri Ads paneline girmez; ekip seçilen platformda açar */
export type AdPlatform = "meta" | "google";

/** Platforma göre görsel oranı (Instagram, Reels, Google Ads) */
export type AdAspectRatio = "1:1" | "9:16" | "16:9";

/** A/B testinde varyasyonun yaşam döngüsü */
export type AdVariationStatus = "draft" | "active" | "paused" | "winner";

/** Reklam CTA (call-to-action) seçenekleri */
export type AdCta =
  | "learn_more"
  | "whatsapp"
  | "call_now"
  | "book_now"
  | "get_offer"
  | "shop_now";

/**
 * Tek bir reklam varyasyonu.
 * Aynı kampanya girdilerinden birden fazla varyasyon üretilerek A/B testi yapılır.
 * AI katmanı (DeepSeek/OpenAI) ileride headline/primaryText alanlarını dolduracak.
 */
export interface AdVariation {
  id: string;
  /** A, B, C… — kullanıcıya gösterilen etiket */
  label: string;
  headline: string;
  primaryText: string;
  cta: AdCta;
  aspectRatio: AdAspectRatio;
  /** Kırpılmış / formatlanmış görsel URL'si (opsiyonel; yoksa kampanya görseli kullanılır) */
  imageUrl?: string;
  status: AdVariationStatus;
  /** Bu varyasyonu hangi kaynak üretti: kullanıcı, kural tabanlı, veya AI sağlayıcı */
  source: "manual" | "template" | "ai";
  createdAt: string;
  updatedAt: string;
}

export type AdVariationInput = Omit<AdVariation, "id" | "createdAt" | "updatedAt">;

/**
 * Reklam kampanyası.
 * İşletme vitrininden (Business) bağımsızdır; bir işletmeye bağlanabilir
 * ama wizard akışında henüz Business kaydı olmadan da oluşturulabilir.
 */
export interface Campaign {
  id: string;
  /** Bağlı işletme (opsiyonel — wizard tamamlanınca bağlanır) */
  businessId?: string;
  name: string;
  objective: CampaignObjective;
  /** Ham hedef kitle tanımı (örn. "25-45 yaş, kadın, güzellik salonu arayan") */
  targetAudience: string;
  /** Günlük bütçe (TRY) */
  dailyBudget: number;
  /** Toplam kampanya bütçesi (TRY, opsiyonel) */
  totalBudget?: number;
  /** Hedef lokasyon: şehir / ilçe / yarıçap */
  location: {
    city: string;
    district?: string;
    radiusKm?: number;
  };
  /** Kullanıcının girdiği ham ürün/hizmet metni (AI dönüşümü için kaynak) */
  rawOfferText: string;
  /** Kullanıcının yüklediği ana görsel */
  sourceImageUrl?: string;
  variations: AdVariation[];
  status: "draft" | "pending_payment" | "ready" | "running" | "paused" | "completed";
  /** Kayıt / fatura e-postası */
  customerEmail?: string;
  /** Seçilen sabit paket (starter | growth | pro) */
  packageId?: string;
  /** Müşterinin seçtiği yayın platformları (meta = IG/FB, google = Display/YouTube) */
  platforms?: AdPlatform[];
  createdAt: string;
  updatedAt: string;
}

export type CampaignInput = Omit<Campaign, "id" | "createdAt" | "updatedAt" | "variations"> & {
  variations?: AdVariationInput[];
};

/** Ödeme siparişi — Iyzico Link ile tahsilat */
export type PaymentOrderStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";

export interface PaymentOrder {
  id: string;
  campaignId: string;
  customerEmail: string;
  customerName: string;
  /** Tahsil edilecek tutar (TRY) */
  amount: number;
  currency: "TRY";
  /** Sabit paket id (varsa) */
  packageId?: string;
  status: PaymentOrderStatus;
  /** Iyzico conversationId — webhook eşlemesi için (genelde order id) */
  conversationId: string;
  iyzicoToken?: string;
  iyzicoPaymentUrl?: string;
  iyzicoPaymentId?: string;
  iyzicoMode?: "iyzilink" | "fastlink";
  emailSentAt?: string;
  emailError?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentOrderInput = Omit<PaymentOrder, "id" | "createdAt" | "updatedAt">;

/**
 * Kampanya / varyasyon performans metrikleri.
 * Gerçek reklam platformu entegrasyonu yokken demo/seed ile beslenir;
 * ileride Meta/Google sync aynı şemaya yazar.
 */
export interface CampaignMetrics {
  id: string;
  campaignId: string;
  variationId?: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  messages?: number;
  leads?: number;
}

export type CampaignMetricsInput = Omit<CampaignMetrics, "id">;

export interface CampaignMetricsSummary {
  impressions: number;
  clicks: number;
  spend: number;
  messages: number;
  leads: number;
  ctr: number;
  cpc: number;
}
