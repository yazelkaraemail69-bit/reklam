"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon, LogOutIcon } from "@/components/ui/icons";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
    >
      {isLoading ? <LoaderIcon className="h-4 w-4" /> : <LogOutIcon className="h-4 w-4" />}
      Çıkış Yap
    </button>
  );
}
