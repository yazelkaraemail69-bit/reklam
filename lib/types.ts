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
