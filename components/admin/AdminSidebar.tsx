"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/admin/LogoutButton";
import {
  GlobeIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  StoreIcon,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "İşletmeler", Icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/campaigns", label: "Kampanyalar", Icon: SparklesIcon, exact: true },
  { href: "/admin/analytics", label: "Analitik", Icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/businesses/new", label: "Yeni İşletme", Icon: PlusIcon, exact: true },
  { href: "/admin/settings", label: "Site Ayarları", Icon: SettingsIcon, exact: true },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-brand-dark text-white">
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
          <StoreIcon className="h-5 w-5" />
        </span>
        <span className="text-lg font-black">Reklam Vitrini</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive ? "bg-brand text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <GlobeIcon className="h-4 w-4" /> Siteyi Görüntüle
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
