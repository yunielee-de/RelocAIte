import { NextResponse } from "next/server";
import { parseContractExtraction } from "@/lib/contract-extraction";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 512 * 1024;
const DEFAULT_MODEL = "gpt-5-mini";
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 5 * 60 * 1000;

const fieldKeys = [
  "employer", "jobTitle", "salaryAmount", "salaryPeriod", "currency",
  "weeklyHours", "startDate", "workLocation", "workCountry", "contractDuration",
  "probationPeriod", "noticePeriod", "annualLeave", "relocationSupport", "visaSupport", "remotePolicy",
] as const;

const enumeratedValues: Partial<Record<typeof fieldKeys[number], readonly string[]>> = {
  salaryPeriod: ["", "annual", "monthly"],
  currency: ["", "EUR", "USD", "GBP", "other"],
  workCountry: ["", "DE", "other", "unknown"],
  contractDuration: ["", "permanent", "at-least-six-months", "under-six-months", "unknown"],
  relocationSupport: ["", "found", "unclear", "not-found", "unknown"],
  visaSupport: ["", "found", "unclear", "not-found", "unknown"],
  remotePolicy: ["", "found", "unclear", "not-found", "unknown"],
};

function fieldSchema(key: typeof fieldKeys[number]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["value", "evidence", "confidence"],
    properties: {
      value: enumeratedValues[key]
        ? { type: "string", enum: enumeratedValues[key] }
        : { type: "string", maxLength: 2000 },
      evidence: { type: "string", maxLength: 2000 },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
  };
}

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fields", "summary", "warnings"],
  properties: {
    fields: {
      type: "object",
      additionalProperties: false,
      required: fieldKeys,
      properties: Object.fromEntries(fieldKeys.map(key => [key, fieldSchema(key)])),
    },
    summary: { type: "string", maxLength: 2000 },
    warnings: { type: "array", maxItems: 20, items: { type: "string", maxLength: 500 } },
  },
};

const extractionInstructions = `Extract factual employment terms from this German employment contract. The document may be in German or English.

Return every requested field. Use an empty string when a fact is absent or unreadable; never invent a value. Evidence must be a short excerpt or close transcription from the document that supports the value. Use confidence from 0 to 1.

Formatting rules:
- salaryAmount: digits and optional decimal point only, for the guaranteed gross base salary; exclude bonuses and benefits.
- salaryPeriod: annual or monthly.
- currency: EUR, USD, GBP or other.
- weeklyHours and annualLeave: digits and optional decimal point only.
- startDate: YYYY-MM-DD when an exact date is stated.
- workCountry: DE for Germany, other for another known country, unknown if unclear.
- contractDuration: permanent, at-least-six-months, under-six-months or unknown.
- relocationSupport, visaSupport and remotePolicy: found if clearly stated, unclear if mentioned without clear terms, not-found if no relevant clause is visible, or unknown if the document cannot be assessed.
- probationPeriod and noticePeriod: concise plain English while preserving durations and conditions.
- summary: a concise, simple-English explanation of the offer and important missing or unclear administrative terms.
- warnings: only extraction limitations or contradictions that the user should manually check.

This is document extraction, not legal advice or a legal validity decision.`;

function mimeType(file: File): string | null {
  if (allowedTypes.has(file.type)) return file.type;
  if (/\.pdf$/i.test(file.name)) return "application/pdf";
  if (/\.png$/i.test(file.name)) return "image/png";
  if (/\.jpe?g$/i.test(file.name)) return "image/jpeg";
  return null;
}

function providerText(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const response = input as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return null;
  for (const item of response.output) {
    if (!item || typeof item !== "object" || !Array.isArray((item as { content?: unknown }).content)) continue;
    for (const part of (item as { content: unknown[] }).content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

function json(data: object, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function sameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  if (origin === new URL(request.url).origin) return true;
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const host = forwardedHost || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || new URL(request.url).protocol.slice(0, -1);
  return Boolean(host && origin === `${protocol}://${host}`);
}

function rateLimit(request: Request): number | null {
  const now = Date.now();
  if (rateBuckets.size > 1000) {
    for (const [key, bucket] of rateBuckets) if (bucket.resetAt <= now) rateBuckets.delete(key);
  }
  const address = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || request.headers.get("x-real-ip")?.trim()
    || "local";
  const bucket = rateBuckets.get(address);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(address, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }
  if (bucket.count >= RATE_LIMIT) return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  bucket.count += 1;
  return null;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-site contract uploads are not allowed." }, 403);
  }
  const retryAfter = rateLimit(request);
  if (retryAfter !== null) {
    return json({ error: "Too many contract analyses. Wait a few minutes and try again." }, 429, { "Retry-After": String(retryAfter) });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return json({ error: "The contract must be no larger than 20 MB." }, 413);
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return json({
      error: "Contract extraction is not configured for this deployment. Enter the terms manually or ask the app administrator to enable it.",
      code: "extraction_not_configured",
    }, 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "The uploaded contract could not be read." }, 400);
  }
  const candidate = form.get("contract");
  if (!(candidate instanceof File)) {
    return json({ error: "Choose a PDF, JPG or PNG employment contract." }, 400);
  }
  const type = mimeType(candidate);
  if (!type) {
    return json({ error: "Use a PDF, JPG or PNG file." }, 415);
  }
  if (candidate.size === 0 || candidate.size > MAX_FILE_BYTES) {
    return json({ error: "The contract must be between 1 byte and 20 MB." }, 413);
  }

  const encoded = Buffer.from(await candidate.arrayBuffer()).toString("base64");
  const dataUrl = `data:${type};base64,${encoded}`;
  const documentPart = type === "application/pdf"
    ? { type: "input_file", filename: candidate.name, file_data: dataUrl }
    : { type: "input_image", image_url: dataUrl, detail: "high" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const providerResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: controller.signal,
      redirect: "error",
      body: JSON.stringify({
        model: process.env.OPENAI_CONTRACT_MODEL?.trim() || DEFAULT_MODEL,
        store: false,
        reasoning: { effort: "minimal" },
        instructions: extractionInstructions,
        max_output_tokens: 2500,
        input: [{ role: "user", content: [
          documentPart,
          { type: "input_text", text: "Extract the employment terms from this contract using the required schema." },
        ] }],
        text: { format: {
          type: "json_schema",
          name: "employment_contract_extraction",
          strict: true,
          schema: extractionSchema,
        } },
      }),
    });
    if (!providerResponse.ok) {
      const requestId = providerResponse.headers.get("x-request-id");
      return json({
        error: `Contract extraction failed at the AI service${requestId ? ` (request ${requestId})` : ""}. Try again or enter the terms manually.`,
      }, 502);
    }
    const providerJson: unknown = await providerResponse.json();
    const output = providerText(providerJson);
    if (!output) throw new Error("Missing structured output.");
    const parsed: unknown = JSON.parse(output);
    const extraction = parseContractExtraction({
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      documentName: candidate.name.slice(0, 255),
    });
    return json(extraction);
  } catch (error) {
    const timeoutMessage = error instanceof Error && error.name === "AbortError"
      ? "Contract extraction timed out. Try again or enter the terms manually."
      : "The contract could not be extracted. Try again or enter the terms manually.";
    return json({ error: timeoutMessage }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
