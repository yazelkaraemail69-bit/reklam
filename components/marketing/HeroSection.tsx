import { LinkButton } from "@/components/ui/LinkButton";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

const HIGHLIGHTS = [
  "Zamanınızı Meta paneline değil, işinize ayırın",
  "Profesyonel metin ve görsel kurgusu dahil",
  "Gizli ücret yok — paket fiyatı net tutar",
];

const FLOW_STEPS = [
  { step: "01", label: "İşletme & bölge", desc: "Hedef kitlenizi ve şehrinizi belirleyin" },
  { step: "02", label: "Hedef & paket", desc: "Size uygun bütçeyi seçin" },
  { step: "03", label: "Teklif + görsel", desc: "Fotoğraf ve teklifinizi girin" },
  { step: "04", label: "Önizle ve öde", desc: "AI reklam varyasyonlarını görün ve ödeyin" },
  { step: "05", label: "24s içinde yayın", desc: "Reklamlarınız yayına girsin" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-dark text-white">
      {/* Gelişmiş Arka Plan Gradient Dekorları */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 75% 20%, rgba(34,197,94,0.5), transparent), radial-gradient(ellipse 60% 50% at 15% 85%, rgba(134,239,172,0.25), transparent)",
        }}
        aria-hidden="true"
      />
      
      {/* Dekoratif Işık Halkası */}
      <div className="absolute -top-40 right-10 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />

      <div className="container-app relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-brand-light border border-brand-light/25 shadow-sm">
            ⚡ YENİ NESİL REKLAMCILIK
          </span>
          <h1 className="max-w-xl text-4xl font-black leading-[1.15] sm:text-5xl lg:text-6xl text-balance">
            Reklamcı olmadan,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-emerald-400 drop-shadow-sm">
              profesyonel reklam
            </span>{" "}
            — dakikalar içinde
          </h1>
          <p className="max-w-lg text-lg leading-8 text-white/85 sm:text-xl font-medium">
            Kötü bir fotoğraf ve iki cümle yeter. Biz satış odaklı metin ve görselleri hazırlarız;
            siz paketi seçip ödersiniz. Gizli ücret yok.
          </p>

          <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row pt-2">
            <LinkButton href="/kampanya" size="lg" className="shadow-lg shadow-brand/20 hover:shadow-brand/35 hover:scale-[1.02] transition-all duration-300">
              Kampanya oluştur <ArrowRightIcon className="h-5 w-5" />
            </LinkButton>
            <LinkButton
              href="#paketler"
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm"
            >
              Paketleri gör
            </LinkButton>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-white/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-light/15 text-brand-light">
                  <CheckCircleIcon className="h-4 w-4 shrink-0" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:block" aria-hidden="true">
          {/* Glassmorphic Dış Kutu */}
          <div className="relative rounded-3xl border border-white/15 bg-white/[0.03] p-8 backdrop-blur-md shadow-[0_0_50px_-12px_rgba(34,197,94,0.25)] hover:border-brand-light/30 transition-colors duration-500">
            
            {/* Süslü Köşe Noktaları */}
            <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-white/30" />
            <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-white/30" />
            <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-white/30" />
            <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-white/30" />
            
            <h3 className="text-center text-sm font-bold tracking-widest uppercase text-brand-light mb-6">
              REKLAM OLUŞTURMA SÜRECİ
            </h3>
            
            <div className="space-y-4">
              {FLOW_STEPS.map((item, index) => (
                <div
                  key={item.step}
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-brand-dark/45 px-5 py-3.5 hover:bg-white/[0.04] hover:border-brand-light/20 transition-all duration-300 hover:translate-x-2"
                  style={{ opacity: 1 - index * 0.06 }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-xs font-black text-white shadow-md shadow-brand/20 group-hover:bg-brand-light group-hover:text-brand-dark transition-colors duration-300">
                    {item.step}
                  </span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-bold text-white text-sm group-hover:text-brand-light transition-colors duration-300">{item.label}</span>
                    <span className="text-[11px] text-white/60 truncate">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-brand-light/80">
              <span>HIZLI</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>PROFESYONEL</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>GARANTİLİ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
