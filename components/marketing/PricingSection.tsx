import Link from "next/link";
import { AD_PACKAGES } from "@/lib/constants";
import { LinkButton } from "@/components/ui/LinkButton";
import { IyzicoTrustBadge } from "@/components/campaign/IyzicoTrustBadge";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PricingSection() {
  return (
    <section id="paketler" className="bg-white py-20 sm:py-28">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-brand-dark">
            Paketler
          </span>
          <h2 className="mt-3 text-3xl font-black text-emerald-950 sm:text-4xl">
            Ne ödeyeceğinizi şimdiden bilin
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Gizli ücret yok. Paket fiyatı = ödeyeceğiniz tutar. Ödeme sonrası ekibimiz 24 saat
            içinde yayına alır.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {AD_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                pkg.recommended
                  ? "border-brand bg-brand-50 ring-2 ring-brand/20"
                  : "border-slate-200 bg-white"
              }`}
            >
              {pkg.recommended ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  En çok tercih
                </span>
              ) : null}
              <p className="text-sm font-bold text-brand-dark">{pkg.tagline}</p>
              <h3 className="mt-1 text-2xl font-black text-emerald-950">{pkg.name}</h3>
              <p className="mt-4 text-3xl font-black text-emerald-950">
                {formatMoney(pkg.price)}
              </p>
              <p className="text-sm text-slate-500">{pkg.durationDays} gün yayın</p>
              <ul className="mt-6 flex-1 space-y-2">
                {pkg.features.map((feature) => (
                  <li key={feature} className="text-sm text-slate-600">
                    · {feature}
                  </li>
                ))}
              </ul>
              <LinkButton
                href={`/kampanya?package=${pkg.id}`}
                className="mt-6 w-full"
                variant={pkg.recommended ? "primary" : "outline"}
              >
                Bu paketi seç
              </LinkButton>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <IyzicoTrustBadge />
          <p className="mt-4 text-center text-xs text-slate-500">
            Detaylı kurulum için{" "}
            <Link href="/kampanya" className="font-semibold text-brand-dark hover:underline">
              kampanya sihirbazına
            </Link>{" "}
            gidin.
          </p>
        </div>
      </div>
    </section>
  );
}
