export const BUSINESS_CATEGORIES = [
  "Güzellik ve Bakım",
  "Sağlık ve Estetik",
  "Yeme ve İçme",
  "Eğitim ve Kurs",
  "Teknik Servis",
  "Spor ve Wellness",
  "Emlak",
  "Otomotiv",
  "Moda ve Giyim",
  "Etkinlik ve Organizasyon",
  "Diğer",
] as const;

export const SITE_NAME_FALLBACK = "Reklam Vitrini";

/**
 * Kartvizit/Menü/Shorts araç setinin (ayrı bir Next.js projesi, bkz.
 * `dijital-kartvizit-menu/`) canlı adresi. Reklamını veren işletmelere bu
 * araçları önermek için showcase sayfalarında ve ana demo sayfasında
 * kullanılır (bkz. `components/showcase/ToolsPromo.tsx`).
 *
 * Prod'da `NEXT_PUBLIC_TOOLS_SITE_URL` ortam değişkenini gerçek deploy
 * adresine ayarlayın (bkz. `.env.example`). Yerelde iki projeyi aynı anda
 * çalıştırırken ikinci projeyi farklı bir portta başlatın, örn:
 * `npm run dev -- -p 3001` (dijital-kartvizit-menu klasöründe).
 */
export const TOOLS_SITE_URL = process.env.NEXT_PUBLIC_TOOLS_SITE_URL || "http://localhost:3001";
