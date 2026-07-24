"use client";

import type { InvoiceData } from "@/lib/pdf/invoice-generator";
import { generateInvoiceHtml } from "@/lib/pdf/invoice-generator";

interface InvoiceDownloadButtonProps {
  invoice: InvoiceData;
}

/**
 * Esnaf Portalında e-faturayı / makbuzu tek tıkla yeni pencerede açan
 * ve doğrudan yazdıran / PDF kaydeden buton bileşeni.
 */
export function InvoiceDownloadButton({ invoice }: InvoiceDownloadButtonProps) {
  const handlePrintInvoice = () => {
    const html = generateInvoiceHtml(invoice);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <button
      onClick={handlePrintInvoice}
      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow transition-colors"
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h55.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Faturayı PDF İndir / Yazdır
    </button>
  );
}
