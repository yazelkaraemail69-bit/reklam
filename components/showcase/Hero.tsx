import type { Business } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { buildTelLink, buildWhatsAppLink } from "@/lib/utils";
import { MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";

export function Hero({ business }: { business: Business }) {
  const location = business.address ? `${business.address}, ${business.city}` : business.city;

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-slate-950 text-white pt-24 pb-16">
      {/* 1. ARKA KATMAN: Atmosferik Renk Uyumlu Bulanık Zemin */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={business.coverImageUrl}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover blur-3xl opacity-35 scale-110 saturate-150 transform-gpu"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
      </div>

      {/* 2. ÖN KATMAN: Kesintisiz HD Görsel Çerçevesi & Bilgiler */}
      <div className="container-app relative z-10 grid gap-8 lg:grid-cols-12 items-center">
        {/* Sol Taraf: İşletme Detayları & Butonlar */}
        <div className="lg:col-span-7 flex flex-col gap-5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" className="bg-emerald-600 text-white font-bold px-3 py-1 text-xs">
              {business.category}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur border border-white/10">
              <MapPinIcon className="h-3.5 w-3.5 text-emerald-400" /> {location}
            </span>
          </div>

          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl tracking-tight">
            {business.name}
          </h1>

          <p className="text-lg leading-relaxed text-slate-200 sm:text-xl font-medium">
            {business.slogan}
          </p>

          <div className="pt-2 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={buildTelLink(business.phone)} size="lg" variant="primary">
              <PhoneIcon className="h-5 w-5" /> Hemen Ara
            </LinkButton>
            {business.whatsapp ? (
              <LinkButton
                href={buildWhatsAppLink(
                  business.whatsapp,
                  `Merhaba, ${business.name} sayfanız üzerinden bilgi almak istiyorum.`
                )}
                external
                size="lg"
                className="bg-[#25D366] hover:bg-[#1ebe57] focus-visible:ring-[#25D366]"
              >
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp&apos;tan Yaz
              </LinkButton>
            ) : null}
          </div>
        </div>

        {/* Sağ Taraf: Piksellenmeyen Keskin HD Cam Çerçeve */}
        <div className="lg:col-span-5 relative w-full max-h-[460px] overflow-hidden rounded-2xl border border-white/20 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={business.coverImageUrl}
            alt={`${business.name} kapak görseli`}
            className="w-full h-full max-h-[440px] object-cover object-top rounded-xl shadow-inner"
          />
        </div>
      </div>
    </section>
  );
}
