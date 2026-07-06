export interface BusinessImage {
  id: number;
  business_id: number;
  public_url: string;
  object_key: string;
  original_filename: string;
  content_type?: string | null;
  sort_order: number;
  created_at: string;
}

export interface Business {
  id: number;
  business_name: string;
  owner_name: string;
  category: string;
  niche: string;
  city: string;
  district?: string | null;
  summary: string;
  services: string;
  target_audience?: string | null;
  phone: string;
  whatsapp?: string | null;
  address?: string | null;

  primary_image_url?: string | null;
  primary_image_object_key?: string | null;
  primary_image_original_filename?: string | null;
  generated_headline?: string | null;
  generated_subheadline?: string | null;
  generated_description?: string | null;
  google_ad_headlines?: string | null;
  google_ad_descriptions?: string | null;
  call_to_action?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  images: BusinessImage[];
}

export interface BusinessFormInput {
  business_name: string;
  owner_name: string;
  category: string;
  niche: string;
  city: string;
  district: string;
  summary: string;
  services: string;
  target_audience: string;
  phone: string;
  whatsapp: string;
  address: string;

  primary_image_url?: string;
  primary_image_object_key?: string;
  primary_image_original_filename?: string;
  generated_headline?: string;
  generated_subheadline?: string;
  generated_description?: string;
  google_ad_headlines?: string;
  google_ad_descriptions?: string;
  call_to_action?: string;
  is_published: boolean;
}

export interface AdCopyResponse {
  headline: string;
  subheadline: string;
  description: string;
  google_ad_headlines: string[];
  google_ad_descriptions: string[];
  call_to_action: string;
}

export interface IyzicoCheckoutInput {
  business_id?: number;
  amount: string;
  buyer_name: string;
  buyer_surname: string;
  email: string;
  phone: string;
  identity_number: string;
  registration_address: string;
  city: string;
  country: string;
  zip_code: string;
}

export interface IyzicoCheckoutResponse {
  conversation_id: string;
  token?: string | null;
  payment_page_url?: string | null;
  checkout_form_content?: string | null;
}

export interface SiteModeResponse {
  mode: "panel" | "showcase";
}


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data.detail) message = data.detail;
    } catch {
      // Keep user-friendly fallback.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function cleanPayload(input: BusinessFormInput): Record<string, string | boolean> {
  const payload: Record<string, string | boolean> = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      payload[key] = value;
      return;
    }
    const trimmed = value?.trim();
    if (trimmed) payload[key] = trimmed;
  });
  return payload;
}

export function listBusinesses(): Promise<Business[]> {
  return apiFetch<Business[]>("/businesses");
}

export function createBusiness(input: BusinessFormInput): Promise<Business> {
  return apiFetch<Business>("/businesses", {
    method: "POST",
    body: JSON.stringify(cleanPayload(input)),
  });
}

export function uploadBusinessImage(businessId: number, file: File): Promise<BusinessImage> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<BusinessImage>(`/businesses/${businessId}/images/upload`, {
    method: "POST",
    headers: {},
    body: formData,
  });
}

export function generateAdCopy(input: BusinessFormInput): Promise<AdCopyResponse> {
  return apiFetch<AdCopyResponse>("/api/ai/ad-copy", {
    method: "POST",
    body: JSON.stringify({
      business_name: input.business_name,
      category: input.category,
      niche: input.niche,
      city: input.city,
      summary: input.summary,
      services: input.services,
      target_audience: input.target_audience || null,
    }),
  });
}

export function startIyzicoCheckout(input: IyzicoCheckoutInput): Promise<IyzicoCheckoutResponse> {
  return apiFetch<IyzicoCheckoutResponse>("/api/payments/iyzico/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getSiteMode(): Promise<SiteModeResponse> {
  return apiFetch<SiteModeResponse>("/api/site/mode");
}


