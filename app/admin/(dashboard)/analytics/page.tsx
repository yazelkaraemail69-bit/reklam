import { getCampaignById, getCampaigns, getMetrics, summarizeMetrics } from "@/lib/store";
import { AnalyticsSummary } from "@/components/admin/AnalyticsSummary";
import { AnalyticsGraph } from "@/components/admin/AnalyticsGraph";
import { VariationPerformance } from "@/components/admin/VariationPerformance";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const campaigns = await getCampaigns();
  const primary = campaigns[0] ?? (await getCampaignById("camp-demo-001"));
  const metrics = await getMetrics(primary?.id);
  const summary = summarizeMetrics(metrics);
  const allMetrics = await getMetrics();
  const allSummary = summarizeMetrics(allMetrics);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-emerald-950">Analitik</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gösterim, tıklama ve harcama özeti · demo verisiyle önizleme
          </p>
        </div>
        <LinkButton href="/kampanya" variant="outline">
          Yeni Kampanya
        </LinkButton>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Tüm kampanyalar genel durumu
        </h2>
        <AnalyticsSummary summary={allSummary} />
        <AnalyticsGraph metrics={allMetrics} />
      </div>

      {primary ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-black text-emerald-950">{primary.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Varyasyon bazlı performans — A/B kazananını buradan seçin
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            <AnalyticsSummary summary={summary} />
            <AnalyticsGraph metrics={metrics} />
            <VariationPerformance campaign={primary} metrics={metrics} />
          </CardBody>
        </Card>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-bold text-emerald-950">Gösterilecek metrik yok</p>
          <p className="mt-1 text-sm text-slate-500">Önce bir kampanya oluşturun.</p>
        </div>
      )}
    </div>
  );
}
