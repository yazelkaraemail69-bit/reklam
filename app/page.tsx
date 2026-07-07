"use client";

import { useEffect, useRef, useState } from "react";
import { compressImageFile } from "@/lib/client-image";
import { ImageIcon, LoaderIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";

/**
 * Client-side (localStorage) olarak yönetilen, en fazla `MAX_BUSINESS_COUNT`
 * kadar işletme tutabilen hafif veri modeli. Gerçek/kalıcı işletme kaydı için
 * `lib/types.ts` içindeki `Business` tipine ve admin panelindeki API'ye
 * (`lib/store.ts`) bakın; bu sayfa tamamen tarayıcıda çalışan, sunucuya hiç
 * istek atmayan bağımsız bir demodur. Görseller sunucuya yüklenmez, doğrudan
 * sıkıştırılıp base64 olarak `localStorage`'a kaydedilir.
 */
interface Business {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  imageUrl: string;
}

const MAX_BUSINESS_COUNT = 10;
const STORAGE_KEY = "reklamx:client-businesses";
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";
// base64 boyutu ham dosyadan ~%33 daha büyüktür; localStorage kotasını
// (tarayıcı başına genelde 5-10 MB) aşmamak için makul bir üst sınır.
const MAX_DATA_URL_LENGTH = 3 * 1024 * 1024;

function isBusiness(value: unknown): value is Business {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.category === "string" &&
    typeof record.city === "string" &&
    typeof record.phone === "string" &&
    typeof record.imageUrl === "string"
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

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
}

function deriveNameFromFile(file: File): string {
  const base = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
  if (!base) return "Yeni İşletme";
  return base.replace(/\b\w/g, (char) => char.toLocaleUpperCase("tr-TR"));
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  // Sunucuda (SSR) ve istemcinin ilk render'ında `localStorage` hiç okunmamış
  // olur; gerçek veri belli oluncaya kadar sunucu ile istemcide AYNI (nötr)
  // "Yükleniyor" arayüzünü göstererek React'in hydration sırasında sunucu ve
  // istemci çıktısını karşılaştırmasında uyuşmazlık (hydration mismatch)
  // hatası oluşmasını engelliyoruz.
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  // Hangi kutucuğun yüklenmekte olduğunu izler: "new" (yeni işletme) veya
  // mevcut bir işletmenin id'si (fotoğraf değiştirme).
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const newFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null);

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

  function persist(next: Business[]) {
    setBusinesses(next);
    writeBusinessesToStorage(next);
  }

  function updateBusinessField(id: string, patch: Partial<Omit<Business, "id">>) {
    persist(businesses.map((business) => (business.id === id ? { ...business, ...patch } : business)));
  }

  async function processImageFile(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası (JPG, PNG, WEBP veya GIF) seçin.");
      return null;
    }
    const compressed = await compressImageFile(file);
    const dataUrl = await fileToDataUrl(compressed);
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      setError("Görsel çok büyük. Lütfen daha küçük boyutlu bir fotoğraf seçin.");
      return null;
    }
    return dataUrl;
  }

  async function handleNewFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (businesses.length >= MAX_BUSINESS_COUNT) {
      setError(`En fazla ${MAX_BUSINESS_COUNT} işletme ekleyebilirsiniz.`);
      return;
    }

    setError("");
    setUploadingSlot("new");
    try {
      const dataUrl = await processImageFile(file);
      if (!dataUrl) return;

      const newBusiness: Business = {
        id: crypto.randomUUID(),
        name: deriveNameFromFile(file),
        category: "",
        city: "",
        phone: "",
        imageUrl: dataUrl,
      };
      persist([...businesses, newBusiness]);
    } catch {
      setError("Görsel yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleReplaceFile(files: FileList | null) {
    const file = files?.[0];
    const targetId = replaceTargetId.current;
    if (!file || !targetId) return;

    setError("");
    setUploadingSlot(targetId);
    try {
      const dataUrl = await processImageFile(file);
      if (!dataUrl) return;
      updateBusinessField(targetId, { imageUrl: dataUrl });
    } catch {
      setError("Görsel güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setUploadingSlot(null);
      replaceTargetId.current = null;
    }
  }

  function handleDelete(id: string) {
    persist(businesses.filter((business) => business.id !== id));
  }

  function triggerReplace(id: string) {
    if (uploadingSlot) return;
    replaceTargetId.current = id;
    replaceFileInputRef.current?.click();
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
      <div className="container-app max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">İşletmelerim</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Boş bir kutucuğa tıklayıp bilgisayarınızdan fotoğraf seçin, işletmeniz otomatik
            eklensin. En fazla {MAX_BUSINESS_COUNT} işletme, veriler yalnızca bu tarayıcıda
            saklanır.
          </p>
          <p className="mt-2 text-sm font-bold text-brand-dark">
            {businesses.length}/{MAX_BUSINESS_COUNT} slot dolu
          </p>
        </div>

        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {isFull ? (
          <div
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800"
            role="status"
          >
            {MAX_BUSINESS_COUNT} slot doldu. Yeni işletme eklemek için önce birini silin.
          </div>
        ) : null}

        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: MAX_BUSINESS_COUNT }, (_, index) => businesses[index]).map(
            (business, index) =>
              business ? (
                <div
                  key={business.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-square w-full bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={business.imageUrl}
                      alt={business.name || "İşletme görseli"}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => triggerReplace(business.id)}
                      className="absolute left-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-slate-600 shadow transition-colors hover:text-brand-dark"
                      aria-label="Fotoğrafı değiştir"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(business.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-slate-600 shadow transition-colors hover:text-red-600"
                      aria-label={`${business.name || "İşletme"} kaydını sil`}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                    {uploadingSlot === business.id ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <LoaderIcon className="h-6 w-6 text-brand-dark" />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-3">
                    <input
                      value={business.name}
                      onChange={(e) => updateBusinessField(business.id, { name: e.target.value })}
                      placeholder="İşletme adı"
                      aria-label="İşletme adı"
                      className="w-full rounded border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-sm font-bold text-emerald-950 outline-none focus:border-brand"
                    />
                    <input
                      value={business.category}
                      onChange={(e) => updateBusinessField(business.id, { category: e.target.value })}
                      placeholder="Kategori"
                      aria-label="Kategori"
                      className="w-full rounded border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-xs text-slate-600 outline-none focus:border-brand"
                    />
                    <input
                      value={business.city}
                      onChange={(e) => updateBusinessField(business.id, { city: e.target.value })}
                      placeholder="Şehir"
                      aria-label="Şehir"
                      className="w-full rounded border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-xs text-slate-600 outline-none focus:border-brand"
                    />
                    <input
                      value={business.phone}
                      onChange={(e) => updateBusinessField(business.id, { phone: e.target.value })}
                      placeholder="Telefon"
                      aria-label="Telefon"
                      className="w-full rounded border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-xs text-slate-600 outline-none focus:border-brand"
                    />
                  </div>
                </div>
              ) : (
                <button
                  key={`empty-${index}`}
                  type="button"
                  onClick={() => newFileInputRef.current?.click()}
                  disabled={isFull || uploadingSlot !== null}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-brand hover:bg-brand-50 hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingSlot === "new" ? (
                    <LoaderIcon className="h-6 w-6" />
                  ) : (
                    <ImageIcon className="h-6 w-6" />
                  )}
                  <span className="px-2 text-center text-xs font-semibold">
                    {uploadingSlot === "new" ? "Yükleniyor..." : "Fotoğraf Ekle"}
                  </span>
                </button>
              )
          )}
        </div>

        {/* Yeni işletme eklemek için: boş bir kutucuğa tıklayınca bu gizli input tetiklenir. */}
        <input
          ref={newFileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="hidden"
          onChange={(e) => {
            handleNewFile(e.target.files);
            e.target.value = "";
          }}
        />
        {/* Mevcut bir işletmenin fotoğrafını değiştirmek için kullanılan gizli input. */}
        <input
          ref={replaceFileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="hidden"
          onChange={(e) => {
            handleReplaceFile(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </main>
  );
}
