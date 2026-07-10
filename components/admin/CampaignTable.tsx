import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { AD_PACKAGES, AD_PLATFORMS, getAdPackage } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";

const STATUS_LABEL: Record<Campaign["status"], string> = {
  draft: "Taslak",
  pending_payment: "Ödeme Bekliyor",
  ready: "Hazır",
  running: "Yayında",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
};

function platformLabels(campaign: Campaign): string {
  const platforms = campaign.platforms?.length ? campaign.platforms : ["meta"];
  return platforms
    .map((id) => AD_PLATFORMS.find((p) => p.value === id)?.label ?? id)
    .join(" · ");
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface CampaignTableProps {
  campaigns: Campaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="font-bold text-emerald-950">Henüz başvuru yok</p>
        <p className="mt-1 text-sm text-slate-500">
          Müşteriler sihirbazı tamamladığında başvurular burada otomatik görünür.
        </p>
        <div className="mt-4 flex justify-center">
          <LinkButton href="/kampanya">Kampanya Oluştur</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-bold">Müşteri / İşletme</th>
            <th className="px-4 py-3 font-bold">Paket</th>
            <th className="px-4 py-3 font-bold">Lokasyon</th>
            <th className="px-4 py-3 font-bold">Platform</th>
            <th className="px-4 py-3 font-bold">Tarih</th>
            <th className="px-4 py-3 font-bold">Durum</th>
            <th className="px-4 py-3 font-bold" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const pkg = getAdPackage(campaign.packageId);
            const businessLabel = campaign.businessName || campaign.name;
            return (
              <tr key={campaign.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <p className="font-semibold text-emerald-950">{businessLabel}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {campaign.customerEmail || "E-posta yok"}
                    {campaign.category ? ` · ${campaign.category}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {AD_PACKAGES.find((p) => p.id === campaign.packageId)?.name ?? pkg.name}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {campaign.location.district
                    ? `${campaign.location.district}, ${campaign.location.city}`
                    : campaign.location.city}
                </td>
                <td className="px-4 py-3 text-slate-700">{platformLabels(campaign)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(campaign.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge>{STATUS_LABEL[campaign.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/campaigns/${campaign.id}`}
                    className="text-sm font-semibold text-brand-dark hover:underline"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
