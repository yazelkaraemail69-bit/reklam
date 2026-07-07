import type { Business, DemoBusinessData } from "@/lib/types";
import { Hero } from "@/components/showcase/Hero";
import { ServicesGrid } from "@/components/showcase/ServicesGrid";
import { ContactSection } from "@/components/showcase/ContactSection";
import { WhatsAppButton } from "@/components/showcase/WhatsAppButton";
import { PencilIcon } from "@/components/ui/icons";

interface ShowcaseViewProps {
  business: DemoBusinessData;
  onReset: () => void;
}

const FALLBACK_COVER_IMAGE =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80";

/**
 * `DemoBusinessData` (localStorage'dan gelen hafif veri) yalnızca önizleme
 * amaçlıdır; gerçek `Business` kaydına dönüştürmeden mevcut vitrin
 * bileşenlerini (Hero, ServicesGrid, ContactSection...) doğrudan yeniden
 * kullanabilmek için eksik alanları makul varsayılanlarla tamamlıyoruz.
 */
function toPreviewBusiness(data: DemoBusinessData): Business {
  const now = new Date().toISOString();
  return {
    id: "demo-preview",
    slug: "demo-preview",
    name: data.name || "İşletmeniz",
    slogan: data.slogan,
    description: data.description,
    category: data.category || "Diğer",
    city: data.city,
    phone: data.phone,
    whatsapp: data.whatsapp,
    logoUrl: data.logoUrl,
    coverImageUrl: data.coverImageUrl || FALLBACK_COVER_IMAGE,
    galleryImages: [],
    services: data.services,
    social: {},
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function ShowcaseView({ business, onReset }: ShowcaseViewProps) {
  const previewBusiness = toPreviewBusiness(business);

  return (
    <main className="min-h-screen bg-white">
      <button
        type="button"
        onClick={onReset}
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg backdrop-blur transition-colors hover:bg-white"
      >
        <PencilIcon className="h-4 w-4" /> Bilgileri Düzenle
      </button>

      <Hero business={previewBusiness} />
      <ServicesGrid services={previewBusiness.services} businessName={previewBusiness.name} />
      <ContactSection business={previewBusiness} />
      <WhatsAppButton whatsapp={previewBusiness.whatsapp} businessName={previewBusiness.name} />
    </main>
  );
}
