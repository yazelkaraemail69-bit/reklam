import { NextResponse } from "next/server";
import {
  deleteCampaign,
  getCampaignById,
  StorageWriteError,
  updateCampaign,
} from "@/lib/store";
import { normalizeCampaignInput, validateCampaignInput } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const campaign = await getCampaignById(id);
  if (!campaign) {
    return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const validationError = validateCampaignInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const campaign = await updateCampaign(id, normalizeCampaignInput(body));
    if (!campaign) {
      return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ campaign });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Kampanya güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const ok = await deleteCampaign(id);
    if (!ok) {
      return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Kampanya silinemedi." }, { status: 500 });
  }
}
