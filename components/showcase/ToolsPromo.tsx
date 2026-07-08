import { LinkButton } from "@/components/ui/LinkButton";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icons";
import { TOOLS_SITE_URL } from "@/lib/constants";

interface ToolsPromoProps {
  /**
   * "section": tam genişlikte, işletme vitrin sayfalarının altına eklenen
   * bağımsız bir bölüm (bkz. app/[slug]/page.tsx, ShowcaseView.tsx).
   * "compact": ana demo sayfası gibi daha dar/iç içe yerler için tek kart.
   */
  variant?: "section" | "compact";
}

/**
 * Reklamını verdiğimiz işletmelere, kardeş ürünümüz olan Dijital Kartvizit +
 * Menü + AI Shorts video oluşturucuyu (ayrı bir proje/site, bkz.
 * dijital-kartvizit-menu/) öneren küçük bir çapraz tanıtım bileşeni. Mevcut
 * hiçbir sayfanın temasını/özelliğini değiştirmez; yalnızca eklenen bağımsız
 * bir bölümdür.
 */
export function ToolsPromo({ variant = "section" }: ToolsPromoProps) {
  const content = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-dark">
        <SparklesIcon className="h-6 w-6" />
      </span>
      <div className="flex-1">
        <h3 className="text-lg font-black text-emerald-950">
          Dijital Kartvizitiniz ve Menünüz de Hazır mı?
        </h3>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-600">
          Kardeş aracımızla saniyeler içinde paylaşıma hazır bir dijital kartvizit,
          QR kodlu bir dijital menü ya da yapay zekâ destekli bir Shorts video
          senaryosu oluşturun — tamamen ücretsiz.
        </p>
      </div>
      <LinkButton href={TOOLS_SITE_URL} external size="md" variant="primary" className="shrink-0">
        Ücretsiz Dene <ArrowRightIcon className="h-4 w-4" />
      </LinkButton>
    </>
  );

  if (variant === "compact") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-brand-light/60 bg-brand-50 p-5 sm:flex-row sm:items-center">
        {content}
      </div>
    );
  }

  return (
    <section className="border-t border-slate-100 bg-brand-50 py-12 sm:py-14">
      <div className="container-app">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-brand-light/60 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          {content}
        </div>
      </div>
    </section>
  );
}
