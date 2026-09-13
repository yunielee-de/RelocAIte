import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../app/api/assistant/route";
import { financialProfileFromJourney, hasJourneyProfileData } from "../lib/financial-profile";
import { confirmEmployment, createProfile, editField } from "../lib/journey-profile";

function confirmedJourney() {
  let profile = createProfile();
  profile.name = "Sam";
  profile.employment.salaryAmount = editField(profile.employment.salaryAmount, "6000");
  profile.employment.salaryPeriod = editField(profile.employment.salaryPeriod, "monthly");
  profile.employment.currency = editField(profile.employment.currency, "EUR");
  profile.employment.jobTitle = editField(profile.employment.jobTitle, "Engineer");
  profile.employment.workLocation = editField(profile.employment.workLocation, "Berlin");
  profile = confirmEmployment(profile);
  profile.visaReviewed = true;
  profile.selectedRoute = "blue-card";
  return profile;
}

test("financial preview imports only confirmed journey facts into a blank session profile", () => {
  const profile = confirmedJourney();
  const financial = financialProfileFromJourney(profile);
  assert.equal(hasJourneyProfileData(profile), true);
  assert.equal(financial.name, "Sam");
  assert.equal(financial.city, "Berlin");
  assert.equal(financial.federalState, "Berlin");
  assert.equal(financial.grossSalary, 6000);
  assert.equal(financial.permit, "EU Blue Card");
  assert.equal(financial.arrivalDate, "");
  assert.equal(financial.relocationSpend, 0);
});

test("assistant uses a fast stateless OpenAI response with limited confirmed context", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  let providerRequest: Record<string, unknown> = {};
  process.env.OPENAI_API_KEY = "test-key";
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    providerRequest = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ output_text: "Check the official requirements before applying." }), { status: 200 });
  }) as typeof fetch;
  try {
    const response = await POST(new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Does my salary qualify?", profile: confirmedJourney() }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.mode, "ai");
    assert.equal(providerRequest.store, false);
    assert.deepEqual(providerRequest.reasoning, { effort: "minimal" });
    assert.equal(providerRequest.max_output_tokens, 450);
    assert.doesNotMatch(String(providerRequest.input), /Sam/);
    assert.match(String(providerRequest.input), /72000/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test("assistant remains functional with curated guidance when OpenAI is not configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const response = await POST(new Request("http://localhost/api/assistant", {
      method: "POST",
      body: JSON.stringify({ question: "How do I register my address?", profile: confirmedJourney() }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.mode, "curated");
    assert.match(body.text, /registration process/i);
    assert.match(body.link.url, /service\.berlin\.de/);
  } finally {
    if (previousKey !== undefined) process.env.OPENAI_API_KEY = previousKey;
  }
});

test("assistant rejects cross-site requests", async () => {
  const response = await POST(new Request("https://relocaite.example/api/assistant", {
    method: "POST",
    headers: { Origin: "https://malicious.example", "Sec-Fetch-Site": "cross-site" },
    body: JSON.stringify({ question: "hello", profile: confirmedJourney() }),
  }));
  assert.equal(response.status, 403);
});
