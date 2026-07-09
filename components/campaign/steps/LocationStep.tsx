"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { Input } from "@/components/ui/Input";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function LocationStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Nerede hizmet veriyorsunuz?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Yerel işletmelerde lokasyon, bütçeden önce en kritik hedeftir.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Şehir"
          required
          value={draft.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="İstanbul"
        />
        <Input
          label="İlçe"
          value={draft.district}
          onChange={(e) => onChange({ district: e.target.value })}
          placeholder="Kadıköy"
        />
      </div>

      <Input
        label="Hedef yarıçap (km)"
        type="number"
        min={1}
        max={50}
        value={draft.radiusKm}
        onChange={(e) => onChange({ radiusKm: Number(e.target.value) || 0 })}
        hint="Müşterilerinizin makul gelme mesafesi. Çoğu yerel işletme için 5–15 km idealdir."
      />

      <CroTip>
        Dar lokasyon = daha ucuz tıklama. Tüm şehri hedeflemek bütçeyi eritir. Önce ilçe + 5–10 km
        ile başlayın; sonuç gelirse genişletin.
      </CroTip>
    </div>
  );
}
