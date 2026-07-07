import {
  CodeIcon,
  LayoutDashboardIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StoreIcon,
} from "@/components/ui/icons";

const FEATURES = [
  {
    Icon: StoreIcon,
    title: "Özel İşletme Sayfası",
    description: "Her işletme kendi benzersiz adresine (/isletme-adiniz) sahip olur.",
  },
  {
    Icon: LayoutDashboardIcon,
    title: "Kolay Yönetim Paneli",
    description: "İçeriklerinizi, görsellerinizi ve hizmetlerinizi tek panelden yönetin.",
  },
  {
    Icon: PhoneIcon,
    title: "WhatsApp Entegrasyonu",
    description: "Sayfanıza sabitlenmiş WhatsApp butonuyla ziyaretçiler size anında ulaşır.",
  },
  {
    Icon: CodeIcon,
    title: "Script Injection",
    description: "Google Analytics, Meta Pixel veya reklam scriptlerinizi kolayca ekleyin.",
  },
  {
    Icon: SparklesIcon,
    title: "Yüksek Performans",
    description: "Next.js altyapısı ile hızlı yüklenen, SEO dostu ve mobil uyumlu sayfalar.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Güvenli Altyapı",
    description: "Şifre korumalı yönetim paneli ve güvenli oturum yönetimi.",
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
            İhtiyacınız olan her şey tek platformda
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
