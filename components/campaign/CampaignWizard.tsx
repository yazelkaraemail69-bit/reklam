"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EMPTY_WIZARD_DRAFT,
  draftToCampaignInput,
  validateWizardStep,
  type CampaignWizardDraft,
} from "@/lib/campaign-draft";
import { CAMPAIGN_WIZARD_STEPS, BUSINESS_CATEGORIES, getAdPackage } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LoaderIcon } from "@/components/ui/icons";
import { WizardProgress } from "@/components/campaign/WizardProgress";
import { AdLivePreview } from "@/components/campaign/AdLivePreview";
import { IyzicoTrustBadge } from "@/components/campaign/IyzicoTrustBadge";
import { IdentityStep } from "@/components/campaign/steps/IdentityStep";
import { LocationStep } from "@/components/campaign/steps/LocationStep";
import { AudienceStep } from "@/components/campaign/steps/AudienceStep";
import { PlatformsStep } from "@/components/campaign/steps/PlatformsStep";
import { BudgetStep } from "@/components/campaign/steps/BudgetStep";
import { OfferStep } from "@/components/campaign/steps/OfferStep";
import { CreativeStep } from "@/components/campaign/steps/CreativeStep";
import { VariationsStep } from "@/components/campaign/steps/VariationsStep";

const INITIAL_DRAFT: CampaignWizardDraft = {
  ...EMPTY_WIZARD_DRAFT,
  category: BUSINESS_CATEGORIES[0],
};

interface CheckoutSuccess {
  campaignId: string;
  orderId: string;
  paymentUrl?: string;
  emailSent: boolean;
  email: string;
  amount: number;
  packageName?: string;
  warnings: string[];
}

export function CampaignWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<CampaignWizardDraft>(INITIAL_DRAFT);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CheckoutSuccess | null>(null);

  const step = CAMPAIGN_WIZARD_STEPS[stepIndex];
  const isLast = stepIndex === CAMPAIGN_WIZARD_STEPS.length - 1;
  const showPreview = step.id === "offer" || step.id === "creative" || step.id === "variations";
  const previewVariation = draft.variations[0] ?? null;
  const selectedPackage = getAdPackage(draft.packageId);

  function patchDraft(patch: Partial<CampaignWizardDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function goNext() {
    const validationError = validateWizardStep(step.id, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStepIndex((i) => Math.min(i + 1, CAMPAIGN_WIZARD_STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function saveCampaign() {
    const validationError = validateWizardStep(step.id, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = draftToCampaignInput(draft);
      payload.variations = (payload.variations ?? []).map((variation) => ({
        ...variation,
        imageUrl: draft.croppedImages[variation.aspectRatio] || draft.sourceImageUrl || undefined,
        status: "draft" as const,
      }));

      const res = await fetch("/api/checkout/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign: payload,
          customerEmail: draft.customerEmail.trim(),
          customerName: draft.businessName.trim(),
          packageId: draft.packageId,
          amount: selectedPackage.price,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Kayıt tamamlanamadı.");

      setSuccess({
        campaignId: data.campaign?.id ?? "ok",
        orderId: data.order?.id ?? "",
        paymentUrl: data.paymentUrl,
        emailSent: Boolean(data.emailSent),
        email: draft.customerEmail.trim(),
        amount: Number(data.order?.amount) || selectedPackage.price,
        packageName: selectedPackage.name,
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt tamamlanamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const amountLabel = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(success.amount);

    return (
      <Card>
        <CardBody className="space-y-4 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
            <CheckIcon className="h-7 w-7" />
          </span>
          <h2 className="text-2xl font-black text-emerald-950">Kaydınız alındı — ödeme bekleniyor</h2>
          <p className="mx-auto max-w-md text-slate-600">
            {success.packageName ? (
              <>
                <strong>{success.packageName}</strong> paketi ({amountLabel}).{" "}
              </>
            ) : null}
            Yayına almak için Iyzico ödeme linkini tamamlayın.
            {success.emailSent
              ? ` Link ${success.email} adresine gönderildi.`
              : " Ödeme linkini aşağıdan da açabilirsiniz."}
          </p>

          {success.warnings.length > 0 ? (
            <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
              {success.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          ) : null}

          <div className="mx-auto max-w-md">
            <IyzicoTrustBadge />
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {success.paymentUrl ? (
              <a
                href={success.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white"
              >
                Ödemeyi Tamamla — {amountLabel}
              </a>
            ) : null}
            <Link
              href="/admin/payments"
              className="inline-flex h-11 items-center rounded-lg border-2 border-brand px-5 text-sm font-semibold text-brand-dark"
            >
              Ödeme durumu
            </Link>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSuccess(null);
                setStepIndex(0);
                setDraft(INITIAL_DRAFT);
              }}
            >
              Yeni kampanya
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <WizardProgress currentIndex={stepIndex} />

      <div className={showPreview ? "grid gap-6 lg:grid-cols-[1fr_280px]" : undefined}>
        <Card>
          <CardBody className="space-y-6">
            {step.id === "identity" ? <IdentityStep draft={draft} onChange={patchDraft} /> : null}
            {step.id === "location" ? <LocationStep draft={draft} onChange={patchDraft} /> : null}
            {step.id === "audience" ? <AudienceStep draft={draft} onChange={patchDraft} /> : null}
            {step.id === "platforms" ? <PlatformsStep draft={draft} onChange={patchDraft} /> : null}
            {step.id === "budget" ? <BudgetStep draft={draft} onChange={patchDraft} /> : null}
            {step.id === "offer" ? <OfferStep draft={draft} onChange={patchDraft} /> : null}
            {step.id === "creative" ? <CreativeStep draft={draft} onChange={patchDraft} /> : null}
            {step.id === "variations" ? (
              <VariationsStep draft={draft} onChange={patchDraft} />
            ) : null}

            {error ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {isLast ? <IyzicoTrustBadge /> : null}

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <Button type="button" variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
                <ArrowLeftIcon className="h-4 w-4" /> Geri
              </Button>
              {isLast ? (
                <Button type="button" size="lg" onClick={saveCampaign} disabled={submitting}>
                  {submitting ? <LoaderIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                  Kaydet · {selectedPackage.price.toLocaleString("tr-TR")} TL
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={goNext}>
                  İleri <ArrowRightIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {showPreview ? (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AdLivePreview
              businessName={draft.businessName}
              imageUrl={draft.sourceImageUrl}
              croppedFeed={draft.croppedImages["1:1"]}
              croppedStory={draft.croppedImages["9:16"]}
              croppedLandscape={draft.croppedImages["16:9"]}
              platforms={draft.platforms}
              variation={previewVariation}
              rawOfferText={draft.rawOfferText}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
