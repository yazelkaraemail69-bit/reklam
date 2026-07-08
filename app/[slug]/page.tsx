import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/showcase/Hero";
import { Gallery } from "@/components/showcase/Gallery";
import { ServicesGrid } from "@/components/showcase/ServicesGrid";
import { ContactSection } from "@/components/showcase/ContactSection";
import { ToolsPromo } from "@/components/showcase/ToolsPromo";
import { WhatsAppButton } from "@/components/showcase/WhatsAppButton";
import { ScriptInjector } from "@/components/common/ScriptInjector";
import { getBusinessBySlug } from "@/lib/store";

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

// generateStaticParams tanımlamadığımız için Next.js bu rotayı zaten istek
// anında (dynamic) render eder; admin panelinden yapılan güncellemelerin
// gecikmeden yansıması için bunu açıkça da belirtiyoruz.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business || !business.isPublished) {
    return { title: "İşletme bulunamadı" };
  }

  return {
    title: business.seoTitle || business.name,
    description: business.seoDescription || business.slogan,
    openGraph: {
      title: business.seoTitle || business.name,
      description: business.seoDescription || business.slogan,
      images: business.coverImageUrl ? [business.coverImageUrl] : undefined,
    },
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business || !business.isPublished) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <ScriptInjector html={business.customHeadScript} />
      <Hero business={business} />
      <Gallery images={business.galleryImages} businessName={business.name} />
      <ServicesGrid services={business.services} businessName={business.name} />
      <ContactSection business={business} />
      <ToolsPromo />
      <WhatsAppButton whatsapp={business.whatsapp} businessName={business.name} />
    </main>
  );
}
