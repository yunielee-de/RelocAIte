import { createProfile, employmentKeys, invalidateAssessment, invalidateJobFacts, type JourneyProfile, type EmploymentKey, type QualificationKey, type ProfileField } from "./journey-profile";
import { recordDocument } from "./document-vault";

export const DEMO_CONTRACT_NAME = "RelocAIte_sample_employment_contract.pdf";
export const demoEmployment: Record<EmploymentKey, [string, string]> = {
  employer: ["Nordlicht Digital GmbH", "Arbeitgeber: Nordlicht Digital GmbH (fiktiv)."],
  jobTitle: ["Software Engineer", "Position: Software Engineer."],
  salaryAmount: ["5500", "Das monatliche Bruttogehalt betraegt 5.500 EUR, zahlbar in 12 Monatsraten."],
  salaryPeriod: ["monthly", "12 Monatsraten pro Kalenderjahr."], currency: ["EUR", "Verguetung in EUR."],
  weeklyHours: ["40", "Die regelmaessige Arbeitszeit betraegt 40 Stunden pro Woche."],
  startDate: ["2026-11-01", "Das Arbeitsverhaeltnis beginnt am 01.11.2026."],
  workLocation: ["Berlin", "Arbeitsort ist Berlin, Deutschland."], workCountry: ["DE", "Arbeitsort ist Berlin, Deutschland."],
  contractDuration: ["permanent", "Das Arbeitsverhaeltnis wird auf unbestimmte Zeit geschlossen."],
  probationPeriod: ["6 months", "Die ersten sechs Monate gelten als Probezeit."],
  noticePeriod: ["During probation: 2 weeks. Afterwards: 4 weeks to the 15th or end of a month.", "In der Probezeit: zwei Wochen. Danach: vier Wochen zum 15. oder zum Monatsende."],
  annualLeave: ["30", "Der Jahresurlaub betraegt 30 Arbeitstage bei einer Fuenf-Tage-Woche."],
  relocationSupport: ["found", "Umzugskosten werden gegen Beleg bis zu 2.000 EUR erstattet."],
  visaSupport: ["not-found", "No visa-support clause appears in this fictional sample."],
  remotePolicy: ["unclear", "Mobiles Arbeiten ist nach Absprache moeglich. Umfang und Verfahren werden separat vereinbart."],
};
export function loadDemoContract(profile: JourneyProfile): JourneyProfile {
  const employment = Object.fromEntries(employmentKeys.map(key => {
    const [value, evidence] = demoEmployment[key];
    return [key, { value, extractedValue: value, origin: "demo-contract", confirmed: false, evidence } satisfies ProfileField];
  })) as JourneyProfile["employment"];
  return recordDocument({ ...invalidateJobFacts(profile), employment, contractReviewed: false, contractDocument: { name: DEMO_CONTRACT_NAME, kind: "demo" } }, "employment", DEMO_CONTRACT_NAME, "demo");
}
export function loadDemoBackground(profile: JourneyProfile): JourneyProfile {
  const values: Partial<Record<QualificationKey, string>> = {
    nationality: "IN", highestQualification: "BSc Computer Science", qualificationType: "academic", qualificationCountry: "India",
    profession: "Software engineering", recognitionStatus: "unknown", qualifiedJob: "yes", degreeMatchesJob: "yes", regulatedProfession: "no", ageBand: "under45",
  };
  const qualification = { ...profile.qualification };
  for (const [key, value] of Object.entries(values)) {
    qualification[key as QualificationKey] = { value, extractedValue: null, origin: "demo-profile", confirmed: false };
  }
  return { ...invalidateAssessment(profile), qualification };
}
export function manualContract(profile: JourneyProfile, fileName?: string): JourneyProfile {
  const next = { ...invalidateJobFacts(profile), employment: createProfile().employment, contractReviewed: false,
    contractDocument: fileName ? { name: fileName.slice(0, 255), kind: "user-file" as const } : profile.contractDocument };
  return fileName ? recordDocument(next, "employment", fileName) : next;
}
