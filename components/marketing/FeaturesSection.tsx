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
    title: "Satış odaklı metin",
    description:
      "Ham teklifinizi sloganlara dönüştürürüz. Siz yazın; müşteriye hitap eden metin hazır gelsin.",
  },
  {
    Icon: StoreIcon,
    title: "A/B test varyasyonları",
    description: "Aynı girdiden birden fazla reklam metni; hangisinin daha çok mesaj getirdiğini görün.",
  },
  {
    Icon: ImageIcon,
    title: "Hazır görsel formatları",
    description: "Tek fotoğraftan Instagram, Reels ve Google Ads boyutları — kırpma derdi yok.",
  },
  {
    Icon: LayoutDashboardIcon,
    title: "Sonuçları takip edin",
    description: "Gösterim, tıklama ve mesajlar tek bakışta; hangi metnin kazandığını görün.",
  },
  {
    Icon: PhoneIcon,
    title: "WhatsApp’a yönlendirme",
    description: "Yerel işletmeler için mesaj ve arama odaklı reklam — tıklamadan müşteriye.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Adım adım ilerleme",
    description: "Reklam jargonuna boğulmadan; her adımda net yönlendirme ile kampanya kurun.",
  },
];

export function FeaturesSection() {
  return (
    <section id="ozellikler" className="py-20 sm:py-28 bg-white">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-dark">
            Özellikler
          </span>
          <h2 className="mt-4 text-3xl font-black text-emerald-950 sm:text-4xl">
            Dönüşüm için gereken her şey
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-light/35"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand-dark group-hover:bg-brand group-hover:text-white transition-all duration-300">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-black text-emerald-950 group-hover:text-brand-dark transition-colors duration-300">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-500 font-medium">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
