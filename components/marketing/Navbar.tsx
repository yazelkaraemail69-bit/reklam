import Link from "next/link";
import { LinkButton } from "@/components/ui/LinkButton";
import { StoreIcon } from "@/components/ui/icons";

export function Navbar({ siteName }: { siteName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="container-app flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-2 text-emerald-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <StoreIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-black tracking-tight sm:text-xl">{siteName}</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 sm:flex">
          <a href="#nasil-calisir" className="transition-colors hover:text-brand-dark">
            Nasıl Çalışır
          </a>
          <a href="#ozellikler" className="transition-colors hover:text-brand-dark">
            Özellikler
          </a>
          <a href="#vitrinler" className="transition-colors hover:text-brand-dark">
            Örnek Vitrinler
          </a>
        </div>

        <LinkButton href="/admin" size="sm">
          Yönetim Paneli
        </LinkButton>
      </nav>
    </header>
  );
}
