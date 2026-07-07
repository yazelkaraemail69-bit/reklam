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
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.
        </p>
        <Link href="/admin" className="text-sm font-semibold text-brand-dark hover:underline">
          Yönetim Paneli
        </Link>
      </div>
    </footer>
  );
}
