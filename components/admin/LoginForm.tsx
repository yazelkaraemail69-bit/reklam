"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EyeIcon, EyeOffIcon, LoaderIcon, StoreIcon } from "@/components/ui/icons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Giriş başarısız oldu.");
      }

      const destination = searchParams.get("from") || "/admin";
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız oldu.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
          <StoreIcon className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-black text-emerald-950">Yönetim Paneline Giriş</h1>
        <p className="text-sm text-slate-500">Devam etmek için admin şifrenizi girin.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="relative">
          <Input
            label="Şifre"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={isLoading || !password}>
          {isLoading ? <LoaderIcon className="h-5 w-5" /> : null} Giriş Yap
        </Button>
      </form>
    </div>
  );
}
