const STEPS = [
  {
    number: "01",
    title: "Panele Giriş Yapın",
    description: "Yönetim panelinize giriş yapın ve yeni işletme kaydı oluşturmaya başlayın.",
  },
  {
    number: "02",
    title: "Bilgilerinizi Girin",
    description: "İşletme adınızı, hizmetlerinizi, iletişim bilgilerinizi ve görsellerinizi ekleyin.",
  },
  {
    number: "03",
    title: "Yayınlayın",
    description: "Tek tıkla yayına alın; sayfanız hemen /isletme-adiniz adresinde canlı olsun.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="nasil-calisir" className="bg-brand-50 py-20 sm:py-28">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-brand-dark">
            Nasıl Çalışır
          </span>
          <h2 className="mt-3 text-3xl font-black text-emerald-950 sm:text-4xl">
            3 adımda vitrininiz hazır
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="relative rounded-2xl bg-white p-8 shadow-sm">
              <span className="text-5xl font-black text-brand/30">{step.number}</span>
              <h3 className="mt-4 text-xl font-bold text-emerald-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
