import json
import os
from typing import Any

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - production installs requirements.txt
    OpenAI = None  # type: ignore[assignment]

from app import schemas

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
TEXT_MODEL = "anthropic/claude-sonnet-4"


def _fallback_copy(payload: schemas.AdCopyRequest) -> schemas.AdCopyResponse:
    audience = payload.target_audience or f"{payload.city} bölgesindeki müşteriler"
    return schemas.AdCopyResponse(
        headline=f"{payload.business_name} ile {payload.niche} ihtiyaçlarınıza profesyonel çözüm",
        subheadline=f"{payload.city} içinde güvenilir {payload.category} hizmeti arayanlar için özenle hazırlanmış tanıtım sayfası.",
        description=(
            f"{payload.business_name}, {payload.city} bölgesinde {payload.niche} alanına odaklanan bir işletmedir. "
            f"{payload.summary} Öne çıkan hizmetler: {payload.services}. "
            f"{audience} için net iletişim, güven veren sunum ve kolay ulaşılabilir hizmet deneyimi sunar."
        ),
        google_ad_headlines=[
            f"{payload.city} {payload.category}",
            f"{payload.business_name} Hizmetleri",
            f"{payload.niche} İçin Hemen Ara",
            "Profesyonel Tanıtım",
            "Yerel İşletme Desteği",
        ],
        google_ad_descriptions=[
            f"{payload.city} bölgesinde {payload.niche} hizmeti alın. Detaylı bilgi ve hızlı iletişim için hemen ulaşın.",
            f"{payload.business_name} ile ihtiyaçlarınıza uygun çözümleri keşfedin. Hizmetleri inceleyin, kolayca iletişim kurun.",
        ],
        call_to_action="Hemen iletişime geç",
    )


def generate_ad_copy(payload: schemas.AdCopyRequest) -> schemas.AdCopyResponse:
    api_key = os.getenv("AI_API_KEY")
    if not api_key or OpenAI is None:
        return _fallback_copy(payload)

    client = OpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)
    prompt = f"""
Türkçe, ikna edici ama abartısız bir yerel işletme reklam sayfası metni üret.
Google reklamlarında kullanılabilecek kısa başlık/açıklamalar dahil olsun.
Yanıtı sadece geçerli JSON olarak ver. Markdown kullanma.

İşletme adı: {payload.business_name}
Kategori: {payload.category}
Niş: {payload.niche}
Şehir: {payload.city}
Özet: {payload.summary}
Hizmetler: {payload.services}
Hedef kitle: {payload.target_audience or "Belirtilmedi"}

JSON şeması:
{{
  "headline": "maksimum 90 karakter",
  "subheadline": "maksimum 160 karakter",
  "description": "120-180 kelimelik reklam sayfası tanıtım metni",
  "google_ad_headlines": ["en az 5, her biri maksimum 30 karakter"],
  "google_ad_descriptions": ["en az 2, her biri maksimum 90 karakter"],
  "call_to_action": "maksimum 40 karakter"
}}
"""
    try:
        completion = client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[
                {"role": "system", "content": "Sen dönüşüm odaklı Türkçe reklam metni yazan uzman bir pazarlama asistanısın."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        content = completion.choices[0].message.content or "{}"
        data: dict[str, Any] = json.loads(content)
        return schemas.AdCopyResponse(**data)
    except Exception:
        return _fallback_copy(payload)
