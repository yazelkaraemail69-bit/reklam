import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = {
  title: "Site Ayarları",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-emerald-950">Site Ayarları</h1>
        <p className="mt-1 text-sm text-slate-500">
          Genel platform ayarlarını ve script injection alanını yönetin.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
