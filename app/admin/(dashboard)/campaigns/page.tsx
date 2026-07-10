import { getCampaigns } from "@/lib/store";
import { CampaignTable } from "@/components/admin/CampaignTable";
import { LinkButton } from "@/components/ui/LinkButton";
import { PlusIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const campaigns = await getCampaigns();
  const readyCount = campaigns.filter((c) => c.status === "ready" || c.status === "running").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-emerald-950">Kampanya başvuruları</h1>
          <p className="mt-1 text-sm text-slate-500">
            {campaigns.length} başvuru · {readyCount} tanesi hazır / yayında. Müşteri sihirbazı
            tamamlayınca kayıtlar otomatik listelenir.
          </p>
        </div>
        <LinkButton href="/kampanya">
          <PlusIcon className="h-4 w-4" /> Yeni Kampanya
        </LinkButton>
      </div>

      <CampaignTable campaigns={campaigns} />
    </div>
  );
}
