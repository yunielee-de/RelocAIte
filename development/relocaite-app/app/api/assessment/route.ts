import { assessProfile, type Profile } from "@/lib/assessment";

export async function POST(request: Request) {
  const profile = (await request.json()) as Profile;
  return Response.json({
    generatedAt: "2026-09-12T12:00:00.000Z",
    profile: { name: profile.name, city: profile.city },
    findings: assessProfile(profile),
    disclaimer:
      "This is an educational prototype, not legal or tax advice. Confirm important decisions with the responsible authority or an authorised professional.",
  });
}
