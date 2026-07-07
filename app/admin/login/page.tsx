import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
