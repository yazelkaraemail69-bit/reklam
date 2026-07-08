import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdminPasswordConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Giriş Yap",
};

// `ADMIN_PASSWORD` build zamanında değil, her istekte okunmalı (aksi halde
// build sonrası eklenen/değiştirilen ortam değişkeni bu sayfada yansımaz).
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const isPasswordConfigured = isAdminPasswordConfigured();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-4 py-16">
      {!isPasswordConfigured ? (
        <div className="w-full max-w-md rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          <strong className="font-bold">Güvenlik uyarısı:</strong> <code>ADMIN_PASSWORD</code> ortam
          değişkeni tanımlı değil, bu yüzden hiçbir şifreyle giriş yapılamaz (panel kasıtlı olarak
          kilitli). Vercel projenizde <strong>Settings → Environment Variables</strong> kısmına
          güçlü, size özel bir <code>ADMIN_PASSWORD</code> ve <code>SESSION_SECRET</code> ekleyip
          yeniden deploy edin.
        </div>
      ) : null}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
