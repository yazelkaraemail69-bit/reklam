"use client";

import { useState } from "react";
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
  const [billingCycle, setBillingCycle] = useState<"single" | "bundle">("single");

  return (
    <section id="paketler" className="bg-slate-50/50 py-20 sm:py-28 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-slate-200/60" />
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-dark">
            Fiyatlandırma
          </span>
          <h2 className="mt-4 text-3xl font-black text-emerald-950 sm:text-4xl">
            Ne ödeyeceğinizi şimdiden bilin
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Gizli ücret yok. Paket fiyatı = ödeyeceğiniz tutar. İhtiyacınıza göre tek kampanya veya çoklu paket seçin.
          </p>

          {/* İnteraktif Paket Seçici Toggle */}
          <div className="mt-8 inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingCycle("single")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                billingCycle === "single"
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tek Kampanya
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("bundle")}
              className={`relative rounded-lg px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === "bundle"
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              3'lü Kampanya Paketi
              <span className="absolute -top-3.5 -right-3 rounded-full bg-brand px-1.5 py-0.5 text-[8px] font-extrabold text-white uppercase tracking-wide">
                -%20
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {AD_PACKAGES.map((pkg) => {
            const isBundle = billingCycle === "bundle";
            const originalPrice = pkg.price * 3;
            const finalPrice = isBundle ? originalPrice * 0.8 : pkg.price;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-3xl border p-6.5 transition-all duration-300 hover:shadow-lg ${
                  pkg.recommended
                    ? "border-brand bg-white ring-2 ring-brand/10 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.15)] hover:scale-[1.01]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {pkg.recommended ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-emerald-600 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm shadow-brand/20">
                    En Popüler
                  </span>
                ) : null}
                
                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">{pkg.tagline}</p>
                <h3 className="mt-1 text-2xl font-black text-emerald-950">{pkg.name}</h3>
                
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-emerald-950">
                    {formatMoney(finalPrice)}
                  </span>
                  {isBundle ? (
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      {formatMoney(originalPrice)}
                    </span>
                  ) : null}
                </div>
                
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {isBundle ? "3 adet reklam kampanyası · 30 gün boyunca" : `${pkg.durationDays} gün boyunca yayında`}
                </p>
                
                <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-5">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                  {isBundle ? (
                    <li className="flex items-start gap-2 text-xs font-bold text-brand-dark">
                      <span className="text-brand">⚡</span>
                      <span>Dilediğiniz zaman başlatabileceğiniz 3 kupon</span>
                    </li>
                  ) : null}
                </ul>
                
                <LinkButton
                  href={`/kampanya?package=${pkg.id}${isBundle ? "&bundle=true" : ""}`}
                  className="mt-6 w-full py-2.5 font-bold shadow-sm"
                  variant={pkg.recommended ? "primary" : "outline"}
                >
                  {isBundle ? "Paketi Satın Al" : "Bu paketi seç"}
                </LinkButton>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <IyzicoTrustBadge />
          <p className="mt-4 text-center text-xs text-slate-500 font-semibold">
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
