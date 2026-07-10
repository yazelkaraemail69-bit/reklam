import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { TrustSection } from "@/components/marketing/TrustSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { BusinessesShowcaseSection } from "@/components/marketing/BusinessesShowcaseSection";
import { CtaSection } from "@/components/marketing/CtaSection";
import { Footer } from "@/components/marketing/Footer";
import { getPublishedBusinesses, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, businesses] = await Promise.all([
    getSettings(),
    getPublishedBusinesses(),
  ]);

  return (
    <>
      <Navbar siteName={settings.siteName} />
      <main>
        <HeroSection />
        <TrustSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <BusinessesShowcaseSection businesses={businesses} />
        <CtaSection />
      </main>
      <Footer siteName={settings.siteName} />
    </>
  );
}
