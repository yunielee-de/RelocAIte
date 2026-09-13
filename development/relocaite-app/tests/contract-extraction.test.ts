import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../app/api/extract-contract/route";
import { applyContractExtraction, parseContractExtraction } from "../lib/contract-extraction";
import { loadDemoBackground, loadDemoContract } from "../lib/demo-contract";
import { createProfile, employmentKeys } from "../lib/journey-profile";

function providerFields() {
  const fields = Object.fromEntries(employmentKeys.map(key => [key, {
    value: "",
    evidence: "",
    confidence: 0,
  }])) as Record<typeof employmentKeys[number], { value: string; evidence: string; confidence: number }>;
  fields.employer = { value: "Neue Arbeit GmbH", evidence: "Arbeitgeber: Neue Arbeit GmbH", confidence: 0.99 };
  fields.jobTitle = { value: "Data Analyst", evidence: "Taetigkeit als Data Analyst", confidence: 0.96 };
  fields.salaryAmount = { value: "62000", evidence: "Jahresbruttogehalt EUR 62.000", confidence: 0.95 };
  fields.salaryPeriod = { value: "annual", evidence: "Jahresbruttogehalt", confidence: 0.95 };
  fields.currency = { value: "EUR", evidence: "EUR 62.000", confidence: 0.99 };
  fields.workCountry = { value: "DE", evidence: "Arbeitsort Hamburg, Deutschland", confidence: 0.99 };
  fields.contractDuration = { value: "permanent", evidence: "auf unbestimmte Zeit", confidence: 0.97 };
  fields.relocationSupport = { value: "not-found", evidence: "", confidence: 0.75 };
  fields.visaSupport = { value: "not-found", evidence: "", confidence: 0.75 };
  fields.remotePolicy = { value: "unclear", evidence: "Mobiles Arbeiten nach Absprache", confidence: 0.8 };
  return fields;
}

function responsePayload() {
  return {
    fields: providerFields(),
    summary: "A permanent Data Analyst role with an annual gross salary of EUR 62,000.",
    warnings: ["Confirm the remote-work process with HR."],
  };
}

test("a new extraction replaces old contract facts and remains unconfirmed", () => {
  const old = loadDemoBackground(loadDemoContract(createProfile()));
  const extraction = parseContractExtraction({
    documentName: "new-contract.pdf",
    ...responsePayload(),
  });
  const next = applyContractExtraction(old, extraction);

  assert.equal(next.contractDocument?.name, "new-contract.pdf");
  assert.equal(next.contractDocument?.kind, "user-file");
  assert.equal(next.employment.employer.value, "Neue Arbeit GmbH");
  assert.equal(next.employment.employer.origin, "contract-extraction");
  assert.equal(next.employment.employer.confirmed, false);
  assert.equal(next.employment.employer.evidence, "Arbeitgeber: Neue Arbeit GmbH");
  assert.equal(next.employment.weeklyHours.value, "");
  assert.equal(next.employment.weeklyHours.extractedValue, null);
  assert.equal(next.contractReviewed, false);
  assert.equal(next.visaReviewed, false);
  assert.equal(next.qualification.nationality.value, old.qualification.nationality.value);
  assert.ok(next.documents.some(document => document.type === "employment" && document.filename === "new-contract.pdf"));
});

test("contract API sends a PDF for structured extraction without provider response storage", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  let providerRequest: Record<string, unknown> = {};
  let providerRedirect: RequestRedirect | undefined;
  process.env.OPENAI_API_KEY = "test-key";
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    providerRequest = JSON.parse(String(init?.body)) as Record<string, unknown>;
    providerRedirect = init?.redirect;
    return new Response(JSON.stringify({
      output: [{ content: [{ type: "output_text", text: JSON.stringify(responsePayload()) }] }],
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;

  try {
    const form = new FormData();
    form.append("contract", new File(["%PDF-1.7 test"], "new-contract.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("http://localhost/api/extract-contract", { method: "POST", body: form }));
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.documentName, "new-contract.pdf");
    assert.equal(body.fields.employer.value, "Neue Arbeit GmbH");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(providerRequest.store, false);
    assert.deepEqual(providerRequest.reasoning, { effort: "minimal" });
    assert.equal(providerRequest.max_output_tokens, 2500);
    assert.equal(providerRedirect, "error");
    assert.match(String(providerRequest.instructions), /never invent a value/);
    const input = providerRequest.input as Array<{ content: Array<Record<string, unknown>> }>;
    assert.equal(input[0].content[0].type, "input_file");
    assert.equal(input[0].content[0].filename, "new-contract.pdf");
    assert.match(String(input[0].content[0].file_data), /^data:application\/pdf;base64,/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test("contract API rejects cross-site browser uploads before processing them", async () => {
  const response = await POST(new Request("https://relocaite.example/api/extract-contract", {
    method: "POST",
    headers: { Origin: "https://malicious.example", "Sec-Fetch-Site": "cross-site" },
    body: new FormData(),
  }));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("contract API accepts an image and sends it as a vision input", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  let providerRequest: Record<string, unknown> = {};
  process.env.OPENAI_API_KEY = "test-key";
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    providerRequest = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ output_text: JSON.stringify(responsePayload()) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const form = new FormData();
    form.append("contract", new File(["small-image"], "contract.png", { type: "image/png" }));
    const response = await POST(new Request("http://localhost/api/extract-contract", { method: "POST", body: form }));
    const input = providerRequest.input as Array<{ content: Array<Record<string, unknown>> }>;
    assert.equal(response.status, 200);
    assert.equal(input[0].content[0].type, "input_image");
    assert.match(String(input[0].content[0].image_url), /^data:image\/png;base64,/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test("contract API fails clearly when extraction is not configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const response = await POST(new Request("http://localhost/api/extract-contract", { method: "POST", body: new FormData() }));
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.code, "extraction_not_configured");
    assert.match(body.error, /not configured/);
  } finally {
    if (previousKey !== undefined) process.env.OPENAI_API_KEY = previousKey;
  }
});
