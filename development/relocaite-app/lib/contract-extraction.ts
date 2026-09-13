import { manualContract } from "./demo-contract";
import {
  employmentKeys,
  type EmploymentKey,
  type JourneyProfile,
  type ProfileField,
} from "./journey-profile";

export type ExtractedContractField = {
  value: string;
  evidence: string;
  confidence: number;
};

export type ContractExtraction = {
  documentName: string;
  fields: Record<EmploymentKey, ExtractedContractField>;
  summary: string;
  warnings: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

const choices: Partial<Record<EmploymentKey, readonly string[]>> = {
  salaryPeriod: ["", "annual", "monthly"],
  currency: ["", "EUR", "USD", "GBP", "other"],
  workCountry: ["", "DE", "other", "unknown"],
  contractDuration: ["", "permanent", "at-least-six-months", "under-six-months", "unknown"],
  relocationSupport: ["", "found", "unclear", "not-found", "unknown"],
  visaSupport: ["", "found", "unclear", "not-found", "unknown"],
  remotePolicy: ["", "found", "unclear", "not-found", "unknown"],
};

export function parseContractExtraction(input: unknown): ContractExtraction {
  if (!isRecord(input) || typeof input.documentName !== "string" || !input.documentName.trim()
    || input.documentName.length > 255 || !isRecord(input.fields)
    || typeof input.summary !== "string" || input.summary.length > 2000
    || !Array.isArray(input.warnings) || input.warnings.length > 20
    || input.warnings.some(warning => typeof warning !== "string" || warning.length > 500)) {
    throw new Error("The extraction service returned an invalid response.");
  }

  const fields = {} as Record<EmploymentKey, ExtractedContractField>;
  for (const key of employmentKeys) {
    const field = input.fields[key];
    if (!isRecord(field) || typeof field.value !== "string" || field.value.length > 2000
      || typeof field.evidence !== "string" || field.evidence.length > 2000
      || typeof field.confidence !== "number" || !Number.isFinite(field.confidence)
      || field.confidence < 0 || field.confidence > 1
      || choices[key] && !choices[key]!.includes(field.value)) {
      throw new Error(`The extraction service returned an invalid ${key} field.`);
    }
    fields[key] = { value: field.value, evidence: field.evidence, confidence: field.confidence };
  }

  return {
    documentName: input.documentName,
    fields,
    summary: input.summary,
    warnings: [...input.warnings] as string[],
  };
}

export function applyContractExtraction(
  profile: JourneyProfile,
  extraction: ContractExtraction,
): JourneyProfile {
  const cleared = manualContract(profile, extraction.documentName);
  const employment = Object.fromEntries(employmentKeys.map(key => {
    const extracted = extraction.fields[key];
    const field: ProfileField = {
      value: extracted.value,
      extractedValue: extracted.value || null,
      origin: "contract-extraction",
      confirmed: false,
      ...(extracted.evidence ? { evidence: extracted.evidence } : {}),
    };
    return [key, field];
  })) as JourneyProfile["employment"];

  return { ...cleared, employment, contractReviewed: false };
}
