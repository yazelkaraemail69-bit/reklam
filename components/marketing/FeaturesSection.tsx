import {
  ImageIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  ShieldCheckIcon,
  StoreIcon,
  PhoneIcon,
} from "@/components/ui/icons";

const FEATURES = [
  {
    Icon: SparklesIcon,
    title: "AI hazır metin altyapısı",
    description:
      "Ham teklifinizi satış sloganlarına dönüştüren modüler katman. DeepSeek / OpenAI bağlanmaya hazır.",
  },
  {
    Icon: StoreIcon,
    title: "A/B test varyasyonları",
    description: "Aynı girdiden birden fazla reklam metni; hangisinin daha çok dönüştürdüğünü görün.",
  },
  {
    Icon: ImageIcon,
    title: "Platform görsel kırpma",
    description: "Instagram 1:1, Reels 9:16 ve Google Ads 16:9 — tek fotoğraftan üç format.",
  },
  {
    Icon: LayoutDashboardIcon,
    title: "Analitik paneli",
    description: "Gösterim, tıklama, harcama, CTR ve varyasyon karşılaştırması tek bakışta.",
  },
  {
    Icon: PhoneIcon,
    title: "WhatsApp odaklı dönüşüm",
    description: "Yerel işletmeler için mesaj ve arama CTA’ları — tıklamadan müşteriye.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Adım adım onboarding",
    description: "Reklam jargonuna boğulmadan; her adımda CRO ipuçlarıyla ilerleyen sihirbaz.",
  },
];

export function FeaturesSection() {
  return (
    <section id="ozellikler" className="py-20 sm:py-28">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-brand-dark">
            Özellikler
          </span>
          <h2 className="mt-3 text-3xl font-black text-emerald-950 sm:text-4xl">
            Dönüşüm için gereken her şey
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand-dark">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-emerald-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
