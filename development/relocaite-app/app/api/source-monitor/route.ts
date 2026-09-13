import { NextResponse } from "next/server";
import { checkSourceWithFirecrawl, listMonitoredSources, SourceMonitorError } from "@/lib/source-monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET() {
  return NextResponse.json(
    { configured: Boolean(process.env.FIRECRAWL_API_KEY), sources: listMonitoredSources() },
    { headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  if (!process.env.FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { error: "configuration_required", message: "Add FIRECRAWL_API_KEY to the server environment to enable live source checks." },
      { status: 503, headers: noStoreHeaders },
    );
  }

  let sourceId: unknown;
  try {
    const body = await request.json();
    sourceId = body?.sourceId;
  } catch {
    return NextResponse.json({ error: "invalid_request", message: "Request body must be valid JSON." }, { status: 400, headers: noStoreHeaders });
  }

  if (typeof sourceId !== "string") {
    return NextResponse.json({ error: "invalid_request", message: "Choose a monitored source." }, { status: 400, headers: noStoreHeaders });
  }

  try {
    return NextResponse.json(await checkSourceWithFirecrawl(sourceId, { apiKey: process.env.FIRECRAWL_API_KEY }), { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof SourceMonitorError) {
      const status = error.code === "unknown_source" ? 400 : error.providerStatus === 429 ? 429 : 502;
      return NextResponse.json({ error: error.code, message: error.message }, { status, headers: noStoreHeaders });
    }
    return NextResponse.json({ error: "provider_error", message: "The source check failed unexpectedly." }, { status: 502, headers: noStoreHeaders });
  }
}
