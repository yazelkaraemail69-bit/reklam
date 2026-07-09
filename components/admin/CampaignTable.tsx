import type { Campaign } from "@/lib/types";
import { CAMPAIGN_OBJECTIVES } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";

const STATUS_LABEL: Record<Campaign["status"], string> = {
  draft: "Taslak",
  ready: "Hazır",
  running: "Yayında",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
};

interface CampaignTableProps {
  campaigns: Campaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="font-bold text-emerald-950">Henüz kampanya yok</p>
        <p className="mt-1 text-sm text-slate-500">
          Wizard ile ilk kampanyanızı oluşturun.
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
            <th className="px-4 py-3 font-bold">Kampanya</th>
            <th className="px-4 py-3 font-bold">Hedef</th>
            <th className="px-4 py-3 font-bold">Lokasyon</th>
            <th className="px-4 py-3 font-bold">Bütçe / gün</th>
            <th className="px-4 py-3 font-bold">Varyasyon</th>
            <th className="px-4 py-3 font-bold">Durum</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const objective = CAMPAIGN_OBJECTIVES.find((o) => o.value === campaign.objective);
            return (
              <tr key={campaign.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-emerald-950">{campaign.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {campaign.targetAudience}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-700">{objective?.label ?? campaign.objective}</td>
                <td className="px-4 py-3 text-slate-700">
                  {campaign.location.district
                    ? `${campaign.location.district}, ${campaign.location.city}`
                    : campaign.location.city}
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-950">
                  {campaign.dailyBudget.toLocaleString("tr-TR")} TL
                </td>
                <td className="px-4 py-3 text-slate-700">{campaign.variations.length}</td>
                <td className="px-4 py-3">
                  <Badge>{STATUS_LABEL[campaign.status]}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
