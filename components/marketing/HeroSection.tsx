import { LinkButton } from "@/components/ui/LinkButton";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

const HIGHLIGHTS = [
  "5 dakikada reklamın hazır",
  "Sen yaz, biz satış odaklı metne dönüştürelim",
  "Gizli ücret yok — paket fiyatı net tutar",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-dark text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(34,197,94,0.45), transparent), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(134,239,172,0.2), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="container-app relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div className="flex flex-col items-start gap-6">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-light">
            Reklam Vitrini
          </p>
          <h1 className="max-w-xl text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
            Meta paneliyle uğraşmadan,{" "}
            <span className="text-brand-light">5 dakikada</span> reklam verin
          </h1>
          <p className="max-w-lg text-lg leading-8 text-white/85 sm:text-xl">
            Kötü bir fotoğraf ve iki cümle yeter. Biz satış odaklı metin ve görsel formatlarını
            hazırlarız; siz paketi seçip ödersiniz. Gizli ücret yok.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/kampanya" size="lg">
              Kampanya Oluştur <ArrowRightIcon className="h-5 w-5" />
            </LinkButton>
            <LinkButton
              href="#paketler"
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              Paketleri gör
            </LinkButton>
          </div>

          <ul className="mt-2 flex flex-col gap-2">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm font-semibold text-white/80">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur">
            <div className="space-y-3">
              {[
                { step: "01", label: "İşletme & lokasyon" },
                { step: "02", label: "Paket seç (net fiyat)" },
                { step: "03", label: "Görsel + canlı önizleme" },
                { step: "04", label: "Öde → 24s içinde yayın" },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-brand-dark/60 px-4 py-3"
                  style={{ opacity: 1 - index * 0.08 }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-black text-white">
                    {item.step}
                  </span>
                  <span className="font-bold text-white">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-xs font-semibold uppercase tracking-wide text-brand-light">
              Zaman · AI metin · Bütçe kontrolü
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
