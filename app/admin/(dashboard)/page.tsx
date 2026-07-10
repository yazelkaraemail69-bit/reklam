import { getBusinesses, getCampaigns, getPayments } from "@/lib/store";
import { BusinessTable } from "@/components/admin/BusinessTable";
import { CampaignTable } from "@/components/admin/CampaignTable";
import { LinkButton } from "@/components/ui/LinkButton";
import { PlusIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [businesses, campaigns, payments] = await Promise.all([
    getBusinesses(),
    getCampaigns(),
    getPayments(),
  ]);

  const publishedCount = businesses.filter((b) => b.isPublished).length;
  const recentCampaigns = campaigns.slice(0, 8);
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const readyCampaigns = campaigns.filter(
    (c) => c.status === "ready" || c.status === "running"
  ).length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-emerald-950">Yönetim paneli</h1>
        <p className="mt-1 text-sm text-slate-500">
          Müşteri başvuruları sihirbaz tamamlanınca otomatik buraya düşer.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Başvuru</p>
            <p className="mt-1 text-2xl font-black text-emerald-950">{campaigns.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hazır / yayında</p>
            <p className="mt-1 text-2xl font-black text-emerald-950">{readyCampaigns}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ödeme bekleyen</p>
            <p className="mt-1 text-2xl font-black text-emerald-950">{pendingPayments}</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-emerald-950">Son müşteri başvuruları</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kampanya sihirbazından gelen kayıtlar
            </p>
          </div>
          <LinkButton href="/admin/campaigns" variant="outline">
            Tümünü gör
          </LinkButton>
        </div>
        <CampaignTable campaigns={recentCampaigns} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-emerald-950">İşletmeler</h2>
            <p className="mt-1 text-sm text-slate-500">
              {businesses.length} işletme · {publishedCount} yayında
            </p>
          </div>
          <LinkButton href="/admin/businesses/new">
            <PlusIcon className="h-4 w-4" /> Yeni İşletme
          </LinkButton>
        </div>
        <BusinessTable businesses={businesses} />
      </section>
    </div>
  );
}
