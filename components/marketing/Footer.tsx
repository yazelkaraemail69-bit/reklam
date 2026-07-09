import Link from "next/link";
import { StoreIcon } from "@/components/ui/icons";

export function Footer({ siteName }: { siteName: string }) {
  return (
    <footer className="border-t border-slate-100 bg-white py-10">
      <div className="container-app flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-2 text-emerald-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <StoreIcon className="h-4 w-4" />
          </span>
          <span className="font-bold">{siteName}</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-slate-500">
          <Link href="/kampanya" className="hover:text-brand-dark">
            Kampanya Oluştur
          </Link>
          <Link href="/vitrin" className="hover:text-brand-dark">
            Vitrin Demosu
          </Link>
          <Link href="/admin" className="hover:text-brand-dark">
            Yönetim Paneli
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} {siteName}
        </p>
      </div>
    </footer>
  );
}
