"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EMPTY_WIZARD_DRAFT,
  draftToCampaignInput,
  validateWizardStep,
  type CampaignWizardDraft,
} from "@/lib/campaign-draft";
import { CAMPAIGN_WIZARD_STEPS, BUSINESS_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LoaderIcon } from "@/components/ui/icons";
import { WizardProgress } from "@/components/campaign/WizardProgress";
import { IdentityStep } from "@/components/campaign/steps/IdentityStep";
import { LocationStep } from "@/components/campaign/steps/LocationStep";
import { AudienceStep } from "@/components/campaign/steps/AudienceStep";
import { BudgetStep } from "@/components/campaign/steps/BudgetStep";
import { OfferStep } from "@/components/campaign/steps/OfferStep";
import { CreativeStep } from "@/components/campaign/steps/CreativeStep";
import { VariationsStep } from "@/components/campaign/steps/VariationsStep";

const INITIAL_DRAFT: CampaignWizardDraft = {
  ...EMPTY_WIZARD_DRAFT,
  category: BUSINESS_CATEGORIES[0],
};

export function CampaignWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<CampaignWizardDraft>(INITIAL_DRAFT);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const step = CAMPAIGN_WIZARD_STEPS[stepIndex];
  const isLast = stepIndex === CAMPAIGN_WIZARD_STEPS.length - 1;

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
      // Attach best cropped image per variation aspect ratio when available
      payload.variations = (payload.variations ?? []).map((variation) => ({
        ...variation,
        imageUrl: draft.croppedImages[variation.aspectRatio] || draft.sourceImageUrl || undefined,
        status: "active" as const,
      }));

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Kampanya kaydedilemedi.");
      setSuccessId(data.campaign?.id ?? "ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kampanya kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return (
      <Card>
        <CardBody className="space-y-4 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
            <CheckIcon className="h-7 w-7" />
          </span>
          <h2 className="text-2xl font-black text-emerald-950">Kampanyanız hazır</h2>
          <p className="mx-auto max-w-md text-slate-600">
            Varyasyonlar kaydedildi. Admin panelinden kampanyaları yönetebilir, analitikte
            performansını izleyebilirsiniz.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/admin/campaigns"
              className="inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white"
            >
              Kampanyalara git
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex h-11 items-center rounded-lg border-2 border-brand px-5 text-sm font-semibold text-brand-dark"
            >
              Analitiği gör
            </Link>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSuccessId(null);
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

      <Card>
        <CardBody className="space-y-6">
          {step.id === "identity" ? <IdentityStep draft={draft} onChange={patchDraft} /> : null}
          {step.id === "location" ? <LocationStep draft={draft} onChange={patchDraft} /> : null}
          {step.id === "audience" ? <AudienceStep draft={draft} onChange={patchDraft} /> : null}
          {step.id === "budget" ? <BudgetStep draft={draft} onChange={patchDraft} /> : null}
          {step.id === "offer" ? <OfferStep draft={draft} onChange={patchDraft} /> : null}
          {step.id === "creative" ? <CreativeStep draft={draft} onChange={patchDraft} /> : null}
          {step.id === "variations" ? <VariationsStep draft={draft} onChange={patchDraft} /> : null}

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
              <ArrowLeftIcon className="h-4 w-4" /> Geri
            </Button>
            {isLast ? (
              <Button type="button" size="lg" onClick={saveCampaign} disabled={submitting}>
                {submitting ? <LoaderIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                Kampanyayı Kaydet
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={goNext}>
                İleri <ArrowRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
