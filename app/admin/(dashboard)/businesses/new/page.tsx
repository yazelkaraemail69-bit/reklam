import type { Metadata } from "next";
import { BusinessForm } from "@/components/admin/BusinessForm";

export const metadata: Metadata = {
  title: "Yeni İşletme",
};

export default function NewBusinessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-emerald-950">Yeni İşletme Ekle</h1>
        <p className="mt-1 text-sm text-slate-500">İşletme bilgilerini doldurun ve yayınlayın.</p>
      </div>
      <BusinessForm mode="create" />
    </div>
  );
}
