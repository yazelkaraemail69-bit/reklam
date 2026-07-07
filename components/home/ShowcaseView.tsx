import type { Business } from "@/lib/types";
import type { BusinessFormValues } from "@/components/home/BusinessForm";
import { Hero } from "@/components/showcase/Hero";
import { ServicesGrid } from "@/components/showcase/ServicesGrid";
import { ContactSection } from "@/components/showcase/ContactSection";
import { WhatsAppButton } from "@/components/showcase/WhatsAppButton";
import { ArrowLeftIcon, PencilIcon } from "@/components/ui/icons";

interface ShowcaseViewProps {
  business: BusinessFormValues;
  onEdit: () => void;
  onBack: () => void;
}

const FALLBACK_COVER_IMAGE =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80";

/**
 * `BusinessFormValues` (localStorage'dan gelen hafif demo verisi) yalnızca
 * önizleme amaçlıdır; gerçek `Business` kaydına dönüştürmeden mevcut vitrin
 * bileşenlerini (Hero, ServicesGrid, ContactSection...) doğrudan yeniden
 * kullanabilmek için eksik alanları makul varsayılanlarla tamamlıyoruz.
 */
function toPreviewBusiness(data: BusinessFormValues): Business {
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

export function ShowcaseView({ business, onEdit, onBack }: ShowcaseViewProps) {
  const previewBusiness = toPreviewBusiness(business);

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed left-4 top-4 z-50 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg backdrop-blur transition-colors hover:bg-white"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Listeye Dön
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg backdrop-blur transition-colors hover:bg-white"
        >
          <PencilIcon className="h-4 w-4" /> Bilgileri Düzenle
        </button>
      </div>

      <Hero business={previewBusiness} />
      <ServicesGrid services={previewBusiness.services} businessName={previewBusiness.name} />
      <ContactSection business={previewBusiness} />
      <WhatsAppButton whatsapp={previewBusiness.whatsapp} businessName={previewBusiness.name} />
    </main>
  );
}
