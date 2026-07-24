"use client";

import { useEffect, useState } from "react";

/**
 * Google Consent Mode v2 Uyumlu Çerez Rıza Banner'ı.
 * 'ad_storage', 'ad_user_data', 'ad_personalization' sinyallerini
 * kullanıcının seçimine göre varsayılan/kabul durumuna ayarlar.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "granted");
    setShow(false);

    if (typeof window !== "undefined" && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "denied");
    setShow(false);

    if (typeof window !== "undefined" && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-slate-900 text-white p-5 rounded-xl shadow-2xl border border-slate-800 text-sm">
      <div className="flex items-start gap-3">
        <div className="text-xl">🍪</div>
        <div className="space-y-2">
          <h4 className="font-semibold text-base text-white">Çerez ve Veri İzni</h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Deneyiminizi iyileştirmek, performans ölçümleri ve kişiselleştirilmiş reklamcılık (Google Consent Mode v2) amacıyla çerezler kullanılmaktadır.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Kabul Et
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Reddet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
