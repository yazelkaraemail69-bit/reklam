import Image from "next/image";
import type { Business } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { buildTelLink, buildWhatsAppLink } from "@/lib/utils";
import { MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";

export function Hero({ business }: { business: Business }) {
  const location = business.address ? `${business.address}, ${business.city}` : business.city;

  return (
    <section className="relative flex min-h-[85vh] items-end overflow-hidden bg-brand-dark text-white">
      <Image
        src={business.coverImageUrl}
        alt={`${business.name} kapak görseli`}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-60"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-emerald-950/10"
        aria-hidden="true"
      />

      <div className="container-app relative flex flex-col gap-6 pb-14 pt-32 sm:pb-20">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" className="bg-brand text-white">
            {business.category}
          </Badge>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            <MapPinIcon className="h-3.5 w-3.5" /> {location}
          </span>
        </div>

        <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
          {business.name}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-white/90 text-balance sm:text-xl">
          {business.slogan}
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
    </section>
  );
}
