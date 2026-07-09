import type { Campaign, CampaignMetrics } from "@/lib/types";

interface VariationPerformanceProps {
  campaign: Campaign;
  metrics: CampaignMetrics[];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.round(value));
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function VariationPerformance({ campaign, metrics }: VariationPerformanceProps) {
  const rows = campaign.variations.map((variation) => {
    const related = metrics.filter((m) => m.variationId === variation.id);
    const impressions = related.reduce((sum, m) => sum + m.impressions, 0);
    const clicks = related.reduce((sum, m) => sum + m.clicks, 0);
    const spend = related.reduce((sum, m) => sum + m.spend, 0);
    const messages = related.reduce((sum, m) => sum + (m.messages ?? 0), 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    return { variation, impressions, clicks, spend, messages, ctr };
  });

  const bestCtr = Math.max(...rows.map((r) => r.ctr), 0);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-bold">Varyasyon</th>
            <th className="px-4 py-3 font-bold">Gösterim</th>
            <th className="px-4 py-3 font-bold">Tıklama</th>
            <th className="px-4 py-3 font-bold">CTR</th>
            <th className="px-4 py-3 font-bold">Harcama</th>
            <th className="px-4 py-3 font-bold">Mesaj</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ variation, impressions, clicks, spend, messages, ctr }) => {
            const isWinner = ctr === bestCtr && ctr > 0;
            return (
              <tr key={variation.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-dark text-xs font-bold text-white">
                      {variation.label}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-emerald-950">{variation.headline}</p>
                      <p className="text-xs text-slate-500">{variation.aspectRatio}</p>
                    </div>
                    {isWinner ? (
                      <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Önde
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{formatNumber(impressions)}</td>
                <td className="px-4 py-3 font-semibold text-emerald-950">{formatNumber(clicks)}</td>
                <td className="px-4 py-3 text-slate-700">%{ctr.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-700">{formatMoney(spend)}</td>
                <td className="px-4 py-3 text-slate-700">{formatNumber(messages)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
