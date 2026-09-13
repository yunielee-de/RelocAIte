import { documentCatalog, migrateDocuments, type VaultDocument, type DocumentType } from "./document-vault";

export type StageId = "contract" | "visa" | "accommodation" | "setup" | "benefits";
export const applicationKeys = ["employmentDeclaration", "biometricPhoto", "routeDeclarations", "accommodationEvidence"] as const;
export type ApplicationRequirement = "unknown" | "required" | "not-required";
export const employmentKeys = [
  "employer", "jobTitle", "salaryAmount", "salaryPeriod", "currency",
  "weeklyHours", "startDate", "workLocation", "workCountry", "contractDuration",
  "probationPeriod", "noticePeriod", "annualLeave", "relocationSupport", "visaSupport", "remotePolicy",
] as const;
export const qualificationKeys = [
  "nationality", "highestQualification", "qualificationType", "qualificationCountry",
  "profession", "recognitionStatus", "qualifiedJob", "degreeMatchesJob", "regulatedProfession",
  "practiceLicence", "ageBand",
] as const;
export type EmploymentKey = typeof employmentKeys[number];
export type QualificationKey = typeof qualificationKeys[number];
export type Origin = "unknown" | "manual" | "contract-extraction" | "demo-contract" | "demo-profile";
export type ProfileField = {
  value: string;
  extractedValue: string | null;
  origin: Origin;
  confirmed: boolean;
  evidence?: string;
};
export type JourneyProfile = {
  version: 2;
  name: string;
  employment: Record<EmploymentKey, ProfileField>;
  qualification: Record<QualificationKey, ProfileField>;
  contractDocument: { name: string; kind: "demo" | "user-file" } | null;
  contractReviewed: boolean;
  visaReviewed: boolean;
  selectedRoute: string | null;
  documentsReady: Record<string, boolean>;
  documents: VaultDocument[];
  application: Record<typeof applicationKeys[number], ApplicationRequirement> & { fastTrack: boolean };
  visitedStages: StageId[];
  tasksDone: Record<string, boolean>;
};
export const emptyField = (): ProfileField => ({ value: "", extractedValue: null, origin: "unknown", confirmed: false });
export function createProfile(): JourneyProfile {
  return {
    version: 2, name: "",
    employment: Object.fromEntries(employmentKeys.map(key => [key, emptyField()])) as JourneyProfile["employment"],
    qualification: Object.fromEntries(qualificationKeys.map(key => [key, emptyField()])) as JourneyProfile["qualification"],
    contractDocument: null, contractReviewed: false, visaReviewed: false, selectedRoute: null, documentsReady: {},
    documents: [], application: { employmentDeclaration: "unknown", biometricPhoto: "unknown", routeDeclarations: "unknown", accommodationEvidence: "unknown", fastTrack: false },
    visitedStages: [], tasksDone: {},
  };
}
export function fieldValue(field: ProfileField): string { return field.confirmed ? field.value.trim() : ""; }
export function editField(field: ProfileField, value: string): ProfileField {
  return { ...field, value, origin: field.origin === "unknown" ? "manual" : field.origin, confirmed: false };
}
export function invalidateAssessment(profile: JourneyProfile): JourneyProfile {
  return { ...profile, visaReviewed: false, selectedRoute: null, documentsReady: {} };
}
export function invalidateJobFacts(profile: JourneyProfile): JourneyProfile {
  const qualification = { ...profile.qualification };
  for (const key of ["profession", "qualifiedJob", "degreeMatchesJob", "regulatedProfession", "practiceLicence"] as const) {
    qualification[key] = { ...qualification[key], confirmed: false };
  }
  return { ...invalidateAssessment(profile), qualification };
}
export function updateEmployment(profile: JourneyProfile, key: EmploymentKey, value: string): JourneyProfile {
  const updated = key === "jobTitle" && value !== profile.employment[key].value ? invalidateJobFacts(profile) : invalidateAssessment(profile);
  return { ...updated, contractReviewed: false, employment: { ...updated.employment, [key]: editField(updated.employment[key], value) } };
}
export function annualSalary(profile: JourneyProfile): number | null {
  const amount = fieldValue(profile.employment.salaryAmount);
  const period = fieldValue(profile.employment.salaryPeriod);
  if (!amount || !["annual", "monthly"].includes(period)) return null;
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * (period === "monthly" ? 12 : 1) * 100) / 100;
}
export function salaryLabel(profile: JourneyProfile): string {
  const salary = annualSalary(profile);
  return salary === null ? "Salary not confirmed" : `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(salary)} ${fieldValue(profile.employment.currency) || "(currency unknown)"} / year`;
}
export function employmentErrors(profile: JourneyProfile): string[] {
  const errors: string[] = [];
  for (const key of ["salaryAmount", "weeklyHours", "annualLeave"] as const) {
    const text = profile.employment[key].value.trim();
    const max = key === "weeklyHours" ? 168 : key === "annualLeave" ? 366 : 10000000;
    if (text && (!Number.isFinite(Number(text)) || Number(text) < 0 || Number(text) > max || (key === "salaryAmount" && Number(text) === 0))) {
      errors.push(`Check ${key === "salaryAmount" ? "gross salary" : key === "weeklyHours" ? "weekly hours" : "annual leave"}: enter a valid number.`);
    }
  }
  const date = profile.employment.startDate.value;
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) errors.push("Enter a valid employment start date.");
  return errors;
}
export function confirmEmployment(profile: JourneyProfile): JourneyProfile {
  if (employmentErrors(profile).length) throw new Error(employmentErrors(profile)[0]);
  return {
    ...invalidateAssessment(profile), contractReviewed: true,
    employment: Object.fromEntries(employmentKeys.map(key => [key, { ...profile.employment[key], confirmed: Boolean(profile.employment[key].value.trim()) }])) as JourneyProfile["employment"],
  };
}
export function confirmQualification(profile: JourneyProfile): JourneyProfile {
  return { ...invalidateAssessment(profile), qualification: Object.fromEntries(qualificationKeys.map(key => [key, {
    ...profile.qualification[key], confirmed: Boolean(profile.qualification[key].value.trim()),
  }])) as JourneyProfile["qualification"] };
}

const options: Partial<Record<EmploymentKey | QualificationKey, readonly string[]>> = {
  salaryPeriod: ["annual", "monthly"], currency: ["EUR", "USD", "GBP", "other"], workCountry: ["DE", "other", "unknown"],
  contractDuration: ["permanent", "at-least-six-months", "under-six-months", "unknown"],
  relocationSupport: ["found", "unclear", "not-found", "unknown"], visaSupport: ["found", "unclear", "not-found", "unknown"], remotePolicy: ["found", "unclear", "not-found", "unknown"],
  qualificationType: ["academic", "vocational", "other", "unknown"],
  recognitionStatus: ["recognised", "german-qualification", "pending", "not-recognised", "unknown"],
  qualifiedJob: ["yes", "no", "unknown"], degreeMatchesJob: ["yes", "no", "unknown"], regulatedProfession: ["yes", "no", "unknown"], practiceLicence: ["yes", "no", "unknown"], ageBand: ["under45", "45plus", "unknown"],
};
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
export function parseProfile(input: unknown): JourneyProfile {
  if (!isRecord(input) || ![1, 2].includes(Number(input.version)) || typeof input.version !== "number" || typeof input.name !== "string" || input.name.length > 120) throw new Error("Invalid journey profile.");
  const profile = createProfile();
  profile.name = input.name;
  for (const [section, keys] of [["employment", employmentKeys], ["qualification", qualificationKeys]] as const) {
    const record = input[section];
    if (!isRecord(record)) throw new Error(`Missing ${section} information.`);
    for (const key of keys) {
      const field = record[key];
      if (!isRecord(field) || typeof field.value !== "string" || field.value.length > 2000 || typeof field.confirmed !== "boolean"
        || !["unknown", "manual", "contract-extraction", "demo-contract", "demo-profile"].includes(String(field.origin))
        || !(field.extractedValue === null || typeof field.extractedValue === "string" && field.extractedValue.length <= 2000)
        || !(field.evidence === undefined || typeof field.evidence === "string" && field.evidence.length <= 2000)) throw new Error(`Invalid field: ${key}.`);
      if (field.value && options[key] && !options[key]!.includes(field.value)) throw new Error(`Invalid choice: ${key}.`);
      const destination = profile[section] as Record<string, ProfileField>;
      destination[key] = { value: field.value, extractedValue: field.extractedValue as string | null, origin: field.origin as Origin, confirmed: field.confirmed, ...(field.evidence ? { evidence: field.evidence as string } : {}) };
    }
  }
  if (input.contractDocument !== null) {
    const doc = input.contractDocument;
    if (!isRecord(doc) || typeof doc.name !== "string" || doc.name.length > 255 || !["demo", "user-file"].includes(String(doc.kind))) throw new Error("Invalid document record.");
    profile.contractDocument = { name: doc.name, kind: doc.kind as "demo" | "user-file" };
  }
  if (typeof input.contractReviewed !== "boolean" || typeof input.visaReviewed !== "boolean") throw new Error("Invalid progress.");
  profile.contractReviewed = input.contractReviewed;
  profile.visaReviewed = input.visaReviewed;
  if (input.selectedRoute !== null && !["eu-eea", "swiss", "blue-card", "skilled-worker"].includes(String(input.selectedRoute))) throw new Error("Invalid route selection.");
  profile.selectedRoute = input.selectedRoute as string | null;
  if (!isRecord(input.documentsReady) || Object.keys(input.documentsReady).length > 40) throw new Error("Invalid checklist.");
  for (const [key, value] of Object.entries(input.documentsReady)) {
    if (!/^[a-z][a-z0-9-]{0,60}$/.test(key) || typeof value !== "boolean") throw new Error("Invalid checklist item.");
    Object.defineProperty(profile.documentsReady, key, { value, enumerable: true, writable: true });
  }
  if (input.version === 1) {
    profile.documents = migrateDocuments(profile);
  } else {
    if (!Array.isArray(input.documents) || input.documents.length > Object.keys(documentCatalog).length) throw new Error("Invalid Document Vault.");
    const types = new Set<string>();
    const ids = new Set<string>();
    const validDate = (date: unknown) => date === null || typeof date === "string" && date.length <= 30 && Number.isFinite(Date.parse(date));
    for (const document of input.documents) {
      if (!isRecord(document) || typeof document.type !== "string" || !Object.hasOwn(documentCatalog, document.type)
        || typeof document.id !== "string" || !/^[a-z][a-z0-9-]{0,80}$/.test(document.id) || ids.has(document.id) || types.has(document.type)
        || !(document.filename === null || typeof document.filename === "string" && document.filename.length > 0 && document.filename.length <= 255)
        || !validDate(document.dateAdded) || !validDate(document.updatedAt)
        || !["available", "needs-update"].includes(String(document.status)) || !["demo", "user-file", "self-reported"].includes(String(document.source))
        || !Array.isArray(document.phases) || document.phases.length > 5 || document.phases.some(phase => !Number.isInteger(phase) || phase < 1 || phase > 5)) throw new Error("Invalid document metadata.");
      types.add(document.type); ids.add(document.id);
      profile.documents.push({ id: document.id, type: document.type as DocumentType, filename: document.filename as string | null,
        dateAdded: document.dateAdded as string | null, updatedAt: document.updatedAt as string | null,
        status: document.status as VaultDocument["status"], source: document.source as VaultDocument["source"], phases: [...documentCatalog[document.type as DocumentType].phases] });
    }
    const application = input.application;
    if (!isRecord(application) || typeof application.fastTrack !== "boolean") throw new Error("Invalid application context.");
    profile.application.fastTrack = application.fastTrack;
    for (const key of applicationKeys) {
      if (!["unknown", "required", "not-required"].includes(String(application[key]))) throw new Error("Invalid application requirement.");
      profile.application[key] = application[key] as ApplicationRequirement;
    }
    if (!Array.isArray(input.visitedStages) || input.visitedStages.length > 5 || input.visitedStages.some(stage => !["contract", "visa", "accommodation", "setup", "benefits"].includes(String(stage)))) throw new Error("Invalid journey stages.");
    profile.visitedStages = [...new Set(input.visitedStages)] as StageId[];
    if (!isRecord(input.tasksDone) || Object.keys(input.tasksDone).length > 30) throw new Error("Invalid journey tasks.");
    for (const [key, value] of Object.entries(input.tasksDone)) {
      if (!/^[a-z][a-z0-9-]{0,60}$/.test(key) || typeof value !== "boolean") throw new Error("Invalid journey task.");
      Object.defineProperty(profile.tasksDone, key, { value, enumerable: true, writable: true });
    }
  }
  const errors = employmentErrors(profile);
  if (errors.length) throw new Error(errors[0]);
  return profile;
}
