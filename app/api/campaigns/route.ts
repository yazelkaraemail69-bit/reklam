import { NextResponse } from "next/server";
import { createCampaign, getCampaigns, StorageWriteError } from "@/lib/store";
import { normalizeCampaignInput, validateCampaignInput } from "@/lib/validation";

export async function GET() {
  const campaigns = await getCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validationError = validateCampaignInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const campaign = await createCampaign(normalizeCampaignInput(body));
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Kampanya oluşturulamadı." }, { status: 500 });
  }
}
