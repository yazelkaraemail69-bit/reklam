"use client";

import { useState, type FormEvent } from "react";
import type { DemoBusinessData } from "@/lib/types";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PlusIcon, SparklesIcon, TrashIcon } from "@/components/ui/icons";

interface BusinessFormProps {
  onSubmit: (data: DemoBusinessData) => void;
}

const EMPTY_FORM: DemoBusinessData = {
  name: "",
  slogan: "",
  description: "",
  category: BUSINESS_CATEGORIES[0],
  city: "",
  phone: "",
  whatsapp: "",
  logoUrl: "",
  coverImageUrl: "",
  services: [{ title: "", description: "" }],
};

/**
 * Ana sayfadaki hızlı önizleme formu. Admin panelindeki tam `BusinessForm`
 * bileşeninden farklı olarak sunucuya hiçbir istek atmaz; girilen veriler
 * yalnızca üst bileşen (`app/page.tsx`) tarafından `localStorage`'a yazılır.
 */
export function BusinessForm({ onSubmit }: BusinessFormProps) {
  const [form, setForm] = useState<DemoBusinessData>(EMPTY_FORM);
  const [error, setError] = useState("");

  function updateField<K extends keyof DemoBusinessData>(key: K, value: DemoBusinessData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateService(index: number, patch: Partial<DemoBusinessData["services"][number]>) {
    setForm((current) => {
      const next = [...current.services];
      next[index] = { ...next[index], ...patch };
      return { ...current, services: next };
    });
  }

  function addService() {
    setForm((current) => ({
      ...current,
      services: [...current.services, { title: "", description: "" }],
    }));
  }

  function removeService(index: number) {
    setForm((current) => ({
      ...current,
      services: current.services.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.whatsapp.trim() || !form.coverImageUrl.trim()) {
      setError("Lütfen işletme adı, WhatsApp numarası ve kapak görseli alanlarını doldurun.");
      return;
    }

    onSubmit({
      ...form,
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      services: form.services.filter((service) => service.title.trim().length > 0),
    });
  }

  return (
    <main className="bg-brand-50 py-10 sm:py-16">
      <div className="container-app max-w-3xl">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-dark">
            <SparklesIcon className="h-3.5 w-3.5" /> Ücretsiz Anında Önizleme
          </span>
          <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">
            Reklam Vitrininizi Şimdi Oluşturun
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
            Bilgilerinizi girin, işletmenizin vitrin sayfasının nasıl görüneceğini anında görün.
            Kayıt gerekmez; verileriniz yalnızca bu tarayıcıda saklanır.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-black text-emerald-950">Temel Bilgiler</h2>
            </CardHeader>
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <Input
                label="İşletme Adı"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Örn. Yeşil Vadi Güzellik Salonu"
              />
              <Select
                label="Kategori"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                {BUSINESS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <div className="sm:col-span-2">
                <Input
                  label="Slogan"
                  value={form.slogan}
                  onChange={(e) => updateField("slogan", e.target.value)}
                  placeholder="Kısa ve etkileyici bir slogan"
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Açıklama"
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="İşletmenizi tanıtan kısa bir açıklama"
                />
              </div>
              <Input
                label="Şehir"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="İstanbul"
              />
              <Input
                label="Telefon"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+90 5xx xxx xx xx"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-black text-emerald-950">İletişim ve Görseller</h2>
            </CardHeader>
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <Input
                label="WhatsApp Numarası"
                required
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                placeholder="905551234567"
                hint="Ülke kodu ile, sadece rakam. Örn: 905551234567"
              />
              <Input
                label="Logo URL"
                value={form.logoUrl}
                onChange={(e) => updateField("logoUrl", e.target.value)}
                placeholder="https://..."
              />
              <div className="sm:col-span-2">
                <Input
                  label="Kapak Görseli URL"
                  required
                  value={form.coverImageUrl}
                  onChange={(e) => updateField("coverImageUrl", e.target.value)}
                  placeholder="https://..."
                  hint="Vitrin sayfanızın üst kısmında büyük görsel olarak kullanılır."
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-black text-emerald-950">Hizmetler</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {form.services.map((service, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"
                >
                  <Input
                    label="Hizmet Adı"
                    value={service.title}
                    onChange={(e) => updateService(index, { title: e.target.value })}
                    placeholder="Örn. Saç Kesimi"
                  />
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        label="Kısa Açıklama"
                        value={service.description}
                        onChange={(e) => updateService(index, { description: e.target.value })}
                        placeholder="Kısa açıklama"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      className="w-11 shrink-0 p-0"
                      onClick={() => removeService(index)}
                      aria-label="Hizmeti kaldır"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addService}>
                <PlusIcon className="h-4 w-4" /> Hizmet Ekle
              </Button>
            </CardBody>
          </Card>

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Vitrinimi Oluştur
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
