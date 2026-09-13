import { parseProfile } from "@/lib/journey-profile";
import { assessVisa } from "@/lib/visa-assessment";

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length")) > 100000) return Response.json({ error: "Profile is too large." }, { status: 413 });
    const text = await request.text();
    if (text.length > 100000) return Response.json({ error: "Profile is too large." }, { status: 413 });
    const profile = parseProfile(JSON.parse(text));
    return Response.json(assessVisa(profile), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? "Send a valid JSON profile." : error instanceof Error ? error.message : "Invalid profile." }, { status: 400 });
  }
}
