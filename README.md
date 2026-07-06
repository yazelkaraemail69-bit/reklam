# Reklam Sitesi

İşletme bilgileri, görseli, bölgesi ve hizmetleriyle reklam sayfası hazırlayan React + FastAPI uygulaması.

## Geliştirme

- Frontend: `web/`
- Backend: `backend/`
- Frontend API adresi için `web/.env.example` dosyasını `web/.env` olarak kopyalayın.
- Backend değişkenleri için `backend/.env.example` dosyasını `backend/.env` olarak kopyalayın.

## Iyzico

Ödeme başlatma endpoint'i backend tarafındadır: `POST /api/payments/iyzico/checkout`.

Gerekli değişkenler:

- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `IYZICO_BASE_URL`
- `IYZICO_CALLBACK_URL`
- `FRONTEND_URL`

Önce sandbox ortamında test edin. Canlıya geçerken Iyzico panelindeki canlı API bilgilerini ve canlı base URL'i kullanın.

## Görsel Yükleme ve Vitrin

Müşteri panelinden işletme bilgileri ve görseller kaydedilince site modu `showcase` olur ve ana sayfa işletmenin tanıtım vitrini olarak açılır.

Yüklenen görseller backend'de `UPLOAD_DIR` klasörüne kaydedilir ve `/uploads/...` adresinden servis edilir. Vercel gibi serverless ortamlarda bu klasör kalıcı olmayacağı için canlı ortamda S3/R2/Supabase Storage benzeri object storage kullanılmalıdır.

## Telegram ile Panele Dönme

Telegram bot webhook endpoint'i:

`POST /api/site/telegram/{TELEGRAM_WEBHOOK_SECRET}`

Botunuza `/start` komutu geldiğinde backend site modunu tekrar `panel` yapar. Güvenlik için:

- `TELEGRAM_BOT_TOKEN` sadece backend ortam değişkeninde kalmalı.
- Webhook URL'inde `TELEGRAM_WEBHOOK_SECRET` kullanılmalı.
- Mümkünse `TELEGRAM_ADMIN_CHAT_ID` tanımlanmalı; böylece sadece sizin Telegram hesabınız komut verebilir.

Telegram webhook örneği:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://backend-domaininiz.com/api/site/telegram/<TELEGRAM_WEBHOOK_SECRET>"
```
