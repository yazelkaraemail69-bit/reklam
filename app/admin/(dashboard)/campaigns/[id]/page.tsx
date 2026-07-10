import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/store";
import { AD_CTAS, AD_PLATFORMS, CAMPAIGN_OBJECTIVES, getAdPackage } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  draft: "Taslak",
  pending_payment: "Ödeme Bekliyor",
  ready: "Hazır",
  running: "Yayında",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
} as const;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AdminCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaignById(id);
  if (!campaign) notFound();

  const pkg = getAdPackage(campaign.packageId);
  const objective = CAMPAIGN_OBJECTIVES.find((o) => o.value === campaign.objective);
  const platforms = (campaign.platforms?.length ? campaign.platforms : ["meta"])
    .map((id) => AD_PLATFORMS.find((p) => p.value === id)?.label ?? id)
    .join(" · ");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/campaigns" className="text-sm font-semibold text-brand-dark hover:underline">
            ← Kampanyalar
          </Link>
          <h1 className="mt-2 text-2xl font-black text-emerald-950">
            {campaign.businessName || campaign.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{formatDate(campaign.createdAt)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{STATUS_LABEL[campaign.status]}</Badge>
          </div>
        </div>
        {campaign.customerEmail ? (
          <LinkButton href={`mailto:${campaign.customerEmail}`} variant="outline">
            E-posta gönder
          </LinkButton>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-black text-emerald-950">Müşteri bilgileri</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">İşletme</dt>
              <dd className="mt-0.5 text-emerald-950">{campaign.businessName || campaign.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">E-posta</dt>
              <dd className="mt-0.5 text-emerald-950">{campaign.customerEmail || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Kategori</dt>
              <dd className="mt-0.5 text-emerald-950">{campaign.category || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Lokasyon</dt>
              <dd className="mt-0.5 text-emerald-950">
                {[campaign.location.district, campaign.location.city].filter(Boolean).join(", ")}
                {campaign.location.radiusKm ? ` · ${campaign.location.radiusKm} km` : ""}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Hedef kitle</dt>
              <dd className="mt-0.5 text-emerald-950">{campaign.targetAudience}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Kampanya hedefi</dt>
              <dd className="mt-0.5 text-emerald-950">{objective?.label ?? campaign.objective}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-black text-emerald-950">Paket & yayın</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Paket</dt>
              <dd className="mt-0.5 text-emerald-950">
                {pkg.name} · {pkg.price.toLocaleString("tr-TR")} TL
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Günlük bütçe</dt>
              <dd className="mt-0.5 text-emerald-950">
                {campaign.dailyBudget.toLocaleString("tr-TR")} TL
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Platform</dt>
              <dd className="mt-0.5 text-emerald-950">{platforms}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Kampanya adı</dt>
              <dd className="mt-0.5 text-emerald-950">{campaign.name}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-black text-emerald-950">Teklif metni</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {campaign.rawOfferText}
        </p>
      </section>

      {campaign.sourceImageUrl ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-black text-emerald-950">Görsel</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.sourceImageUrl}
            alt="Kampanya görseli"
            className="mt-4 max-h-80 rounded-xl border border-slate-100 object-contain"
          />
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-black text-emerald-950">
          Reklam varyasyonları ({campaign.variations.length})
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {campaign.variations.map((variation) => {
            const cta = AD_CTAS.find((c) => c.value === variation.cta);
            return (
              <div
                key={variation.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="dark">Varyasyon {variation.label}</Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    {variation.aspectRatio}
                  </span>
                </div>
                <p className="mt-3 font-bold text-emerald-950">{variation.headline}</p>
                <p className="mt-1 text-sm text-slate-600">{variation.primaryText}</p>
                <p className="mt-2 text-xs font-semibold text-brand-dark">
                  CTA: {cta?.label ?? variation.cta}
                </p>
                {variation.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={variation.imageUrl}
                    alt={`Varyasyon ${variation.label}`}
                    className="mt-3 max-h-40 rounded-lg object-cover"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
