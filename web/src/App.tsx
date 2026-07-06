import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  createBusiness,
  generateAdCopy,
  getSiteMode,
  listBusinesses,
  startIyzicoCheckout,
  uploadBusinessImage,
} from "@/lib/api"
import type { AdCopyResponse, Business, BusinessFormInput, IyzicoCheckoutInput } from "@/lib/api"

const emptyForm: BusinessFormInput = {
  business_name: "",
  owner_name: "",
  category: "",
  niche: "",
  city: "",
  district: "",
  summary: "",
  services: "",
  target_audience: "",
  phone: "",
  whatsapp: "",
  address: "",
  primary_image_url: "",

  is_published: true,
}

const categorySuggestions = ["Sağlık ve Estetik", "Yemek ve Organizasyon", "Teknik Servis", "Güzellik Salonu", "Eğitim", "Spor ve Wellness"]

function createPaymentForm(business?: Business): IyzicoCheckoutInput {
  const [firstName = "", ...surnameParts] = (business?.owner_name || "").trim().split(/\s+/).filter(Boolean)
  return {
    business_id: business?.id,
    amount: "1000.00",
    buyer_name: firstName,
    buyer_surname: surnameParts.join(" "),
    email: "",
    phone: business?.phone || "",
    identity_number: "",
    registration_address: business?.address || "",
    city: business?.city || "",
    country: "Turkey",
    zip_code: "",
  }
}

function splitLines(value?: string | null): string[] {
  return value?.split("\n").map((item) => item.trim()).filter(Boolean) ?? []
}

function splitServices(value?: string | null): string[] {
  return value?.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).slice(0, 6) ?? []
}

function businessImages(business: Business): string[] {
  const urls = business.images?.map((image) => image.public_url).filter(Boolean) ?? []
  const all = business.primary_image_url ? [business.primary_image_url, ...urls] : urls
  return Array.from(new Set(all)).slice(0, 8)
}

function fallbackImage(): string {
  return "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
}

function showcaseSections(business: Business): Array<{ title: string; text: string; image?: string }> {
  const images = businessImages(business)
  const services = splitServices(business.services)
  const location = [business.district, business.city].filter(Boolean).join(", ")
  return [
    {
      title: `${business.business_name} kimdir?`,
      text: business.generated_description || business.summary,
      image: images[1] || images[0],
    },
    {
      title: `${business.niche} alanında öne çıkan hizmetler`,
      text: services.length ? services.join(" • ") : business.services,
      image: images[2] || images[0],
    },
    {
      title: `${location || business.city} bölgesinde kolay ulaşılabilir hizmet`,
      text: `${business.target_audience || "Yerel müşteriler"} için net bilgi, hızlı iletişim ve güven veren bir tanıtım deneyimi sunulur.`,
      image: images[3] || images[0],
    },
  ]
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string
  name: keyof BusinessFormInput
  value: string
  onChange: (name: keyof BusinessFormInput, value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}{required ? <span className="text-destructive"> *</span> : null}</span>
      <input
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  )
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
}: {
  label: string
  name: keyof BusinessFormInput
  value: string
  onChange: (name: keyof BusinessFormInput, value: string) => void
  placeholder?: string
  required?: boolean
  rows?: number
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}{required ? <span className="text-destructive"> *</span> : null}</span>
      <textarea
        className="w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-base leading-7 shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </label>
  )
}

function BusinessCard({ business, isSelected, onSelect }: { business: Business; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`w-full rounded-lg border bg-card p-4 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex gap-3">
        <img
          alt={`${business.business_name} tanıtım görseli`}
          className="h-16 w-16 shrink-0 rounded-md object-cover"
          src={business.primary_image_url || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="break-words text-base font-bold text-card-foreground">{business.business_name}</h3>
            {business.is_published ? <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-primary" aria-label="Yayında" /> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{business.category} · {business.city}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-card-foreground">{business.generated_headline || business.niche}</p>
        </div>
      </div>
    </button>
  )
}

function AdPreview({ business, draft }: { business?: Business; draft?: BusinessFormInput }) {
  const name = business?.business_name || draft?.business_name || "İşletme adı"
  const headline = business?.generated_headline || draft?.generated_headline || (draft?.niche ? `${draft.niche} için profesyonel çözüm` : "Nişinize uygun reklam başlığı")
  const subheadline = business?.generated_subheadline || draft?.generated_subheadline || "Müşterilerinize güven veren, görsel odaklı tanıtım sayfası önizlemesi."
  const description = business?.generated_description || draft?.generated_description || draft?.summary || "İşletmenizi anlatan özet, hizmetler ve güçlü çağrı metni burada profesyonel bir reklam sayfasına dönüşür."
  const services = business?.services || draft?.services || "Hizmet listeniz"
  const city = business?.city || draft?.city || "Şehir"
  const phone = business?.phone || draft?.phone || "Telefon"
  const cta = business?.call_to_action || draft?.call_to_action || "Hemen iletişime geç"
  const image = business?.primary_image_url || draft?.primary_image_url || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
  const googleHeadlines = splitLines(business?.google_ad_headlines || draft?.google_ad_headlines)
  const googleDescriptions = splitLines(business?.google_ad_descriptions || draft?.google_ad_descriptions)

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="relative min-h-[260px]">
        <img alt={`${name} reklam sayfası kapak görseli`} className="absolute inset-0 h-full w-full object-cover" src={image} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="relative flex min-h-[260px] flex-col justify-end p-5 sm:p-6">
          <span className="mb-3 w-fit rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900">{city} · {business?.category || draft?.category || "Kategori"}</span>
          <h2 className="max-w-3xl break-words text-2xl font-black leading-tight text-white sm:text-4xl">{headline}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">{subheadline}</p>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">{name}</p>
            <p className="mt-2 break-words text-base leading-8 text-foreground">{description}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/70 p-4">
            <h3 className="flex items-center gap-2 text-base font-bold"><CheckCircle2 className="h-5 w-5 text-primary" /> Öne çıkan hizmetler</h3>
            <p className="mt-2 break-words text-sm leading-7 text-secondary-foreground">{services}</p>
          </div>
        </div>

        <aside className="space-y-4 rounded-lg border border-border bg-background p-4">
          <div>
            <h3 className="text-base font-bold">İletişim çağrısı</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Google reklamından gelen ziyaretçiyi tek aksiyona yönlendirir.</p>
          </div>
          <a className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60" href={`tel:${phone}`}>
            <Phone className="h-4 w-4" /> {cta}
          </a>
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Telefon: <span className="font-semibold text-foreground">{phone}</span></div>
        </aside>
      </div>

      <div className="border-t border-border bg-muted/40 p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-bold"><Search className="h-5 w-5 text-primary" /> Google reklam önerileri</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-bold text-muted-foreground">Başlıklar</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(googleHeadlines.length ? googleHeadlines : ["Yerel reklam başlığı", "Hızlı teklif al", "Profesyonel hizmet"]).map((item) => (
                <span className="rounded-full border border-border bg-background px-3 py-1 text-sm" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-bold text-muted-foreground">Açıklamalar</p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {(googleDescriptions.length ? googleDescriptions : ["Reklam açıklamaları üretildiğinde burada görünür."]).map((item) => <li className="break-words" key={item}>• {item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

type PaymentFieldName = Exclude<keyof IyzicoCheckoutInput, "business_id">

function PaymentField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = true,
  type = "text",
}: {
  label: string
  name: PaymentFieldName
  value: string
  onChange: (name: PaymentFieldName, value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}{required ? <span className="text-destructive"> *</span> : null}</span>
      <input
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  )
}

function ImagePicker({
  previews,
  onSelect,
  onClear,
}: {
  previews: string[]
  onSelect: (files: File[]) => void
  onClear: () => void
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><ImagePlus className="h-5 w-5" /></span>
        <div>
          <p className="font-bold">İşletme görselleri</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Vitrinde kullanılacak JPG, PNG veya WEBP görselleri seçin. İlk görsel kapak olarak kullanılır.</p>
        </div>
      </div>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="block w-full text-sm text-muted-foreground file:mr-4 file:min-h-10 file:rounded-md file:border-0 file:bg-primary file:px-4 file:text-sm file:font-bold file:text-primary-foreground"
        multiple
        onChange={(event) => onSelect(Array.from(event.target.files ?? []))}
        type="file"
      />
      {previews.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((src) => (
              <img alt="Seçilen işletme görseli" className="aspect-[4/3] rounded-md object-cover" key={src} src={src} />
            ))}
          </div>
          <button className="w-fit text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onClick={onClear} type="button">Seçilen görselleri temizle</button>
        </>
      ) : null}
    </div>
  )
}

function PaymentPanel({ business }: { business?: Business }) {
  const [paymentForm, setPaymentForm] = useState<IyzicoCheckoutInput>(() => createPaymentForm(business))
  const [isStartingPayment, setIsStartingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState("")

  useEffect(() => {
    setPaymentForm((current) => ({
      ...createPaymentForm(business),
      amount: current.amount,
      email: current.email,
      identity_number: current.identity_number,
      country: current.country || "Turkey",
      zip_code: current.zip_code,
    }))
    setPaymentError("")
    setPaymentSuccess("")
  }, [business])

  useEffect(() => {
    const paymentStatus = new URLSearchParams(window.location.search).get("payment")
    if (paymentStatus === "success") {
      setPaymentSuccess("Ödeme sonucu başarılı olarak döndü. Iyzico panelinden işlemi kontrol edin.")
    } else if (paymentStatus === "failure") {
      setPaymentError("Ödeme tamamlanamadı. Müşteri farklı kartla tekrar deneyebilir.")
    }
  }, [])

  function updatePaymentField(name: PaymentFieldName, value: string) {
    setPaymentForm((current) => ({ ...current, [name]: value }))
    setPaymentError("")
    setPaymentSuccess("")
  }

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPaymentError("")
    setPaymentSuccess("")
    setIsStartingPayment(true)
    try {
      const checkout = await startIyzicoCheckout({
        ...paymentForm,
        business_id: business?.id,
      })
      if (!checkout.payment_page_url) {
        throw new Error("Iyzico ödeme sayfası bağlantısı dönmedi.")
      }
      window.location.assign(checkout.payment_page_url)
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Ödeme başlatılamadı. Lütfen tekrar deneyin.")
    } finally {
      setIsStartingPayment(false)
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><CreditCard className="h-5 w-5" /></span>
        <div>
          <h2 className="text-xl font-black">Iyzico ile reklam ödemesi</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Seçili işletme için güvenli Iyzico ödeme sayfası oluşturun.</p>
        </div>
      </div>

      {!business ? (
        <div className="rounded-md border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">Ödeme almak için önce bir işletme kaydı seçin veya yeni kayıt oluşturun.</div>
      ) : (
        <form className="grid gap-4" onSubmit={handlePaymentSubmit}>
          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
            <ShieldCheck className="mr-2 inline h-4 w-4 text-primary" />
            Gizli Iyzico anahtarları backend ortam değişkenlerinde tutulur; kart bilgisi bu sitede saklanmaz.
          </div>

          <PaymentField label="Tutar (TRY)" name="amount" value={paymentForm.amount} onChange={updatePaymentField} placeholder="1000.00" />
          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentField label="Ad" name="buyer_name" value={paymentForm.buyer_name} onChange={updatePaymentField} placeholder="Müşteri adı" />
            <PaymentField label="Soyad" name="buyer_surname" value={paymentForm.buyer_surname} onChange={updatePaymentField} placeholder="Müşteri soyadı" />
          </div>
          <PaymentField label="E-posta" name="email" value={paymentForm.email} onChange={updatePaymentField} placeholder="musteri@example.com" type="email" />
          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentField label="Telefon" name="phone" value={paymentForm.phone} onChange={updatePaymentField} placeholder="+90 ..." />
            <PaymentField label="TC / Vergi no" name="identity_number" value={paymentForm.identity_number} onChange={updatePaymentField} placeholder="Iyzico alıcı kimlik no" />
          </div>
          <PaymentField label="Fatura adresi" name="registration_address" value={paymentForm.registration_address} onChange={updatePaymentField} placeholder="Adres" />
          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentField label="Şehir" name="city" value={paymentForm.city} onChange={updatePaymentField} placeholder="İstanbul" />
            <PaymentField label="Posta kodu" name="zip_code" value={paymentForm.zip_code} onChange={updatePaymentField} placeholder="34000" required={false} />
          </div>

          {paymentError ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{paymentError}</p> : null}
          {paymentSuccess ? <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary" role="status">{paymentSuccess}</p> : null}

          <Button className="min-h-11" disabled={isStartingPayment} type="submit">
            {isStartingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />} Iyzico ödeme sayfasını aç
          </Button>
        </form>
      )}
    </section>
  )
}

function ShowcasePage({ business }: { business: Business }) {
  const images = businessImages(business)
  const heroImage = images[0] || fallbackImage()
  const services = splitServices(business.services)
  const sections = showcaseSections(business)
  const headlines = splitLines(business.google_ad_headlines)
  const descriptions = splitLines(business.google_ad_descriptions)
  const location = [business.district, business.city].filter(Boolean).join(", ") || business.city

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative min-h-screen overflow-hidden">
        <img alt={`${business.business_name} kapak görseli`} className="absolute inset-0 h-full w-full object-cover opacity-75" src={heroImage} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/70 to-primary/30" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-end px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-4xl pb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-950">
              <MapPin className="h-4 w-4" /> {location} · {business.category}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              {business.generated_headline || `${business.business_name} ile ${business.niche} için güçlü tanıtım`}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90 sm:text-xl">
              {business.generated_subheadline || business.summary}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-white/90" href={`tel:${business.phone}`}>
                <Phone className="h-4 w-4" /> {business.call_to_action || "Hemen ara"}
              </a>
              {business.whatsapp ? (
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20" href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}>
                  <MessageCircle className="h-4 w-4" /> WhatsApp ile yaz
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {(images.length ? images : [heroImage]).slice(0, 4).map((src, index) => (
          <img
            alt={`${business.business_name} vitrin görseli ${index + 1}`}
            className={`rounded-2xl object-cover shadow-2xl shadow-black/30 ${index === 0 ? "aspect-[16/10] md:col-span-2 md:row-span-2 md:h-full" : "aspect-[4/3]"}`}
            key={src}
            src={src}
          />
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {sections.map((section, index) => (
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl shadow-black/20 backdrop-blur" key={section.title}>
            <img alt={section.title} className="aspect-[16/10] w-full object-cover" src={section.image || heroImage} />
            <div className="p-5">
              <p className="text-sm font-black uppercase tracking-wide text-primary">0{index + 1}</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/80">{section.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-3xl font-black">Neden {business.business_name}?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(services.length ? services : [business.niche, business.category, "Hızlı iletişim", "Yerel hizmet"]).map((service) => (
              <div className="flex gap-3 rounded-xl bg-white/10 p-4" key={service}>
                <Star className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm font-bold leading-6">{service}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white p-6 text-slate-950">
          <h2 className="text-2xl font-black">İletişim</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{business.address || location}</p>
          <a className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800" href={`tel:${business.phone}`}>
            <Phone className="h-4 w-4" /> {business.phone}
          </a>
          {descriptions.length ? (
            <div className="mt-5 space-y-2">
              {descriptions.map((description) => <p className="rounded-lg bg-slate-100 p-3 text-sm leading-6" key={description}>{description}</p>)}
            </div>
          ) : null}
        </aside>
      </section>

      {headlines.length ? (
        <section className="mx-auto flex w-full max-w-7xl flex-wrap gap-3 px-4 pb-12 sm:px-6 lg:px-8">
          {headlines.map((headline) => <span className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/80" key={headline}>{headline}</span>)}
        </section>
      ) : null}
    </main>
  )
}

function App() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<BusinessFormInput>(emptyForm)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [siteMode, setSiteMode] = useState<"panel" | "showcase">("panel")

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let isMounted = true
    listBusinesses()
      .then((items) => {
        if (!isMounted) return
        setBusinesses(items)
        setSelectedId(items[0]?.id ?? null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    function refreshSiteMode() {
      getSiteMode()
        .then((response) => {
          if (isMounted) setSiteMode(response.mode)
        })
        .catch(() => {
          // Keep the current UI mode if the backend is temporarily unavailable.
        })
    }

    refreshSiteMode()
    const intervalId = window.setInterval(refreshSiteMode, 15000)
    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [imagePreviews])


  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedId) ?? businesses[0],
    [businesses, selectedId],
  )
  const hasDraft = Boolean(
    form.business_name.trim() ||
    form.category.trim() ||
    form.niche.trim() ||
    form.city.trim() ||
    form.summary.trim() ||
    imagePreviews.length,
  )
  const draftPreview: BusinessFormInput = {
    ...form,
    primary_image_url: form.primary_image_url || imagePreviews[0] || "",
  }

  const readyForAi = Boolean(form.business_name.trim() && form.category.trim() && form.niche.trim() && form.city.trim() && form.summary.trim().length >= 20 && form.services.trim())

  function updateField(name: keyof BusinessFormInput, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setError("")
    setSuccess("")
  }

  function handleImageSelect(files: File[]) {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    setImageFiles(files)
    setImagePreviews(files.map((file) => URL.createObjectURL(file)))
    setError("")
    setSuccess("")
  }

  function clearImages() {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    setImageFiles([])
    setImagePreviews([])
  }

  function applyGenerated(copy: AdCopyResponse) {
    setForm((current) => ({
      ...current,
      generated_headline: copy.headline,
      generated_subheadline: copy.subheadline,
      generated_description: copy.description,
      google_ad_headlines: copy.google_ad_headlines.join("\n"),
      google_ad_descriptions: copy.google_ad_descriptions.join("\n"),
      call_to_action: copy.call_to_action,
    }))
  }

  async function handleGenerate() {
    setError("")
    setSuccess("")
    setIsGenerating(true)
    try {
      const copy = await generateAdCopy(form)
      applyGenerated(copy)
      setSuccess("Tanıtım metni ve Google reklam önerileri hazırlandı.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Metin üretilemedi. Lütfen tekrar deneyin.")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)
    try {
      let payload = form
      if (readyForAi && !form.generated_headline) {
        const copy = await generateAdCopy(form)
        payload = {
          ...form,
          generated_headline: copy.headline,
          generated_subheadline: copy.subheadline,
          generated_description: copy.description,
          google_ad_headlines: copy.google_ad_headlines.join("\n"),
          google_ad_descriptions: copy.google_ad_descriptions.join("\n"),
          call_to_action: copy.call_to_action,
        }
      }
      const created = await createBusiness(payload)
      await Promise.all(imageFiles.map((file) => uploadBusinessImage(created.id, file)))
      const refreshed = await listBusinesses()
      setBusinesses(refreshed)
      setSelectedId(created.id)
      setForm(emptyForm)
      clearImages()
      setSiteMode("showcase")

      setSuccess("İşletme kaydı oluşturuldu, görseller yüklendi ve vitrin yayına alındı.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı. Lütfen tekrar deneyin.")
    } finally {
      setIsSaving(false)
    }
  }

  if (siteMode === "showcase" && selectedBusiness) {
    return <ShowcasePage business={selectedBusiness} />
  }

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Megaphone className="h-6 w-6" /></span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">İşletme reklam sayfası oluşturucu</p>
                  <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Kayıtlı işletmeleri Google reklamına hazır hale getirin</h1>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">İşletme özetini, nişini ve görselini sisteme ekleyin; yapay zeka destekli tanıtım metni, reklam başlıkları ve yayınlanabilir tanıtım sayfası oluşturun.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-background p-3 text-center shadow-sm sm:min-w-[360px]">
              <div><p className="text-2xl font-black">{businesses.length}</p><p className="text-xs text-muted-foreground">İşletme</p></div>
              <div><p className="text-2xl font-black">{businesses.filter((item) => item.is_published).length}</p><p className="text-xs text-muted-foreground">Yayında</p></div>
              <div><p className="text-2xl font-black">AI</p><p className="text-xs text-muted-foreground">Metin</p></div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
        <section className="min-w-0 space-y-6">
          <form className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5" onSubmit={handleSubmit}>
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span>
              <div>
                <h2 className="text-xl font-black">Yeni işletme kaydı</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Zorunlu alanları doldurun, görsel ekleyin ve reklam metnini otomatik üretin.</p>
              </div>
            </div>

            <div className="grid gap-4">
              <FormField label="İşletme adı" name="business_name" value={form.business_name} onChange={updateField} placeholder="Örn. Mavi Klinik Estetik" required />
              <FormField label="Yetkili kişi" name="owner_name" value={form.owner_name} onChange={updateField} placeholder="Ad soyad" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Kategori" name="category" value={form.category} onChange={updateField} placeholder="Örn. Teknik Servis" required />
                <FormField label="Şehir" name="city" value={form.city} onChange={updateField} placeholder="İstanbul" required />
              </div>
              <div className="flex flex-wrap gap-2">
                {categorySuggestions.map((category) => (
                  <button className="min-h-9 rounded-full border border-border px-3 text-sm transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60" key={category} onClick={() => updateField("category", category)} type="button">{category}</button>
                ))}
              </div>
              <FormField label="Niş / uzmanlık" name="niche" value={form.niche} onChange={updateField} placeholder="Örn. klima bakımı, lazer epilasyon, butik catering" required />
              <TextAreaField label="İşletme özeti" name="summary" value={form.summary} onChange={updateField} placeholder="İşletmenin farkı, deneyimi, hangi sorunu çözdüğü..." required />
              <TextAreaField label="Hizmetler" name="services" value={form.services} onChange={updateField} placeholder="Virgülle ayırarak veya kısa cümlelerle yazın" required rows={3} />
              <FormField label="Hedef müşteri" name="target_audience" value={form.target_audience} onChange={updateField} placeholder="Örn. İzmir'de acil servis arayan ev sahipleri" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Telefon" name="phone" value={form.phone} onChange={updateField} placeholder="+90 ..." required />
                <FormField label="WhatsApp" name="whatsapp" value={form.whatsapp} onChange={updateField} placeholder="+90 ..." />
              </div>
              <FormField label="İlçe" name="district" value={form.district} onChange={updateField} placeholder="Kadıköy" />
              <TextAreaField label="Adres" name="address" value={form.address} onChange={updateField} placeholder="Kısa adres bilgisi" rows={2} />
              <FormField label="Kapak görseli URL" name="primary_image_url" value={form.primary_image_url || ""} onChange={updateField} placeholder="https://..." />
              <ImagePicker previews={imagePreviews} onSelect={handleImageSelect} onClear={clearImages} />



              {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p> : null}
              {success ? <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary" role="status">{success}</p> : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button className="min-h-11" disabled={!readyForAi || isGenerating || isSaving} onClick={handleGenerate} type="button" variant="secondary">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Metin üret
                </Button>
                <Button className="min-h-11" disabled={isSaving} type="submit">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Kaydet ve yayınla
                </Button>
              </div>
            </div>
          </form>

          <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="flex items-center gap-2 text-xl font-black"><FileText className="h-5 w-5 text-primary" /> Kayıtlı işletmeler</h2>
            <div className="mt-4 space-y-3">
              {isLoading ? <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">İşletmeler yükleniyor...</div> : null}
              {!isLoading && businesses.length === 0 ? <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">Henüz işletme yok. İlk kaydı formdan ekleyin.</div> : null}
              {businesses.map((business) => (
                <BusinessCard business={business} isSelected={business.id === selectedBusiness?.id} key={business.id} onSelect={() => setSelectedId(business.id)} />
              ))}
            </div>
          </section>
        </section>

        <section className="min-w-0 space-y-6">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black"><MousePointerClick className="h-5 w-5 text-primary" /> Canlı reklam sayfası önizlemesi</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Sol taraftaki form canlı taslak olarak, kayıtlı işletmeler ise yayın sayfası olarak görüntülenir.</p>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">Google Ads hazır</span>
            </div>
          </div>
          <AdPreview business={hasDraft ? undefined : selectedBusiness} draft={hasDraft ? draftPreview : selectedBusiness ? undefined : form} />
          <PaymentPanel business={selectedBusiness} />
        </section>
      </div>
    </main>
  )
}

export default App
