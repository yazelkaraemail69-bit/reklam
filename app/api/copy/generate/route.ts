import { NextResponse } from "next/server";
import { getCopyProvider, toAdVariationInputs } from "@/lib/copy";
import type { CampaignObjective } from "@/lib/types";

const OBJECTIVES: CampaignObjective[] = ["traffic", "messages", "leads", "awareness"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const rawOfferText = typeof data.rawOfferText === "string" ? data.rawOfferText.trim() : "";
  if (rawOfferText.length < 10) {
    return NextResponse.json(
      { error: "Teklif metni en az 10 karakter olmalıdır." },
      { status: 400 }
    );
  }

  const objective = OBJECTIVES.includes(data.objective as CampaignObjective)
    ? (data.objective as CampaignObjective)
    : "messages";

  const provider = getCopyProvider();
  const result = await provider.generate({
    businessName: typeof data.businessName === "string" ? data.businessName : "",
    category: typeof data.category === "string" ? data.category : "",
    city: typeof data.city === "string" ? data.city : "",
    district: typeof data.district === "string" ? data.district : undefined,
    objective,
    targetAudience: typeof data.targetAudience === "string" ? data.targetAudience : "",
    rawOfferText,
    count: typeof data.count === "number" ? data.count : 3,
  });

  return NextResponse.json({
    provider: result.provider,
    variants: result.variants,
    variations: toAdVariationInputs(
      result.variants,
      result.provider === "mock-template" ? "template" : "ai"
    ),
  });
}
