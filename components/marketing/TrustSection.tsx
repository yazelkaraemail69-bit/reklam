import {
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/ui/icons";

const PILLARS = [
  {
    Icon: ClockIcon,
    title: "Zaman tasarrufu",
    description:
      "Meta paneline girmeden, 5 adımda kampanyanız hazır. Reklamcı bulma, brief yazma, format uğraşı yok.",
  },
  {
    Icon: SparklesIcon,
    title: "Profesyonel kurgu",
    description:
      "Ham fotoğraf ve iki cümleden satış odaklı metin, A/B varyasyonları ve platform görselleri üretilir.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Net fiyat, güvenli ödeme",
    description:
      "Gizli ücret yok — paket fiyatı = ödeyeceğiniz tutar. Ödeme Iyzico ile; 24 saat içinde yayına alınır.",
  },
];

const GUARANTEES = [
  "Gizli komisyon yok",
  "24 saat içinde yayın",
  "Iyzico ile güvenli ödeme",
  "Kayıt gerekmez",
];

export function TrustSection() {
  return (
    <section id="neden" className="bg-white py-20 sm:py-28">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-brand-dark">
            Neden Bizi Seçmelisiniz?
          </span>
          <h2 className="mt-3 text-3xl font-black text-emerald-950 sm:text-4xl">
            Reklam bütçeniz Ads&apos;e değil, müşterilere gitsin
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Ajans ücreti ve Ads paneli karmaşası olmadan; satış odaklı metin, doğru hedefleme ve
            net paket fiyatıyla kampanyanız yayına hazırlanır.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {PILLARS.map(({ Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand-dark">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-emerald-950">{title}</h3>
              <p className="text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>

        <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-slate-100 pt-10">
          {GUARANTEES.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircleIcon className="h-4 w-4 shrink-0 text-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
