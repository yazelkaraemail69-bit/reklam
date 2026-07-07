import { buildWhatsAppLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/icons";

interface WhatsAppButtonProps {
  whatsapp: string;
  businessName: string;
}

export function WhatsAppButton({ whatsapp, businessName }: WhatsAppButtonProps) {
  if (!whatsapp) return null;

  const message = `Merhaba, ${businessName} sayfanız üzerinden bilgi almak istiyorum.`;

  return (
    <a
      href={buildWhatsAppLink(whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${businessName} ile WhatsApp üzerinden iletişime geç`}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/30 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 sm:h-16 sm:w-16"
    >
      <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      <span className="sr-only">WhatsApp ile iletişime geç</span>
    </a>
  );
}
