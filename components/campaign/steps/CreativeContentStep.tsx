"use client";

import { useRef, useState } from "react";
import type { CampaignWizardDraft } from "@/lib/campaign-draft";
import { compressImageFile, fileToDataUrl } from "@/lib/client-image";
import { cropAllAspectRatios } from "@/lib/crop-image";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ImageIcon, LoaderIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icons";
import { AdImageCropper } from "@/components/campaign/AdImageCropper";
import { CroTip } from "@/components/campaign/CroTip";

interface StepProps {
  draft: CampaignWizardDraft;
  onChange: (patch: Partial<CampaignWizardDraft>) => void;
}

const TEMPLATES_BY_CATEGORY: Record<string, string[]> = {
  "Güzellik ve Bakım": [
    "{businessName} olarak profesyonel saç, tırnak ve cilt bakımı hizmetlerimizle hizmetinizdeyiz. İlk seansa özel %20 indirim fırsatı için WhatsApp'tan hemen randevu alın!",
    "Kendinizi şımartmanın tam zamanı! {businessName} güzellik salonumuzda uzman estetisyenlerimizle en son trend bakımlar sizi bekliyor. Detaylı bilgi için arayın.",
    "Bakımlı saçlar ve parıldayan bir cilt! {businessName} salonumuzda en kaliteli ürünlerle özel seanslar. Randevunuzu hemen oluşturun."
  ],
  "Sağlık ve Estetik": [
    "Daha sağlıklı ve zinde bir yaşam için {businessName} uzman kadrosuyla yanınızda. Detaylı analiz ve danışmanlık randevusu için hemen yazın.",
    "{businessName} klinikte profesyonel estetik ve bakım uygulamaları. Kişiye özel tedavi planları ile hayalinizdeki görünüme kavuşun.",
    "Sağlığınız bizim için değerli. {businessName} merkezimizde hijyenik koşullarda en güncel estetik çözümleri sunuyoruz. Bilgi almak için tıklayın."
  ],
  "Yeme ve İçme": [
    "Tadına doyamayacağınız lezzetler {businessName} mutfağında! Taze malzemeler ve usta şeflerimizin özel tarifleriyle eşsiz bir akşam yemeğine davetlisiniz.",
    "Hafta sonunun en keyifli anı: {businessName} kahvaltısı! Zengin serpme kahvaltımızla ailenizle unutulmaz bir gün geçirin. Rezervasyon için hemen tıklayın.",
    "Canınız lezzetli bir şeyler mi çekti? {businessName} özel paket servisi veya sıcacık salonuyla hizmetinizde. Hemen menümüzü inceleyin!"
  ],
  "Eğitim ve Kurs": [
    "Geleceğe güvenli adımlar! {businessName} kursları ile sınav hazırlığında uzman kadromuz ve birebir etüt imkanlarımızla yanınızdayız. Kayıtlar başladı!",
    "Yeni bir dil, yeni bir kariyer! {businessName} bünyesinde konuşma odaklı yabancı dil eğitimleri. Ücretsiz deneme dersi için hemen başvurun.",
    "Kendinizi geliştirin! {businessName} atölye ve kursları ile hobilerinizi mesleğe dönüştürün. Detaylar ve kayıt bilgileri için profilimizi inceleyin."
  ],
  "Teknik Servis": [
    "Klima, kombi ve beyaz eşyalarınızda arıza mı var? {businessName} olarak aynı gün hızlı servis ve orijinal yedek parça garantisi sunuyoruz. Hemen arayın!",
    "Güvenilir teknik destek! {businessName} uzman ekibi cihazlarınızı yerinde inceliyor ve en kısa sürede çözüme kavuşturuyor. 7/24 WhatsApp hattı.",
    "Periyodik bakım ile faturalarınızı düşürün! {businessName} klima ve petek temizliği hizmetinde avantajlı fiyatlar başladı. Randevunuzu alın."
  ],
  "Spor ve Wellness": [
    "Forma girmenin tam zamanı! {businessName} spor salonumuzda kişiye özel antrenman programları ve modern ekipmanlarla hedeflerinize ulaşın.",
    "Zihninizi ve bedeninizi dinlendirin. {businessName} stüdyomuzda yoga, pilates ve wellness seansları ile yenilenin. Detaylı bilgi için yazın.",
    "Daha sağlıklı bir sen için bugün başla! {businessName} uzman koçları eşliğinde beslenme ve egzersiz programları. Hemen detayları öğren."
  ],
  "Emlak": [
    "Hayalinizdeki eve kavuşun! {businessName} portföyündeki en seçkin satılık ve kiralık konut ilanları için uzman danışmanlarımızla görüşün.",
    "Doğru yatırım, kazançlı gelecek! {businessName} emlak danışmanlığı ile bölgenin en yüksek getiri sağlayan arsa ve ticari projelerini inceleyin.",
    "Mülkünüzü hızlı ve değerinde satmak mı istiyorsunuz? {businessName} profesyonel pazarlama ağı ile evinizi hemen alıcıyla buluştursun."
  ],
  "Otomotiv": [
    "Aracınızın bakımı emin ellerde! {businessName} oto servisimizde periyodik bakım, motor kontrolü ve fren testleri hızlıca yapılır. Randevu için yazın.",
    "Detaylı temizlik ve seramik kaplama ile aracınız ilk günkü gibi parlasın! {businessName} araç estetik merkezinde kampanya başladı.",
    "Güvenli sürüş için {businessName} oto lastik ve rot-balans hizmetleri. Mevsimlik lastik değişimlerinizde cazip fiyatlar. Bilgi için tıklayın."
  ],
  "Moda ve Giyim": [
    "Sezonun en trend parçaları {businessName} koleksiyonunda! Tarzınızı yansıtacak şık elbiseler, montlar ve aksesuarlarda açılışa özel %15 indirim.",
    "Şıklık ve konfor bir arada! {businessName} butik ürünleri ile günlük stilinizi tamamlayın. Hızlı kargo ve kolay iade seçeneğiyle hemen keşfedin.",
    "Özel günleriniz için en seçkin tasarımlar {businessName} reyonlarında. Size en uygun kombinleri seçmek için mağazamıza bekliyoruz."
  ],
  "Etkinlik ve Organizasyon": [
    "Hayatınızın en mutlu gününü {businessName} ile planlayın! Düğün, nişan ve kına organizasyonlarında her detay düşünvelerle dolgulu rüya gibi paketler.",
    "Profesyonel kurumsal etkinlikler, lansmanlar ve bayi toplantıları. {businessName} organizasyon tecrübesiyle firmanızın prestijini yansıtın.",
    "Unutulmaz doğum günü ve parti konseptleri! Çocuklar ve yetişkinler için özel temalı eğlence paketlerimiz hakkında bilgi almak için yazın."
  ],
  "Diğer": [
    "{businessName} olarak profesyonel hizmet anlayışımızla yanınızdayız. İhtiyacınıza en uygun çözümler hakkında bilgi almak için hemen yazın.",
    "Güvenilir ve kaliteli hizmetin adresi {businessName}! Detaylı bilgi ve avantajlı fiyat teklifleri için hemen WhatsApp'tan iletişime geçin.",
    "Sizin için buradayız. {businessName} uzmanlığıyla dilediğiniz konuda destek alın, hızlı randevu oluşturun."
  ]
};

export function CreativeContentStep({ draft, onChange }: StepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      const compressed = await compressImageFile(file);
      const dataUrl = await fileToDataUrl(compressed);
      onChange({ sourceImageUrl: dataUrl, croppedImages: {} });
      const cropped = await cropAllAspectRatios(dataUrl, {
        mode: "contain",
        background: "#ffffff",
      });
      onChange({ sourceImageUrl: dataUrl, croppedImages: cropped });
    } catch {
      setError("Görsel işlenemedi. Başka bir fotoğraf deneyin.");
    } finally {
      setProcessing(false);
    }
  }

  // Sektöre göre yerel AI şablon önerileri
  const currentCategory = draft.category || "Diğer";
  const categoryTemplates = TEMPLATES_BY_CATEGORY[currentCategory] || TEMPLATES_BY_CATEGORY["Diğer"];
  const bName = draft.businessName ? draft.businessName.trim() : "İşletmemiz";

  function applyTemplate(tpl: string) {
    const text = tpl.replace(/{businessName}/g, bName);
    onChange({ rawOfferText: text });
    setShowSuggestions(false);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-emerald-950">Teklif ve görsel</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ne sattığınızı yazın, bir fotoğraf veya logo yükleyin. Hikâye boyutu için
          &quot;Logoyu sığdır&quot; ile çerçeveye oturtun.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">Teklif / hizmet metni</label>
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark transition-colors"
          >
            <SparklesIcon className="h-3.5 w-3.5 text-brand" />
            {showSuggestions ? "Önerileri Gizle" : "Fikir Sihirbazı (Öneri Al)"}
            {showSuggestions ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Collapsible AI Slogan / Offer Suggestion Grid */}
        {showSuggestions ? (
          <div className="rounded-2xl border border-brand/20 bg-brand-50/50 p-4 space-y-3 shadow-inner animate-fadeIn">
            <p className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">
              {currentCategory} Kategorisine Özel Öneriler (Tıkla ve Uygula)
            </p>
            <div className="grid gap-2.5">
              {categoryTemplates.map((tpl, i) => {
                const previewText = tpl.replace(/{businessName}/g, bName);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 hover:border-brand hover:bg-white hover:text-emerald-950 transition-all font-medium shadow-sm hover:shadow"
                  >
                    {previewText}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <Textarea
          required
          rows={4}
          value={draft.rawOfferText}
          onChange={(e) => onChange({ rawOfferText: e.target.value })}
          placeholder="Örn. Kadıköy'de profesyonel cilt bakımı. İlk seansa %20 indirim. WhatsApp'tan aynı gün randevu."
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-brand hover:bg-brand-50"
      >
        {processing ? (
          <LoaderIcon className="h-8 w-8 text-brand animate-spin" />
        ) : (
          <ImageIcon className="h-8 w-8 text-brand-dark" />
        )}
        <span className="font-bold text-emerald-950">
          {draft.sourceImageUrl ? "Görseli değiştir" : "Görsel / logo yükle"}
        </span>
        <span className="text-xs text-slate-500">JPG, PNG · otomatik sıkıştırma ve formatlama</span>
      </button>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <AdImageCropper
        sourceUrl={draft.sourceImageUrl}
        croppedImages={draft.croppedImages}
        isProcessing={processing}
        onCroppedChange={(croppedImages) => onChange({ croppedImages })}
      />

      {draft.sourceImageUrl ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processing}
            onClick={async () => {
              setProcessing(true);
              try {
                const cropped = await cropAllAspectRatios(draft.sourceImageUrl, {
                  mode: "contain",
                  background: "#ffffff",
                });
                onChange({ croppedImages: cropped });
              } finally {
                setProcessing(false);
              }
            }}
          >
            Tümünü logoya göre sığdır
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processing}
            onClick={async () => {
              setProcessing(true);
              try {
                const cropped = await cropAllAspectRatios(draft.sourceImageUrl, {
                  mode: "cover",
                });
                onChange({ croppedImages: cropped });
              } finally {
                setProcessing(false);
              }
            }}
          >
            Tümünü doldurarak kırp
          </Button>
        </div>
      ) : null}

      <CroTip>
        Logo kullanıyorsanız Hikâye (9:16) kartında &quot;Logoyu sığdır / ayarla&quot;ya tıklayın —
        arka plan rengi ve boyutu ayarlayabilirsiniz.
      </CroTip>
    </div>
  );
}
