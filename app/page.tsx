"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PlusIcon, StoreIcon, TrashIcon } from "@/components/ui/icons";

/**
 * Client-side (localStorage) olarak yönetilen, en fazla `MAX_BUSINESS_COUNT`
 * kadar işletme tutabilen hafif veri modeli. Gerçek/kalıcı işletme kaydı için
 * `lib/types.ts` içindeki `Business` tipine ve admin panelindeki API'ye
 * (`lib/store.ts`) bakın; bu sayfa tamamen tarayıcıda çalışan, sunucuya hiç
 * istek atmayan bağımsız bir demodur.
 */
interface Business {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  description: string;
}

type BusinessFormState = Omit<Business, "id">;

const MAX_BUSINESS_COUNT = 10;
const STORAGE_KEY = "reklamx:client-businesses";

const EMPTY_FORM: BusinessFormState = {
  name: "",
  category: "",
  city: "",
  phone: "",
  description: "",
};

function isBusiness(value: unknown): value is Business {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.category === "string" &&
    typeof record.city === "string" &&
    typeof record.phone === "string" &&
    typeof record.description === "string"
  );
}

/** Yalnızca tarayıcıda çağrılmalıdır (SSR sırasında `window` mevcut değildir). */
function readBusinessesFromStorage(): Business[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBusiness).slice(0, MAX_BUSINESS_COUNT);
  } catch {
    return [];
  }
}

function writeBusinessesToStorage(businesses: Business[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
  } catch {
    // localStorage dolu/erişilemez olabilir (örn. gizli sekme kotası); bu
    // durumda değişiklik yalnızca bu oturumda bellekte kalır.
  }
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  // Sunucuda (SSR) ve istemcinin ilk render'ında `localStorage` hiç okunmamış
  // olur; gerçek veri belli oluncaya kadar sunucu ile istemcide AYNI (nötr)
  // "Yükleniyor" arayüzünü göstererek React'in hydration sırasında sunucu ve
  // istemci çıktısını karşılaştırmasında uyuşmazlık (hydration mismatch)
  // hatası oluşmasını engelliyoruz.
  const [isLoaded, setIsLoaded] = useState(false);
  const [form, setForm] = useState<BusinessFormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    // `window.localStorage`'a yalnızca component mount olduktan (yani
    // tarayıcıda çalışırken) erişiyoruz; bu efekt sunucu tarafında hiç
    // çalışmaz, dolayısıyla "window is not defined" hatası oluşmaz.
    // localStorage render sırasında (SSR'da) okunamayan gerçek bir dış
    // sistem olduğundan bu senkronizasyon bilinçli olarak `useEffect`
    // içinde yapılıyor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusinesses(readBusinessesFromStorage());
    setIsLoaded(true);
  }, []);

  function updateField<K extends keyof BusinessFormState>(key: K, value: BusinessFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAddBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Lütfen işletme adını girin.");
      return;
    }

    if (businesses.length < MAX_BUSINESS_COUNT) {
      const newBusiness: Business = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        category: form.category.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        description: form.description.trim(),
      };
      const next = [...businesses, newBusiness];
      setBusinesses(next);
      writeBusinessesToStorage(next);
      setForm(EMPTY_FORM);
    } else {
      setError(`En fazla ${MAX_BUSINESS_COUNT} işletme ekleyebilirsiniz.`);
    }
  }

  function handleDelete(id: string) {
    const next = businesses.filter((business) => business.id !== id);
    setBusinesses(next);
    writeBusinessesToStorage(next);
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm font-semibold text-slate-500" role="status">
          Yükleniyor...
        </p>
      </main>
    );
  }

  const isFull = businesses.length >= MAX_BUSINESS_COUNT;

  return (
    <main className="min-h-screen bg-brand-50/40 py-10 sm:py-16">
      <div className="container-app max-w-5xl space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">İşletmelerim</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            En fazla {MAX_BUSINESS_COUNT} işletme ekleyebilirsiniz. Veriler yalnızca bu
            tarayıcıda (localStorage) saklanır.
          </p>
          <p className="mt-2 text-sm font-bold text-brand-dark">
            {businesses.length}/{MAX_BUSINESS_COUNT} slot dolu
          </p>
        </div>

        {!isFull ? (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-black text-emerald-950">Yeni İşletme Ekle</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAddBusiness} className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="İşletme Adı"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Örn. Yeşil Vadi Kuaför"
                />
                <Input
                  label="Kategori"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="Örn. Kuaför"
                />
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
                <div className="sm:col-span-2">
                  <Textarea
                    label="Açıklama"
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Kısa açıklama"
                  />
                </div>

                {error ? (
                  <p className="sm:col-span-2 text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="flex justify-end sm:col-span-2">
                  <Button type="submit">
                    <PlusIcon className="h-4 w-4" /> İşletme Ekle
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        ) : (
          <div
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800"
            role="status"
          >
            {MAX_BUSINESS_COUNT} slot doldu. Yeni işletme eklemek için önce birini silin.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: MAX_BUSINESS_COUNT }, (_, index) => businesses[index]).map(
            (business, index) =>
              business ? (
                <div
                  key={business.id}
                  className="relative flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleDelete(business.id)}
                    className="absolute right-2 top-2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label={`${business.name} işletmesini kaldır`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <StoreIcon className="h-6 w-6 text-brand-dark" />
                  <h3 className="pr-6 font-bold text-emerald-950">{business.name}</h3>
                  {business.category ? (
                    <span className="text-xs font-semibold text-brand-dark">{business.category}</span>
                  ) : null}
                  {business.city ? <p className="text-xs text-slate-500">{business.city}</p> : null}
                  {business.phone ? <p className="text-xs text-slate-500">{business.phone}</p> : null}
                  {business.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{business.description}</p>
                  ) : null}
                </div>
              ) : (
                <div
                  key={`empty-${index}`}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-300"
                >
                  <StoreIcon className="h-6 w-6" />
                  <span className="text-xs font-semibold">Boş Slot {index + 1}</span>
                </div>
              )
          )}
        </div>
      </div>
    </main>
  );
}
