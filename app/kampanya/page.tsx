import Link from "next/link";
import { CampaignWizard } from "@/components/campaign/CampaignWizard";
import { StoreIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Reklam Kampanyası Oluştur",
  description: "Adım adım sihirbaz ile dönüşüm odaklı reklam kampanyası oluşturun.",
};

export default function KampanyaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <StoreIcon className="h-5 w-5" />
            </span>
            <span className="font-black">Reklam Vitrini</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            <Link href="/admin/campaigns" className="hidden hover:text-brand-dark sm:inline">
              Kampanyalarım
            </Link>
            <Link href="/" className="hover:text-brand-dark">
              Ana sayfa
            </Link>
          </div>
        </div>
      </header>

      <main className="container-app max-w-3xl py-10 sm:py-14">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">
            7 adımlık sihirbaz
          </p>
          <h1 className="mt-2 text-3xl font-black text-emerald-950 sm:text-4xl">
            Reklam Kampanyası Oluştur
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Reklam bilmenize gerek yok. Adım adım ilerleyin; hedef kitle, bütçe, görsel ve A/B
            metinleri sizin için hazırlansın.
          </p>
        </div>
        <CampaignWizard />
      </main>
    </div>
  );
}
