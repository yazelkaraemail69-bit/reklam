import { LinkButton } from "@/components/ui/LinkButton";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-50 px-4 text-center">
      <span className="text-7xl font-black text-brand-dark">404</span>
      <h1 className="text-2xl font-black text-emerald-950 sm:text-3xl">Sayfa bulunamadı</h1>
      <p className="max-w-md leading-7 text-slate-600">
        Aradığınız işletme sayfası kaldırılmış, adı değişmiş ya da hiç var olmamış olabilir.
      </p>
      <LinkButton href="/" variant="primary" size="lg">
        Ana Sayfaya Dön
      </LinkButton>
    </main>
  );
}
