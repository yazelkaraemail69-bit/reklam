"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Business, BusinessInput, BusinessService } from "@/lib/types";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LoaderIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";

interface BusinessFormProps {
  mode: "create" | "edit";
  initialData?: Business;
}

const EMPTY_FORM: BusinessInput = {
  slug: "",
  name: "",
  slogan: "",
  description: "",
  category: BUSINESS_CATEGORIES[0],
  city: "",
  address: "",
  phone: "",
  whatsapp: "",
  email: "",
  workingHours: "",
  logoUrl: "",
  coverImageUrl: "",
  galleryImages: [],
  services: [],
  social: { instagram: "", facebook: "", tiktok: "", website: "" },
  seoTitle: "",
  seoDescription: "",
  customHeadScript: "",
  isPublished: true,
};

function toFormState(business?: Business): BusinessInput {
  if (!business) return EMPTY_FORM;
  return {
    slug: business.slug,
    name: business.name,
    slogan: business.slogan,
    description: business.description,
    category: business.category,
    city: business.city,
    address: business.address,
    phone: business.phone,
    whatsapp: business.whatsapp,
    email: business.email,
    workingHours: business.workingHours,
    logoUrl: business.logoUrl,
    coverImageUrl: business.coverImageUrl,
    galleryImages: business.galleryImages,
    services: business.services,
    social: business.social,
    seoTitle: business.seoTitle,
    seoDescription: business.seoDescription,
    customHeadScript: business.customHeadScript,
    isPublished: business.isPublished,
  };
}

export function BusinessForm({ mode, initialData }: BusinessFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<BusinessInput>(() => toFormState(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof BusinessInput>(key: K, value: BusinessInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateSocial(key: keyof BusinessInput["social"], value: string) {
    setForm((current) => ({ ...current, social: { ...current.social, [key]: value } }));
  }

  function updateGalleryImage(index: number, value: string) {
    setForm((current) => {
      const next = [...current.galleryImages];
      next[index] = value;
      return { ...current, galleryImages: next };
    });
  }

  function addGalleryImage() {
    setForm((current) => ({ ...current, galleryImages: [...current.galleryImages, ""] }));
  }

  function removeGalleryImage(index: number) {
    setForm((current) => ({
      ...current,
      galleryImages: current.galleryImages.filter((_, i) => i !== index),
    }));
  }

  function updateService(index: number, patch: Partial<BusinessService>) {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const cleanedForm: BusinessInput = {
      ...form,
      galleryImages: form.galleryImages.filter((url) => url.trim().length > 0),
      services: form.services.filter((service) => service.title.trim().length > 0),
    };

    try {
      const endpoint = mode === "create" ? "/api/businesses" : `/api/businesses/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "İşlem başarısız oldu.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız oldu.");
      setIsSubmitting(false);
    }
  }

  return (
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
          <Input
            label="URL (slug)"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            placeholder="boş bırakılırsa isimden otomatik oluşturulur"
            hint="Sayfa adresiniz: /isletme-adi"
          />
          <div className="sm:col-span-2">
            <Input
              label="Slogan"
              required
              value={form.slogan}
              onChange={(e) => updateField("slogan", e.target.value)}
              placeholder="Kısa ve etkileyici bir slogan"
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Açıklama"
              required
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="İşletmenizi tanıtan detaylı açıklama"
            />
          </div>
          <Select
            label="Kategori"
            required
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            {BUSINESS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Input
            label="Şehir"
            required
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="İstanbul"
          />
          <div className="sm:col-span-2">
            <Input
              label="Adres"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Açık adres"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-emerald-950">İletişim Bilgileri</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Telefon"
            required
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+90 5xx xxx xx xx"
          />
          <Input
            label="WhatsApp Numarası"
            required
            value={form.whatsapp}
            onChange={(e) => updateField("whatsapp", e.target.value)}
            placeholder="905551234567"
            hint="Ülke kodu ile, sadece rakam. Örn: 905551234567"
          />
          <Input
            label="E-posta"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="info@isletmeniz.com"
          />
          <Input
            label="Çalışma Saatleri"
            value={form.workingHours}
            onChange={(e) => updateField("workingHours", e.target.value)}
            placeholder="Pazartesi - Cumartesi: 09:00 - 20:00"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-emerald-950">Görseller</h2>
          <p className="mt-1 text-sm text-slate-500">
            Görsel adreslerini (URL) girin. Herhangi bir görsel barındırma servisinden alabilirsiniz.
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          <Input
            label="Logo URL"
            value={form.logoUrl}
            onChange={(e) => updateField("logoUrl", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Kapak Görseli URL"
            required
            value={form.coverImageUrl}
            onChange={(e) => updateField("coverImageUrl", e.target.value)}
            placeholder="https://..."
          />

          <div className="space-y-3">
            <span className="text-sm font-semibold text-emerald-950">Galeri Görselleri</span>
            {form.galleryImages.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => updateGalleryImage(index, e.target.value)}
                  placeholder="https://..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  className="w-11 shrink-0 p-0"
                  onClick={() => removeGalleryImage(index)}
                  aria-label="Görseli kaldır"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addGalleryImage}>
              <PlusIcon className="h-4 w-4" /> Görsel Ekle
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-emerald-950">Hizmetler</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {form.services.map((service, index) => (
            <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
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

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-emerald-950">Sosyal Medya</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Instagram"
            value={form.social.instagram}
            onChange={(e) => updateSocial("instagram", e.target.value)}
            placeholder="https://instagram.com/..."
          />
          <Input
            label="Facebook"
            value={form.social.facebook}
            onChange={(e) => updateSocial("facebook", e.target.value)}
            placeholder="https://facebook.com/..."
          />
          <Input
            label="TikTok"
            value={form.social.tiktok}
            onChange={(e) => updateSocial("tiktok", e.target.value)}
            placeholder="https://tiktok.com/@..."
          />
          <Input
            label="Web Sitesi"
            value={form.social.website}
            onChange={(e) => updateSocial("website", e.target.value)}
            placeholder="https://..."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black text-emerald-950">SEO ve Script Injection</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bu işletme sayfasına özel Google Analytics, Meta Pixel veya reklam takip kodlarını
            buraya yapıştırabilirsiniz.
          </p>
        </CardHeader>
        <CardBody className="grid gap-5">
          <Input
            label="SEO Başlığı"
            value={form.seoTitle}
            onChange={(e) => updateField("seoTitle", e.target.value)}
            placeholder="Boş bırakılırsa işletme adı kullanılır"
          />
          <Textarea
            label="SEO Açıklaması"
            rows={2}
            value={form.seoDescription}
            onChange={(e) => updateField("seoDescription", e.target.value)}
            placeholder="Arama motorlarında görünecek açıklama"
          />
          <Textarea
            label="Özel Script (isteğe bağlı)"
            rows={5}
            value={form.customHeadScript}
            onChange={(e) => updateField("customHeadScript", e.target.value)}
            placeholder="<script>...</script>"
            className="font-mono text-sm"
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-emerald-950">Yayın Durumu</p>
            <p className="text-sm text-slate-500">
              Yayında olmayan işletmeler sitede görünmez.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={form.isPublished}
              onChange={(e) => updateField("isPublished", e.target.checked)}
            />
            <div className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand" />
            <div className="absolute left-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </label>
        </CardBody>
      </Card>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin")}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderIcon className="h-4 w-4" /> : null}
          {mode === "create" ? "İşletmeyi Oluştur" : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </form>
  );
}
