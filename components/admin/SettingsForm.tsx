"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LoaderIcon } from "@/components/ui/icons";

export function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initialSettings.siteName);
  const [siteDescription, setSiteDescription] = useState(initialSettings.siteDescription);
  const [globalHeadScript, setGlobalHeadScript] = useState(initialSettings.globalHeadScript ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName, siteDescription, globalHeadScript }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ayarlar güncellenemedi.");
      }
      setSuccess("Ayarlar başarıyla kaydedildi.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ayarlar güncellenemedi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-emerald-950">Site Bilgileri</h2>
        </CardHeader>
        <CardBody className="grid gap-5">
          <Input
            label="Site Adı"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
          <Textarea
            label="Site Açıklaması"
            rows={3}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-emerald-950">Genel Script Injection</h2>
          <p className="mt-1 text-sm text-slate-500">
            Buraya eklediğiniz script tüm sayfalarda (ana sayfa ve tüm işletme sayfalarında) çalışır.
            Google Analytics, Google Tag Manager veya Meta Pixel kodunuzu buraya yapıştırabilirsiniz.
          </p>
        </CardHeader>
        <CardBody>
          <Textarea
            label="Script"
            rows={8}
            value={globalHeadScript}
            onChange={(e) => setGlobalHeadScript(e.target.value)}
            placeholder="<script>...</script>"
            className="font-mono text-sm"
          />
        </CardBody>
      </Card>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="rounded-lg border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-emerald-700"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderIcon className="h-4 w-4" /> : null} Ayarları Kaydet
        </Button>
      </div>
    </form>
  );
}
