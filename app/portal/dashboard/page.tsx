"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { InvoiceDownloadButton } from "@/components/portal/InvoiceDownloadButton";
import { buildInvoiceData } from "@/lib/pdf/invoice-generator";
import type { Campaign } from "@/lib/types";

export default function PortalDashboardPage() {
  const searchParams = useSearchParams();
  const customerEmail = searchParams.get("email") || "esnaf@isletme.com";

  // Mock Active Campaign for Esnaf Portal Demonstration
  const mockCampaign: Campaign = {
    id: "cmp-demo-1",
    businessName: "Moda Güzellik & Estetik",
    category: "Güzellik ve Bakım",
    name: "Moda Güzellik - Lazer Epilasyon Kampanyası",
    objective: "messages",
    targetAudience: "25-45 yaş Kadıköy bölgesi kadın kitle",
    dailyBudget: 120,
    totalBudget: 2990,
    location: {
      city: "İstanbul",
      district: "Kadıköy",
      radiusKm: 10,
    },
    rawOfferText: "Lazer epilasyon paketi bu aya özel %30 indirimli!",
    status: "running",
    packageId: "growth",
    customerEmail,
    billing: {
      type: "corporate",
      companyName: "Moda Güzellik ve Bakım Hizmetleri Ltd. Şti.",
      taxOffice: "Kadıköy V.D.",
      taxNumber: "9876543210",
      address: "Moda Cd. No:14/A",
      city: "İstanbul",
      district: "Kadıköy",
    },
    variations: [
      {
        id: "var-1",
        label: "A",
        headline: "Kadıköy Lazer Epilasyon İndirimi",
        primaryText: "Sadece bu haftaya özel %30 indirim fırsatını kaçırmayın. WhatsApp'tan bilgi alın.",
        cta: "whatsapp",
        aspectRatio: "1:1",
        status: "winner",
        source: "ai",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    googleAds: {
      headlines: [
        "Kadıköy Lazer Epilasyon",
        "Moda Güzellik Salonu",
        "%30 İndirim Fırsatı",
        "Hemen Randevu Alın",
        "WhatsApp İletişim",
      ],
      descriptions: [
        "Kadıköy bölgesinde profesyonel lazer epilasyon hizmeti. Hemen bilgi alın!",
        "Moda Güzellik Salonu indirimli paketleriyle hizmetinizde.",
      ],
      keywords: [{ text: "lazer epilasyon fiyatları", matchType: "PHRASE" }],
      negativeKeywords: ["ücretsiz", "bedava"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const invoiceData = buildInvoiceData(mockCampaign);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                ● Reklamınız Canlı & Yayında
              </span>
              <span className="text-xs text-slate-400">14 Günlük Büyüme Paketi</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              {mockCampaign.businessName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Müşteri: {customerEmail} | Bölge: Kadıköy, İstanbul
            </p>
          </div>

          <div className="flex items-center gap-3">
            <InvoiceDownloadButton invoice={invoiceData} />
            <Link
              href="/"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors"
            >
              Çıkış Yap
            </Link>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div className="text-xs text-slate-400">WhatsApp Mesaj Sayısı</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">38</div>
            <div className="text-[11px] text-emerald-500 mt-1">↑ Bu hafta 14 yeni mesaj</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div className="text-xs text-slate-400">Gelen Telefon Arama</div>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">16</div>
            <div className="text-[11px] text-blue-400 mt-1">Doğrudan arayan müşteri</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div className="text-xs text-slate-400">Görüntülenme (Erişim)</div>
            <div className="text-3xl font-extrabold text-purple-400 mt-1">18,450</div>
            <div className="text-[11px] text-purple-400 mt-1">Kadıköy bölgesindeki kişiler</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div className="text-xs text-slate-400">Kalan Paket Süresi</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">8 Gün</div>
            <div className="text-[11px] text-amber-400 mt-1">14 günlük paket süresi</div>
          </div>
        </div>

        {/* Campaign Info & Quick Renewal Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>🎯 Yayınlanan Google & Instagram Reklam Başlıkları</span>
              <span className="text-xs text-emerald-400 font-normal">AI Tarafından Optimize Edildi</span>
            </h3>

            <div className="space-y-2">
              {mockCampaign.googleAds?.headlines.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs"
                >
                  <span className="text-slate-200">"{h}"</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {h.length}/30 Karakter
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-800/40 p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Yenileme Teklifi
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Reklam Yayınını Uzatın
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Müşteri akışınız kesilmesin! Paketinizi 1 tıkla uzatarak 14 gün boyunca kesintisiz WhatsApp mesajı almaya devam edin.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/?renew=true"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors inline-block text-center"
              >
                1 Tıkla Paketi Uzat (2.990 TL) ➔
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
