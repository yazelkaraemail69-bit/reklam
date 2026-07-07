import { LinkButton } from "@/components/ui/LinkButton";
import { ArrowRightIcon } from "@/components/ui/icons";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-app">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand px-6 py-14 text-center text-white sm:px-16">
          <h2 className="max-w-xl text-3xl font-black leading-tight sm:text-4xl">
            İşletmenizin dijital vitrinini bugün oluşturun
          </h2>
          <p className="max-w-lg leading-7 text-white/90">
            Kurulum ücretsiz, yönetimi çok kolay. Sadece birkaç dakikanızı ayırın.
          </p>
          <LinkButton
            href="/admin"
            size="lg"
            className="bg-white text-brand-dark hover:bg-brand-50"
          >
            Ücretsiz Başla <ArrowRightIcon className="h-5 w-5" />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
