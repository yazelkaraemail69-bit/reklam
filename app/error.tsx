"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Send error to Telemetry Logger endpoint
    fetch("/api/admin/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "ERROR",
        category: "UNHANDLED_EXCEPTION",
        message: error.message || "Beklenmeyen İstemci Hatası",
        stack: error.stack,
        context: { digest: error.digest, url: typeof window !== "undefined" ? window.location.href : "" },
      }),
    }).catch(() => null);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 font-bold text-2xl mx-auto flex items-center justify-center">
          !
        </div>
        <h2 className="text-xl font-bold text-white">Bir Hata Oluştu</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error.message || "Beklenmeyen bir hata meydana geldi. Bu durum otomatik telemetri sistemine kaydedildi."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            Yeniden Deneyin
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
