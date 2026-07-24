"use client";

import type { Campaign } from "@/lib/types";

interface GoogleAdsExportButtonProps {
  campaign: Campaign;
}

/**
 * Kampanyayı Google Ads Editor ile %100 uyumlu CSV formatında indiren buton.
 * Operatör tek tıkla indirip Google Ads Editor'e import eder.
 */
export function GoogleAdsExportButton({ campaign }: GoogleAdsExportButtonProps) {
  const handleExportCSV = () => {
    const config = campaign.googleAds;
    if (!config) {
      alert("Bu kampanya için Google Ads yapılandırması henüz üretilmemiş.");
      return;
    }

    const campaignName = campaign.name || "Kampanya";
    const budget = campaign.dailyBudget || 100;
    const city = campaign.location?.city || "Türkiye";

    // Google Ads Editor CSV Header Format
    const csvRows = [
      [
        "Campaign",
        "Budget",
        "Campaign Status",
        "Networks",
        "Location",
        "Ad Group",
        "Headline 1",
        "Headline 2",
        "Headline 3",
        "Headline 4",
        "Description 1",
        "Description 2",
        "Keyword",
        "Criterion Type",
        "Final URL",
      ],
    ];

    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://reklavitrin.com"}/${
      campaign.businessId || ""
    }`;

    // RSA Ad Row
    csvRows.push([
      campaignName,
      budget.toString(),
      "Paused",
      "Search",
      city,
      "Genel Reklam Grubu",
      config.headlines[0] || "",
      config.headlines[1] || "",
      config.headlines[2] || "",
      config.headlines[3] || "",
      config.descriptions[0] || "",
      config.descriptions[1] || "",
      "",
      "",
      finalUrl,
    ]);

    // Keyword Rows
    config.keywords.forEach((kw) => {
      csvRows.push([
        campaignName,
        "",
        "",
        "",
        "",
        "Genel Reklam Grubu",
        "",
        "",
        "",
        "",
        "",
        "",
        kw.text,
        kw.matchType,
        "",
      ]);
    });

    // Negative Keyword Rows
    config.negativeKeywords.forEach((neg) => {
      csvRows.push([
        campaignName,
        "",
        "",
        "",
        "",
        "Genel Reklam Grubu",
        "",
        "",
        "",
        "",
        "",
        "",
        neg,
        "Negative",
        "",
      ]);
    });

    // CSV formatına dönüştürme ve indirme
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      csvRows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `google-ads-${campaign.name.toLowerCase().replace(/\s+/g, "-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExportCSV}
      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
      title="Google Ads Editor ile uyumlu CSV dosyasını indir"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Google Ads Editor CSV İndir
    </button>
  );
}
