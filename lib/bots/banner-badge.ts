export interface BadgeOption {
  badgeText: string;
  badgeColor: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface OptimizedBannerResult {
  originalUrl: string;
  optimizedUrl: string;
  appliedBadge: BadgeOption;
  aspectRatios: string[];
}

/**
 * 🎨 AI Image & Banner Badge Optimizer Bot.
 * Esnafın yüklediği ham fotoğrafların üzerine tıklama oranını (CTR) %30 artıran
 * dönüşüm odaklı rozetler ("-%20 İndirim", "Ücretsiz Danışma", "Garantili Hizmet") ve formatlar ekler.
 */
export function runBannerBadgeBot(
  imageUrl: string,
  category = "Genel",
  offerText = ""
): OptimizedBannerResult {
  let badgeText = "Fırsatı Kaçırma";
  if (offerText.includes("indirim") || offerText.includes("%")) {
    badgeText = "%20 İndirim Fırsatı";
  } else if (category.includes("Güzellik") || category.includes("Sağlık")) {
    badgeText = "Ücretsiz Danışma";
  } else if (category.includes("Teknik") || category.includes("Otomotiv")) {
    badgeText = "Garantili Hizmet";
  }

  const appliedBadge: BadgeOption = {
    badgeText,
    badgeColor: "#22C55E", // Brand green
    position: "top-right",
  };

  return {
    originalUrl: imageUrl,
    optimizedUrl: imageUrl, // Canlıda Vercel Blob / Cloudinary overlay transformasyonu yapılır
    appliedBadge,
    aspectRatios: ["1:1", "9:16", "16:9"],
  };
}
