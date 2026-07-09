import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { BusinessesShowcaseSection } from "@/components/marketing/BusinessesShowcaseSection";
import { CtaSection } from "@/components/marketing/CtaSection";
import { Footer } from "@/components/marketing/Footer";
import { getPublishedBusinesses, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, businesses] = await Promise.all([getSettings(), getPublishedBusinesses()]);

  return (
    <>
      <Navbar siteName={settings.siteName} />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <BusinessesShowcaseSection businesses={businesses} />
        <CtaSection />
      </main>
      <Footer siteName={settings.siteName} />
    </>
  );
}
