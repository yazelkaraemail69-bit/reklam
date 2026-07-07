import { LinkButton } from "@/components/ui/LinkButton";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

const HIGHLIGHTS = [
  "Dakikalar içinde kurulum",
  "Mobil öncelikli, hızlı sayfalar",
  "WhatsApp ile anında iletişim",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-dark text-white">
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-app relative flex flex-col items-start gap-6 py-20 sm:py-28 lg:py-32">
        <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-brand-light backdrop-blur">
          İşletmeniz için reklam vitrini
        </span>
        <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          İşletmenizi <span className="text-brand-light">dakikalar içinde</span> internete taşıyın
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-white/85 text-balance sm:text-xl">
          Kendi özel adresinizde (/isletme-adiniz), mobil uyumlu, hızlı ve profesyonel bir tanıtım
          sayfası oluşturun. Tüm içeriği kendi yönetim panelinizden kontrol edin.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/admin" size="lg">
            Hemen Başla <ArrowRightIcon className="h-5 w-5" />
          </LinkButton>
          <LinkButton href="#vitrinler" size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
            Örnek Vitrinleri Gör
          </LinkButton>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <CheckCircleIcon className="h-4 w-4 text-brand-light" /> {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
