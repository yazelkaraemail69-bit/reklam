"use client";

import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

export function BusinessStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">İşletmeniz ve bölgeniz</h2>
        <p className="mt-1 text-sm text-slate-600">
          Reklam metinleri ve iletişim bu bilgiden üretilir. Dar lokasyon = daha ucuz tıklama.
        </p>
      </div>

      <Input
        label="İşletme Adı"
        required
        value={draft.businessName}
        onChange={(e) => onChange({ businessName: e.target.value })}
        placeholder="Örn. Yeşil Vadi Güzellik Salonu"
      />

      <Input
        label="E-posta"
        type="email"
        required
        value={draft.customerEmail}
        onChange={(e) => onChange({ customerEmail: e.target.value })}
        placeholder="ornek@isletme.com"
        hint="Onay ve ödeme bilgileri bu adrese gider."
      />

      <Select
        label="Kategori"
        required
        value={draft.category || BUSINESS_CATEGORIES[0]}
        onChange={(e) => onChange({ category: e.target.value })}
      >
        {BUSINESS_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

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
        hint="Çoğu yerel işletme için 5–15 km idealdir."
      />

      <CroTip>
        Önce ilçe + 5–10 km ile başlayın. Tüm şehri hedeflemek bütçeyi eritir.
      </CroTip>
    </div>
  );
}
