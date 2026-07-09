const STEPS = [
  {
    number: "01",
    title: "İşletme ve lokasyon",
    description: "Kim olduğunuzu ve nerede hizmet verdiğinizi girin. Dar lokasyon = daha ucuz tıklama.",
  },
  {
    number: "02",
    title: "Paket seçin",
    description:
      "Başlangıç, Büyüme veya Pro — kuruşu kuruşuna net fiyat. Gizli ücret yok.",
  },
  {
    number: "03",
    title: "Önizle, öde, yayınla",
    description:
      "Instagram akış/hikâye önizlemesini görün. Iyzico ile ödeyin; 24 saat içinde yayına alınır.",
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
            Reklamcı olmadan kampanya kurun
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Sihirbaz sizi yormadan ilerletir; her adımda strateji ipuçları vardır.
          </p>
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
