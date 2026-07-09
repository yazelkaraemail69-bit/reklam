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

export function IdentityStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">İşletmenizi tanıyın</h2>
        <p className="mt-1 text-sm text-slate-600">
          Reklam metinleri ve ödeme e-postası bu bilgiden üretilecek.
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
        hint="Iyzico ödeme linki bu adrese gönderilir."
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

      <Input
        label="Kampanya Adı (isteğe bağlı)"
        value={draft.campaignName}
        onChange={(e) => onChange({ campaignName: e.target.value })}
        placeholder="Örn. Bahar Kampanyası"
        hint="Boş bırakırsanız işletme adı ve şehirden otomatik oluşur."
      />

      <CroTip>
        İşletme adınız reklam başlığında geçecek — kısa ve akılda kalır olsun. E-posta adresinizi
        doğru yazın; ödeme linki yalnızca oraya gider.
      </CroTip>
    </div>
  );
}
