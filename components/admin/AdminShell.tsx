"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MenuIcon, XIcon } from "@/components/ui/icons";

export function AdminShell({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative h-full w-64">
            <AdminSidebar />
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Menüyü kapat"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-emerald-950 hover:bg-slate-100"
            aria-label="Menüyü aç"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="font-black text-emerald-950">Reklam Vitrini</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
