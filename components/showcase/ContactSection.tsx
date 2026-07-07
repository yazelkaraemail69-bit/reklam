import type { Business } from "@/lib/types";
import { LinkButton } from "@/components/ui/LinkButton";
import { buildTelLink, buildWhatsAppLink } from "@/lib/utils";
import {
  ClockIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";

export function ContactSection({ business }: { business: Business }) {
  const socialLinks = [
    business.social.instagram
      ? { href: business.social.instagram, label: "Instagram", Icon: InstagramIcon }
      : null,
    business.social.facebook
      ? { href: business.social.facebook, label: "Facebook", Icon: FacebookIcon }
      : null,
    business.social.website
      ? { href: business.social.website, label: "Web Sitesi", Icon: GlobeIcon }
      : null,
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  return (
    <section className="bg-brand-dark py-14 text-white sm:py-20">
      <div className="container-app grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-2xl font-black sm:text-3xl">İletişime Geçin</h2>
          <p className="mt-3 max-w-lg leading-7 text-white/80">
            {business.name} ekibi sorularınızı yanıtlamak ve size en iyi hizmeti sunmak için hazır.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-light" />
              <div className="text-sm leading-6 text-white/90">
                {business.address ? <p>{business.address}</p> : null}
                <p>{business.city}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
              <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-light" />
              <p className="text-sm leading-6 text-white/90">{business.phone}</p>
            </div>
            {business.email ? (
              <div className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
                <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-light" />
                <p className="break-all text-sm leading-6 text-white/90">{business.email}</p>
              </div>
            ) : null}
            {business.workingHours ? (
              <div className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-light" />
                <p className="text-sm leading-6 text-white/90">{business.workingHours}</p>
              </div>
            ) : null}
          </div>

          {socialLinks.length ? (
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-2xl bg-white p-6 text-emerald-950 shadow-xl sm:p-8">
          <h3 className="text-xl font-black">Hemen İletişime Geçin</h3>
          <p className="text-sm leading-6 text-slate-600">
            Tek tıkla arayın ya da WhatsApp üzerinden anında mesaj gönderin.
          </p>
          <LinkButton href={buildTelLink(business.phone)} size="lg" variant="primary">
            <PhoneIcon className="h-5 w-5" /> {business.phone}
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
