import { NextResponse } from "next/server";
import { getMetrics, summarizeMetrics } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const metrics = await getMetrics(campaignId);
  const summary = summarizeMetrics(metrics);

  return NextResponse.json({ metrics, summary });
}
