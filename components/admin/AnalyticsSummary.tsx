import type { CampaignMetricsSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

function MetricCard({ label, value, hint, accent }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        accent ? "border-brand/30 bg-brand-50" : "border-slate-200 bg-white"
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-emerald-950 sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
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

interface AnalyticsSummaryProps {
  summary: CampaignMetricsSummary;
}

export function AnalyticsSummary({ summary }: AnalyticsSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Gösterim" value={formatNumber(summary.impressions)} />
      <MetricCard label="Tıklama" value={formatNumber(summary.clicks)} accent />
      <MetricCard label="Harcama" value={formatMoney(summary.spend)} />
      <MetricCard
        label="CTR"
        value={`%${summary.ctr.toFixed(2)}`}
        hint={`CPC ${formatMoney(summary.cpc)}`}
      />
      <MetricCard label="Mesaj" value={formatNumber(summary.messages)} hint="WhatsApp / DM" />
      <MetricCard label="Lead" value={formatNumber(summary.leads)} hint="Form / teklif" />
    </div>
  );
}
