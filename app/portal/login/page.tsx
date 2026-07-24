"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PortalLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const magicToken = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Lütfen e-posta adresinizi giriniz.");
      return;
    }
    // Redirect to dashboard with query params
    router.push(`/portal/dashboard?email=${encodeURIComponent(email)}&orderId=${encodeURIComponent(orderId)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-white">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 text-2xl font-bold mb-3">
            R
          </div>
          <h1 className="text-2xl font-bold text-white">Esnaf Müşteri Portalı</h1>
          <p className="text-slate-400 text-xs mt-1">
            Reklam performansınızı, WhatsApp sayaçlarınızı ve faturanızı görüntüleyin.
          </p>
        </div>

        {magicToken ? (
          <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl text-center mb-6">
            <p className="text-emerald-300 text-sm font-medium">Sihirli Bağlantı Algılandı!</p>
            <p className="text-emerald-400/80 text-xs mt-1">Şifresiz tek tıkla giriş yapılıyor...</p>
            <Link
              href="/portal/dashboard?token=magic"
              className="inline-block mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg shadow"
            >
              Panetime Git ➔
            </Link>
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              E-Posta Adresiniz
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@isletme.com"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Sipariş / Fatura No (Opsiyonel)
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="RKV-123456"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 text-sm rounded-xl shadow-lg transition-colors"
          >
            Müşteri Paneline Giriş Yap ➔
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
