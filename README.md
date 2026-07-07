# Reklam Vitrini

İşletmelerin kendi özel URL'lerinde (`/isletme-adi`) profesyonel bir reklam/tanıtım
vitrini oluşturabildiği, admin panelinden yönetilen çoklu kiracılı (multi-tenant)
bir Next.js SaaS platformu.

## Özellikler

- **Next.js 16 App Router** + TypeScript + Tailwind CSS 4 (mobile-first)
- **Marka paleti:** Yeşil `#22C55E`, Koyu Yeşil `#064E3B`, Beyaz `#FFFFFF`
- Her işletme için özel URL: `siteniz.com/isletme-adi`
- Şifre korumalı **Admin Paneli**: işletme ekleme/düzenleme/silme, yayın durumu
- Sayfa altına sabitlenmiş **WhatsApp iletişim butonu**
- Admin panelinden **doğrudan görsel yükleme** (logo, kapak, galeri): sürükle-bırak
  veya dosya seçici ile, URL uğraşı olmadan; büyük fotoğraflar tarayıcıda otomatik
  sıkıştırılır
- Her işletmeye özel ve platform geneli **Script Injection** (Google Analytics,
  Meta Pixel, GTM, reklam takip kodları vb.)
- `next/image` ve `next/link` ile optimize görsel/link yönetimi
- `robots.ts` ve `sitemap.ts` ile otomatik SEO dosyaları
- Vercel'de tek tıkla deploy edilebilir, sıfır ek servis olmadan çalışır (demo verisiyle)

## Teknoloji Kararları

| Konu | Karar | Neden |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | Güncel, Vercel ile birebir uyumlu |
| Stil | Tailwind CSS 4 (CSS-first `@theme`) | Sıfır config riski, küçük bundle |
| Kimlik doğrulama | HMAC imzalı cookie oturum (Node `crypto`) | Ekstra bağımlılık yok, `proxy.ts` (Next 16 middleware) ile korunuyor |
| Veri deposu | JSON dosyası (yerel) + Upstash Redis REST (üretim, opsiyonel) | Vercel serverless'ta dosya sistemi salt-okunur olduğundan kalıcı yazım için Upstash önerilir |
| Görseller | `next/image` + `images.unoptimized: true` | İşletmeler herhangi bir CDN'den görsel URL'si girebilir; SSRF riski ve `remotePatterns` bakımı olmadan çalışır |
| Görsel yükleme | `@vercel/blob` (üretim, opsiyonel) + yerel `public/uploads` (geliştirme) | Upstash deseniyle birebir aynı mantık: kalıcı depolama için Blob önerilir, yapılandırılmazsa yerelde çalışmaya devam eder |

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın. Admin paneline
`http://localhost:3000/admin/login` üzerinden, `.env` dosyasındaki
`ADMIN_PASSWORD` ile giriş yapabilirsiniz (varsayılan: `admin123`, **mutlaka değiştirin**).

## Ortam Değişkenleri

`.env.example` dosyasına bakın. Özet:

- `ADMIN_PASSWORD` — Admin paneli giriş şifresi (**zorunlu, değiştirin**)
- `SESSION_SECRET` — Oturum cookie'sini imzalamak için rastgele, uzun bir anahtar (**zorunlu, değiştirin**)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Kalıcı veri deposu (opsiyonel ama üretim için önerilir)
- `BLOB_READ_WRITE_TOKEN` — Yüklenen görseller için kalıcı depolama (opsiyonel ama üretim için önerilir)
- `NEXT_PUBLIC_SITE_URL` — Canlı domain adresiniz (SEO/OG etiketleri için)

## Vercel'e Deploy

1. Bu repoyu GitHub'a push edin ve Vercel'de "Import Project" ile bağlayın.
2. Vercel proje ayarlarında **Environment Variables** kısmına en azından
   `ADMIN_PASSWORD` ve `SESSION_SECRET` değerlerini girin.
3. Deploy edin — ek yapılandırma gerekmez, `next build` otomatik çalışır.
4. **(Önerilir) Kalıcı veri için:** Vercel projenizde **Storage** sekmesine
   girip **Upstash for Redis** entegrasyonunu tek tıkla ekleyin. Bu işlem
   `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` değişkenlerini
   otomatik olarak projenize ekler. Bu adım atlanırsa admin panelinden
   yapılan değişiklikler geçici olur (fonksiyon örneği yeniden başladığında
   sıfırlanabilir); okuma/görüntüleme her zaman çalışır.
5. **(Önerilir) Yüklenen görseller için:** Aynı **Storage** sekmesinden
   **Blob** entegrasyonunu tek tıkla ekleyin. Bu işlem `BLOB_READ_WRITE_TOKEN`
   değişkenini otomatik ekler. Bu adım atlanırsa admin panelinden yüklenen
   görseller kalıcı olmaz (fonksiyon örneği yeniden başladığında kaybolur).

## Klasör Yapısı

```
app/
  layout.tsx              # Kök layout, genel script injection
  page.tsx                # Platform tanıtım (landing) sayfası
  globals.css             # Tailwind + marka renkleri (@theme)
  robots.ts, sitemap.ts   # SEO dosyaları
  [slug]/                 # İşletme vitrin sayfası (/isletme-adi)
  admin/
    login/                # Giriş sayfası (herkese açık)
    (dashboard)/          # Şifre korumalı panel (proxy.ts ile korunur)
      page.tsx            # İşletme listesi
      businesses/new/     # Yeni işletme formu
      businesses/[id]/    # İşletme düzenleme formu
      settings/           # Genel site ayarları + script injection
  api/
    auth/login, logout    # Oturum açma/kapama
    businesses/           # CRUD uç noktaları
    settings/             # Site ayarları uç noktası
    upload/                # Görsel yükleme uç noktası (Blob + yerel fallback)
components/
  ui/                     # Ortak, yeniden kullanılabilir arayüz bileşenleri
  marketing/              # Landing sayfası bileşenleri
  showcase/               # İşletme vitrin sayfası bileşenleri
  admin/                  # Admin paneli bileşenleri (ImageUploadField dahil)
  common/ScriptInjector   # Script injection çalışma zamanı bileşeni
lib/
  store.ts                # Veri erişim katmanı (JSON + Upstash)
  upload.ts               # Görsel depolama katmanı (Blob + yerel dosya)
  client-image.ts         # Tarayıcıda görsel sıkıştırma (yükleme öncesi)
  auth.ts                 # Oturum imzalama/doğrulama
  types.ts                # Paylaşılan TypeScript tipleri
  validation.ts           # API girdi doğrulama/normalize
  utils.ts, constants.ts
data/
  businesses.json         # Örnek/varsayılan işletme verisi
  settings.json           # Varsayılan site ayarları
public/
  uploads/                # (yerel, git-ignored) Blob yapılandırılmadığında yüklenen görseller
proxy.ts                  # Next.js 16 middleware (admin route koruması)
```

## Performans Notları

- Tüm bileşenler varsayılan olarak Server Component'tir; sadece etkileşim
  gerektiren (form, buton, oturum) bileşenler `"use client"` ile işaretlenmiştir.
- `next/image` ile lazy-loading ve layout-shift önleme sağlanır.
- Admin panelindeki değişiklikler `router.refresh()` ile sadece ilgili
  Server Component verisini yeniler; gereksiz tam sayfa yeniden render
  edilmez.
