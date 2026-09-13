import { demoEmployment } from "./demo-contract";
import { type EmploymentKey, type JourneyProfile } from "./journey-profile";

export type ReviewStatus = "Confirmed" | "Worth checking" | "Missing";
export type ContractFieldDefinition = { key: EmploymentKey; label: string; type?: string; options?: [string, string][]; note?: string };
const policyOptions: [string, string][] = [["found", "Found"], ["unclear", "Unclear"], ["not-found", "Not found"], ["unknown", "Not checked"]];
export const contractFields: Record<EmploymentKey, ContractFieldDefinition> = {
  employer: { key: "employer", label: "Employer" }, jobTitle: { key: "jobTitle", label: "Job title" },
  salaryAmount: { key: "salaryAmount", label: "Gross salary amount", type: "number", note: "Guaranteed base pay; exclude variable bonuses." },
  salaryPeriod: { key: "salaryPeriod", label: "Salary period", options: [["monthly", "Monthly · 12 payments/year"], ["annual", "Annual"]] },
  currency: { key: "currency", label: "Salary currency", options: [["EUR", "EUR · Euro"], ["USD", "USD · US dollar"], ["GBP", "GBP · British pound"], ["other", "Another currency"]] },
  weeklyHours: { key: "weeklyHours", label: "Working hours / week", type: "number" },
  startDate: { key: "startDate", label: "Employment start date", type: "date" },
  workLocation: { key: "workLocation", label: "Work location", note: "Where the job is based, not your home address." },
  workCountry: { key: "workCountry", label: "Country of employment", options: [["DE", "Germany"], ["other", "Another country"], ["unknown", "Not sure"]] },
  contractDuration: { key: "contractDuration", label: "Contract type · Befristet / Unbefristet", options: [["permanent", "Unbefristet · permanent"], ["at-least-six-months", "Befristet · at least 6 months"], ["under-six-months", "Befristet · under 6 months"], ["unknown", "Not stated / unsure"]] },
  probationPeriod: { key: "probationPeriod", label: "Probezeit / probation period" },
  noticePeriod: { key: "noticePeriod", label: "Notice period", note: "Include any different rule during probation." },
  annualLeave: { key: "annualLeave", label: "Annual leave / working days", type: "number" },
  relocationSupport: { key: "relocationSupport", label: "Relocation support", options: policyOptions },
  visaSupport: { key: "visaSupport", label: "Visa support", options: policyOptions },
  remotePolicy: { key: "remotePolicy", label: "Remote-work policy", options: policyOptions },
};
export const findingDefinitions = [
  { id: "role", title: "Employer, role & location", keys: ["employer", "jobTitle", "workLocation", "workCountry"], explanation: "Check the employer, offered role and where the job is based. These facts carry forward to your visa check." },
  { id: "duration", title: "Contract type", keys: ["contractDuration"], explanation: "Unbefristet means indefinite employment. Befristet means a fixed term; confirm its duration for the route check." },
  { id: "start", title: "Start date", keys: ["startDate"], explanation: "Use the agreed calendar date to plan the move. Check with your employer if starting work depends on further steps." },
  { id: "salary", title: "Gross salary", keys: ["salaryAmount", "salaryPeriod", "currency"], explanation: "Monthly base pay is annualised using 12 payments. Salary alone does not establish visa eligibility; see the reviewed guidance below." },
  { id: "hours", title: "Weekly working hours", keys: ["weeklyHours"], explanation: "Confirm the regular working hours recorded in the contract. Ask HR about any separate overtime arrangements." },
  { id: "leave", title: "Vacation days", keys: ["annualLeave"], explanation: "Confirm the number of working days and the workweek it refers to. Check the contract's wording alongside the general guidance below." },
  { id: "probation", title: "Probezeit / probation", keys: ["probationPeriod"], explanation: "Record the agreed introductory period. A six-month period is common, not universally mandatory." },
  { id: "notice", title: "Notice period", keys: ["noticePeriod"], explanation: "Check the full wording, including any different rule during probation or referenced agreement. This is not a legal-validity finding." },
  { id: "relocation", title: "Relocation support", keys: ["relocationSupport"], explanation: "Check any reimbursement conditions, limits and approval process. Ask HR for written clarification if these details are missing." },
  { id: "visa-support", title: "Visa support", keys: ["visaSupport"], explanation: "If no support clause is recorded, ask HR what help is available and who coordinates the process. Silence does not mean support is unavailable." },
  { id: "remote", title: "Remote-work policy", keys: ["remotePolicy"], explanation: "Check permitted locations, frequency and approval requirements. Ask for any separately agreed policy before relying on it." },
] as const satisfies readonly { id: string; title: string; keys: readonly EmploymentKey[]; explanation: string }[];
export type FindingId = typeof findingDefinitions[number]["id"];
export type ContractFinding = typeof findingDefinitions[number] & { status: ReviewStatus; corrected: boolean; value: string };
export function displayContractValue(key: EmploymentKey, value: string): string {
  if (!value.trim()) return "Not provided";
  const option = contractFields[key].options?.find(([option]) => option === value);
  if (option) return option[1];
  if (key === "salaryAmount" && Number.isFinite(Number(value))) return Number(value).toLocaleString("en-GB", { maximumFractionDigits: 2 });
  return value;
}
export function contractFindings(profile: JourneyProfile): ContractFinding[] {
  return findingDefinitions.map(definition => {
    const fields = definition.keys.map(key => profile.employment[key]);
    const missing = fields.some(field => !field.value.trim() || ["unknown", "not-found"].includes(field.value));
    const status: ReviewStatus = missing ? "Missing" : fields.every(field => field.confirmed && field.value !== "unclear") ? "Confirmed" : "Worth checking";
    const corrected = fields.some(field => field.extractedValue !== null && field.value !== field.extractedValue);
    return { ...definition, status, corrected, value: definition.keys.map(key => displayContractValue(key, profile.employment[key].value)).join(" · ") };
  });
}
// Always read the existing fixture for the source preview. User corrections never rewrite the document.
export function demoSourceValues(id: FindingId): { key: EmploymentKey; value: string }[] {
  const definition = findingDefinitions.find(finding => finding.id === id)!;
  return definition.keys.map(key => ({ key, value: displayContractValue(key, demoEmployment[key][0]) }));
}
export function employerRequest(profile: JourneyProfile): string {
  const unresolved = (["relocationSupport", "visaSupport", "remotePolicy"] as const).filter(key => profile.employment[key].value !== "found");
  return `Subject: Employment offer — details to confirm\n\nHello ${profile.employment.employer.value || "HR team"},\n\nThank you for the offer for ${profile.employment.jobTitle.value || "the role"}. Before I plan my move, could you clarify:\n\n${unresolved.map(key => `- ${contractFields[key].label}: what support or policy applies, and who should I contact?`).join("\n") || "- The conditions and approval process for the support discussed."}\n\nPlease share the relevant policy or written confirmation.\n\nThank you,\n${profile.name || "[Your name]"}`;
}
