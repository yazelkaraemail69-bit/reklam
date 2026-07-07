"use client";

import { useEffect, useState } from "react";
import { BusinessForm } from "@/components/home/BusinessForm";
import { ShowcaseView } from "@/components/home/ShowcaseView";
import { clearDemoBusiness, loadDemoBusiness, saveDemoBusiness } from "@/lib/demo-storage";
import type { DemoBusinessData } from "@/lib/types";

export default function HomePage() {
  const [hasBusinessInfo, setHasBusinessInfo] = useState(false);
  const [businessData, setBusinessData] = useState<DemoBusinessData | null>(null);
  // Sunucuda (SSR) ve istemcinin ilk render'ında `localStorage` hiç okunmamış
  // olur; bu yüzden gerçek durum belli oluncaya kadar ikisinde de AYNI
  // (nötr) yükleniyor arayüzünü gösteriyoruz. Bu, React'in hydration
  // sırasında sunucu ile istemci çıktısını karşılaştırmasında uyuşmazlık
  // (hydration mismatch) hatası oluşmasını engeller.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // `window.localStorage`'a yalnızca component mount olduktan (yani
    // tarayıcıda çalışırken) erişiyoruz; sunucu tarafında bu efekt hiç
    // çalışmaz, dolayısıyla "window is not defined" gibi bir hata oluşmaz.
    // `localStorage` render sırasında (SSR'da) okunamayan, gerçek bir dış
    // sistem olduğundan bu senkronizasyon bilinçli olarak `useEffect`
    // içinde yapılıyor; bu yüzden `set-state-in-effect` kuralını burada
    // kasıtlı olarak devre dışı bırakıyoruz.
    const stored = loadDemoBusiness();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBusinessData(stored);
      setHasBusinessInfo(true);
    }
    setIsReady(true);
  }, []);

  function handleFormSubmit(data: DemoBusinessData) {
    saveDemoBusiness(data);
    setBusinessData(data);
    setHasBusinessInfo(true);
  }

  function handleReset() {
    clearDemoBusiness();
    setBusinessData(null);
    setHasBusinessInfo(false);
  }

  if (!isReady) {
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

  if (hasBusinessInfo && businessData) {
    return <ShowcaseView business={businessData} onReset={handleReset} />;
  }

  return <BusinessForm onSubmit={handleFormSubmit} />;
}
