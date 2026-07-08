"use client";

import { useEffect, useState } from "react";
import { BusinessForm, type BusinessFormValues } from "@/components/home/BusinessForm";
import { ShowcaseView } from "@/components/home/ShowcaseView";
import { ToolsPromo } from "@/components/showcase/ToolsPromo";
import { Badge } from "@/components/ui/Badge";
import { EyeIcon, MapPinIcon, PencilIcon, PlusIcon, StoreIcon, TrashIcon } from "@/components/ui/icons";

/**
 * Client-side (localStorage) olarak yönetilen, en fazla `MAX_BUSINESS_COUNT`
 * kadar işletme tutabilen hafif veri modeli. Gerçek/kalıcı işletme kaydı için
 * `lib/types.ts` içindeki `Business` tipine ve admin panelindeki API'ye
 * (`lib/store.ts`) bakın; bu sayfa tamamen tarayıcıda çalışan, sunucuya hiç
 * istek atmayan bağımsız bir demodur. Fotoğraflar sunucuya yüklenmez,
 * doğrudan sıkıştırılıp base64 olarak `localStorage`'a kaydedilir.
 */
interface BusinessService {
  title: string;
  description: string;
}

interface Business {
  id: string;
  name: string;
  slogan: string;
  description: string;
  category: string;
  city: string;
  phone: string;
  whatsapp: string;
  logoUrl: string;
  coverImageUrl: string;
  services: BusinessService[];
}

type View = "list" | "form" | "preview";

const MAX_BUSINESS_COUNT = 10;
const STORAGE_KEY = "reklamx:client-businesses:v2";

function isBusinessService(value: unknown): value is BusinessService {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.title === "string" && typeof record.description === "string";
}

function isBusiness(value: unknown): value is Business {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.slogan === "string" &&
    typeof record.description === "string" &&
    typeof record.category === "string" &&
    typeof record.city === "string" &&
    typeof record.phone === "string" &&
    typeof record.whatsapp === "string" &&
    typeof record.logoUrl === "string" &&
    typeof record.coverImageUrl === "string" &&
    Array.isArray(record.services) &&
    record.services.every(isBusinessService)
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
  // yükleniyor arayüzünü göstererek React'in hydration sırasında sunucu ve
  // istemci çıktısını karşılaştırmasında uyuşmazlık (hydration mismatch)
  // hatası oluşmasını engelliyoruz.
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<View>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // `window.localStorage`'a yalnızca component mount olduktan (yani
    // tarayıcıda çalışırken) erişiyoruz; bu efekt sunucu tarafında hiç
    // çalışmaz, dolayısıyla "window is not defined" hatası oluşmaz. localStorage
    // render sırasında (SSR'da) okunamayan gerçek bir dış sistem olduğundan bu
    // senkronizasyon bilinçli olarak `useEffect` içinde yapılıyor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusinesses(readBusinessesFromStorage());
    setIsLoaded(true);
  }, []);

  function persist(next: Business[]) {
    setBusinesses(next);
    writeBusinessesToStorage(next);
  }

  function backToList() {
    setView("list");
    setActiveId(null);
    setError("");
  }

  function openCreateForm() {
    if (businesses.length >= MAX_BUSINESS_COUNT) {
      setError(`En fazla ${MAX_BUSINESS_COUNT} işletme ekleyebilirsiniz.`);
      return;
    }
    setError("");
    setActiveId(null);
    setView("form");
  }

  function openEditForm(id: string) {
    setActiveId(id);
    setView("form");
  }

  function openPreview(id: string) {
    setActiveId(id);
    setView("preview");
  }

  function handleDelete(id: string) {
    persist(businesses.filter((business) => business.id !== id));
    if (activeId === id) backToList();
  }

  function handleFormSubmit(values: BusinessFormValues) {
    if (activeId) {
      persist(businesses.map((business) => (business.id === activeId ? { ...values, id: activeId } : business)));
      setView("preview");
      return;
    }

    if (businesses.length >= MAX_BUSINESS_COUNT) {
      setError(`En fazla ${MAX_BUSINESS_COUNT} işletme ekleyebilirsiniz.`);
      setView("list");
      return;
    }

    const id = crypto.randomUUID();
    persist([...businesses, { ...values, id }]);
    setActiveId(id);
    setView("preview");
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand"
          role="status"
          aria-label="Yükleniyor"
        />
      </main>
    );
  }

  const activeBusiness = activeId ? businesses.find((business) => business.id === activeId) : undefined;

  if (view === "preview" && activeBusiness) {
    return <ShowcaseView business={activeBusiness} onEdit={() => openEditForm(activeBusiness.id)} onBack={backToList} />;
  }

  if (view === "form") {
    return (
      <BusinessForm
        initialValues={activeBusiness}
        onSubmit={handleFormSubmit}
        onCancel={backToList}
        submitLabel={activeBusiness ? "Değişiklikleri Kaydet" : "Vitrinimi Oluştur"}
      />
    );
  }

  const isFull = businesses.length >= MAX_BUSINESS_COUNT;

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-brand-dark py-14 text-center text-white sm:py-20">
        <div className="container-app">
          <h1 className="text-3xl font-black sm:text-4xl">İşletmelerim</h1>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-white/80">
            Boş bir kutucuğa tıklayıp bilgilerinizi ve fotoğrafınızı ekleyin, saniyeler içinde
            profesyonel bir vitrin oluşturun. En fazla {MAX_BUSINESS_COUNT} işletme, veriler
            yalnızca bu tarayıcıda saklanır.
          </p>
          <p className="mt-3 text-sm font-bold text-brand-light">
            {businesses.length}/{MAX_BUSINESS_COUNT} slot dolu
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-app">
          {error ? (
            <p
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: MAX_BUSINESS_COUNT }, (_, index) => businesses[index]).map(
              (business, index) =>
                business ? (
                  <div
                    key={business.id}
                    className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={() => openPreview(business.id)}
                      className="relative block aspect-square w-full overflow-hidden bg-slate-100"
                    >
                      {business.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={business.coverImageUrl}
                          alt={business.name || "İşletme görseli"}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <StoreIcon className="h-8 w-8" />
                        </div>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 text-sm font-bold text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                        <EyeIcon className="h-4 w-4" /> Vitrini Gör
                      </span>
                    </button>
                    <div className="p-3">
                      {business.category ? <Badge variant="brand">{business.category}</Badge> : null}
                      <h3 className="mt-2 truncate text-sm font-bold text-emerald-950">
                        {business.name || "İsimsiz İşletme"}
                      </h3>
                      {business.city ? (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <MapPinIcon className="h-3.5 w-3.5" /> {business.city}
                        </p>
                      ) : null}
                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditForm(business.id)}
                          className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 transition-colors hover:bg-brand/10 hover:text-brand-dark"
                        >
                          <PencilIcon className="h-3.5 w-3.5" /> Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(business.id)}
                          aria-label={`${business.name || "İşletme"} kaydını sil`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    key={`empty-${index}`}
                    type="button"
                    onClick={openCreateForm}
                    disabled={isFull}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-light/70 text-brand-dark transition-colors hover:border-brand hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <PlusIcon className="h-6 w-6" />
                    <span className="px-2 text-center text-xs font-semibold">Yeni İşletme Ekle</span>
                  </button>
                )
            )}
          </div>

          {isFull ? (
            <div
              className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800"
              role="status"
            >
              {MAX_BUSINESS_COUNT} slot doldu. Yeni işletme eklemek için önce birini silin.
            </div>
          ) : null}

          <div className="mt-8">
            <ToolsPromo variant="compact" />
          </div>
        </div>
      </section>
    </main>
  );
}
