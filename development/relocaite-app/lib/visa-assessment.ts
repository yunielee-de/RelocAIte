import { annualSalary, fieldValue, type JourneyProfile } from "./journey-profile";
import { euEeaCountries, mvpRules, nationalityOptions, officialSources, type SourceKey } from "./mvp-visa-rules";
import { documentAvailable, vaultDocument, type DocumentType } from "./document-vault";

export type Requirement = { id: string; text: string; source: SourceKey; destination?: "contract" | "qualification"; actionUrl?: string };
export type VisaRoute = {
  id: "eu-eea" | "swiss" | "blue-card" | "skilled-worker";
  title: string; status: "potential" | "verify" | "outside-scope";
  summary: string; satisfied: string[]; missing: Requirement[]; notes: string[]; sources: SourceKey[];
};
export type VisaAssessment = { generatedAt: string; rulesVersion: string; routes: VisaRoute[]; notice: string };
export type ChecklistItem = { id: string; label: string; detail: string; ready: boolean; automatic: boolean; source: SourceKey; documentType?: DocumentType; availability?: "provided" | "reported"; needsApplicability?: boolean };
export type NextAction = { title: string; detail: string; destination?: "contract" | "qualification"; href?: string };

export function assessVisa(profile: JourneyProfile, now = new Date()): VisaAssessment {
  const e = (key: keyof JourneyProfile["employment"]) => fieldValue(profile.employment[key]);
  const q = (key: keyof JourneyProfile["qualification"]) => fieldValue(profile.qualification[key]);
  const result: VisaAssessment = { generatedAt: now.toISOString(), rulesVersion: mvpRules.version, routes: [], notice: "This is a preparation check based on your confirmed information. It does not determine eligibility, entry permission or visa approval. The responsible authority verifies the evidence." };
  const nationality = q("nationality");
  if (!nationality || nationality === "UNKNOWN" || !Object.hasOwn(nationalityOptions, nationality)) {
    result.notice = "Confirm your nationality to explore a potential route. If you have multiple nationalities, check whether an EU/EEA or Swiss nationality applies. No nationality has been assumed.";
    return result;
  }
  const date = now.toISOString().slice(0, 10);
  const sourceExpired = date < mvpRules.effectiveFrom || date > mvpRules.effectiveThrough;
  const common: Requirement[] = [];
  if (!profile.contractReviewed || !e("employer") || !e("jobTitle")) common.push({ id: "contract", text: "Confirm your employer and job title from a specific offer or contract.", source: "skilled", destination: "contract" });
  if (e("workCountry") !== "DE" || !e("workLocation")) common.push({ id: "location", text: "Confirm that this employment is based in Germany and provide the work location.", source: "skilled", destination: "contract" });
  if (!e("startDate")) common.push({ id: "start", text: "Confirm the employment start date.", source: "entry", destination: "contract" });
  if (sourceExpired) common.push({ id: "rules-date", text: "This source snapshot covers 2026. Verify current rules before relying on this result.", source: "entry", actionUrl: officialSources.entry.url });
  if (e("startDate") && !e("startDate").startsWith("2026")) common.push({ id: "start-year", text: "Your employment starts outside 2026. Verify the rules for your application and start dates.", source: "entry", actionUrl: officialSources.entry.url });
  const employmentFacts = profile.contractReviewed && e("employer") ? [`Employment information confirmed for ${e("employer")}.`] : [];

  if (Object.hasOwn(euEeaCountries, nationality) || nationality === "CH") {
    const swiss = nationality === "CH";
    const missing = [...common];
    if (!q("regulatedProfession") || q("regulatedProfession") === "unknown") missing.push({ id: "regulated", text: "Check whether the profession is regulated in Germany; free movement does not replace professional licensing.", source: "recognitionFinder", destination: "qualification" });
    if (q("regulatedProfession") === "yes" && q("practiceLicence") !== "yes") missing.push({ id: "licence", text: "Verify the required professional licence before starting regulated work.", source: "recognitionFinder", actionUrl: officialSources.recognitionFinder.url });
    result.routes = [{
      id: swiss ? "swiss" : "eu-eea", title: swiss ? "Swiss free-movement pathway" : nationality === "DE" ? "German citizen · employment setup" : "EU / EEA free-movement pathway",
      status: missing.length ? "verify" : "potential", summary: "Your confirmed nationality points to a free-movement or domestic employment pathway. A Blue Card is not the relevant starting point.",
      satisfied: [`Nationality confirmed as ${nationalityOptions[nationality as keyof typeof nationalityOptions]}.`, ...employmentFacts], missing,
      notes: swiss ? ["Swiss residence documentation follows a distinct process. Contact your local immigration authority; the linked Berlin procedure is an example, not a Germany-wide appointment service."] : ["Local address registration and any professional licensing still need attention."],
      sources: swiss ? ["entry", "swiss", "recognitionFinder"] : ["freeMovement", "entry", "recognitionFinder"],
    }];
    return result;
  }

  const qualified = ["academic", "vocational"].includes(q("qualificationType"));
  const qualificationMissing: Requirement[] = [];
  if (q("recognitionStatus") === "german-qualification" && !["germany", "deutschland", "de"].includes(q("qualificationCountry").toLowerCase())) qualificationMissing.push({ id: "qualification-country", text: "Your German-qualification answer and qualification country need clarification.", source: "skilled", destination: "qualification" });
  if (!q("highestQualification") || !q("qualificationCountry") || !q("profession")) qualificationMissing.push({ id: "qualification-details", text: "Confirm your qualification, country of qualification and profession.", source: "skilled", destination: "qualification" });
  if (!["recognised", "german-qualification"].includes(q("recognitionStatus"))) qualificationMissing.push({ id: "recognition", text: q("qualificationType") === "vocational" ? "Verify German recognition of your vocational qualification." : "Verify your degree's comparability using the relevant anabin evidence or a ZAB statement.", source: q("qualificationType") === "vocational" ? "recognitionFinder" : "recognition", actionUrl: q("qualificationType") === "vocational" ? officialSources.recognitionFinder.url : officialSources.recognition.url });
  if (q("qualifiedJob") !== "yes") qualificationMissing.push({ id: "qualified-job", text: "Verify that the offered job requires a university degree or qualified vocational training.", source: "skilled", destination: "qualification" });
  if (!q("regulatedProfession") || q("regulatedProfession") === "unknown") qualificationMissing.push({ id: "regulated", text: "Check whether your profession is regulated in Germany.", source: "recognitionFinder", destination: "qualification" });
  if (q("regulatedProfession") === "yes" && q("practiceLicence") !== "yes") qualificationMissing.push({ id: "licence", text: "Professional licensing needs verification before this route can be assessed further.", source: "skilled", actionUrl: officialSources.recognitionFinder.url });
  const salary = annualSalary(profile);
  const blueMissing = [...common, ...qualificationMissing];
  if (q("qualificationType") !== "academic") blueMissing.push({ id: "academic", text: "This MVP checks the standard academic Blue Card case. Other qualifications and experience-based cases need separate review.", source: "blueCard", destination: "qualification" });
  if (e("currency") !== "EUR" || salary === null) blueMissing.push({ id: "salary", text: "Confirm gross pay in EUR and its monthly or annual period. Foreign-currency conversion is outside this check.", source: "blueCard", destination: "contract" });
  else if (salary < mvpRules.standardBlueCardAnnualEur) blueMissing.push({ id: "salary-threshold", text: `The confirmed salary is below the standard 2026 threshold of €${mvpRules.standardBlueCardAnnualEur.toLocaleString("en-GB")}. Reduced-threshold cases are outside this MVP; this does not rule out a Blue Card.`, source: "blueCard", actionUrl: officialSources.blueCard.url });
  if (!["permanent", "at-least-six-months"].includes(e("contractDuration"))) blueMissing.push({ id: "duration", text: "Confirm employment lasting at least six months. Shorter or uncertain contracts need review.", source: "blueCard", destination: "contract" });
  if (q("degreeMatchesJob") !== "yes") blueMissing.push({ id: "job-match", text: "Verify that the job matches your academic qualification.", source: "blueCard", destination: "qualification" });
  const skilledMissing = [...common, ...qualificationMissing];
  if (!qualified) skilledMissing.push({ id: "qualification-type", text: "This route check needs an academic or qualified vocational qualification. Other cases need separate review.", source: "skilled", destination: "qualification" });
  if (q("ageBand") !== "under45") skilledMissing.push({ id: "age", text: "Confirm your age band. For age 45+ this MVP leaves first-employment, salary and pension requirements to individual review.", source: "skilled", ...(q("ageBand") === "45plus" ? { actionUrl: officialSources.skilled.url } : { destination: "qualification" as const }) });
  const facts = [...employmentFacts];
  if (qualified) facts.push(`${q("qualificationType") === "academic" ? "Academic" : "Vocational"} qualification reported: ${q("highestQualification") || "title still needed"}.`);
  if (["recognised", "german-qualification"].includes(q("recognitionStatus"))) facts.push("Recognition or German qualification reported by you; supporting evidence still needs official verification.");
  const blueOutside = q("qualificationType") === "vocational" || q("qualificationType") === "other" || e("contractDuration") === "under-six-months" || (salary !== null && e("currency") === "EUR" && salary < mvpRules.standardBlueCardAnnualEur);
  const blue: VisaRoute = {
    id: "blue-card", title: "Potential EU Blue Card", status: blueOutside ? "outside-scope" : blueMissing.length ? "verify" : "potential",
    summary: "A possible starting point for academic professionals with a matching German job. This check covers the standard salary case only.",
    satisfied: [...facts, ...(salary !== null && e("currency") === "EUR" && salary >= mvpRules.standardBlueCardAnnualEur ? [`Confirmed annual gross pay of €${salary.toLocaleString("en-GB")} meets the standard 2026 salary threshold.`] : [])],
    missing: blueMissing, notes: ["Shortage occupations, recent graduates, experience-only and other special cases may follow different rules. They are not rejected by this limited check."], sources: ["blueCard", "recognition", "blueChecklist"],
  };
  const skilled: VisaRoute = {
    id: "skilled-worker", title: "Potential skilled-worker route", status: q("qualificationType") === "other" || q("ageBand") === "45plus" || q("qualifiedJob") === "no" ? "outside-scope" : skilledMissing.length ? "verify" : "potential",
    summary: "A possible route based on recognised academic or vocational qualifications and qualified employment in Germany.", satisfied: facts,
    missing: skilledMissing, notes: ["Employment conditions and any required Federal Employment Agency approval remain for the responsible authorities. This check does not assess livelihood, existing permits or every admission condition."], sources: ["skilled", "entry"],
  };
  const rank = { potential: 0, verify: 1, "outside-scope": 2 };
  result.routes = [blue, skilled].sort((a, b) => rank[a.status] - rank[b.status] || a.missing.length - b.missing.length);
  return result;
}

export function routeChecklist(profile: JourneyProfile, route: VisaRoute): ChecklistItem[] {
  const free = ["eu-eea", "swiss"].includes(route.id);
  const e = profile.employment;
  const q = profile.qualification;
  const task = (id: string, label: string, detail: string, source: SourceKey): ChecklistItem => ({ id, label, detail, source, ready: profile.documentsReady[id] === true, automatic: false });
  const doc = (id: DocumentType, label: string, detail: string, source: SourceKey, needsApplicability = false): ChecklistItem => {
    const record = vaultDocument(profile, id);
    const available = documentAvailable(profile, id);
    return { id, documentType: id, label, detail: `${detail}${record?.source === "demo" ? " Fictional sample only; not application evidence." : ""}`, source,
      ready: available && !needsApplicability, automatic: true, needsApplicability,
      availability: available ? record?.filename ? "provided" : "reported" : undefined };
  };
  const items: ChecklistItem[] = [
    doc("employment", "Employment contract", "Reused from your Document Vault. Check signatures, completeness and the authority's requirements.", "skilled"),
    doc("identity", free ? "Valid passport or national ID" : "Valid passport", "Keep the original available and check validity requirements. Recorded metadata does not verify the document.", free ? "entry" : "blueChecklist"),
  ];
  if (!free) {
    items.push({ id: "salary-fact", label: "Salary information", detail: "Confirmed pay carried forward from Stage 1; this is a profile fact, not a separately verified document.", ready: annualSalary(profile) !== null && !!fieldValue(e.currency), automatic: true, source: "skilled" });
    items.push(doc("qualification", fieldValue(q.qualificationType) === "vocational" ? "Vocational qualification certificate" : "Degree / qualification certificate", "Prepare the original and check translation requirements with the responsible authority.", "skilled"));
    if (fieldValue(q.recognitionStatus) !== "german-qualification") items.push(doc("recognition", "Qualification recognition / comparability evidence", "This document status does not change your reported recognition result. Update qualification facts when a decision arrives.", fieldValue(q.qualificationType) === "vocational" ? "recognitionFinder" : "recognition"));
    items.push(doc("insurance", "Health insurance evidence", "Check coverage for your intended entry and employment dates with the responsible mission.", "healthInsurance"));
    if (profile.application.employmentDeclaration !== "not-required") items.push(doc("declaration", "Erklärung zum Beschäftigungsverhältnis", "Employer-completed Declaration of Employment. Confirm applicability with the responsible mission using the choices above.", "declaration", profile.application.employmentDeclaration === "unknown"));
    if (profile.application.biometricPhoto !== "not-required") items.push(doc("photo", "Biometric photo · where required", "Confirm the photo format and submission method with the responsible mission.", "entry", profile.application.biometricPhoto === "unknown"));
    if (profile.application.routeDeclarations !== "not-required") items.push(doc("route-declarations", "Route-specific declarations · where applicable", "Only prepare the additional declarations requested for your application; check the mission's forms.", "visaFees", profile.application.routeDeclarations === "unknown"));
    if (profile.application.fastTrack) items.push(doc("fast-track", "Fast-track documents", "You indicated that the accelerated procedure is being used. Coordinate authorisation and preliminary approval documents with your employer.", "fastTrack"));
    if (profile.application.accommodationEvidence === "required") items.push(doc("accommodation", "Accommodation evidence", "Included because you confirmed the responsible mission requests it. A rental record is reused if already provided.", "entry"));
    items.push(task("mission-checklist", "Responsible mission's document checklist reviewed", "Confirm entry rules and the complete list for your country of residence, including whether accommodation evidence is needed. This list is not exhaustive.", "entry"));
  } else {
    items.push(task("registration", "Address registration preparation", "Check the local registration process and housing documents for your planned residence.", "registration"));
    if (route.id === "swiss") items.push(task("swiss-notification", "Swiss residence notification / documentation", "Check your local immigration authority's process. Berlin's official guide explains its Swiss-specific procedure.", "swiss"));
  }
  if (fieldValue(q.regulatedProfession) === "yes") items.push(doc("licence", "Professional licence evidence", "Nationality or a potential residence route does not replace permission to practise a regulated profession.", "recognitionFinder"));
  return items;
}
export function nextAction(profile: JourneyProfile, route: VisaRoute): NextAction {
  const missing = route.missing[0];
  if (missing) return { title: missing.id === "recognition" ? "Check your qualification recognition" : missing.destination === "contract" ? "Complete your employment information" : missing.destination === "qualification" ? "Clarify your qualification information" : "Verify this requirement", detail: missing.text, destination: missing.destination, href: missing.actionUrl };
  const item = routeChecklist(profile, route).find(item => !item.ready);
  if (item) return { title: `Prepare: ${item.label}`, detail: item.detail, href: officialSources[item.source].url };
  return { title: "Verify your preparation with the responsible authority", detail: "Your in-app checklist is ready. Confirm the official process and evidence before applying or starting work.", href: officialSources.entry.url };
}
export function visaStageComplete(profile: JourneyProfile, assessment: VisaAssessment): boolean {
  const route = assessment.routes.find(route => route.id === profile.selectedRoute);
  return !!route && profile.visaReviewed && route.status === "potential" && routeChecklist(profile, route).every(item => item.ready);
}
export function checklistText(profile: JourneyProfile, route: VisaRoute): string {
  const action = nextAction(profile, route);
  return `RelocAIte · ${profile.name || "Your"} preparation checklist\n${route.title} — based on user-confirmed information\n\n${routeChecklist(profile, route).map(item => `${item.ready ? "[x]" : "[ ]"} ${item.label}\n    ${item.detail}\n    Source: ${officialSources[item.source].url}`).join("\n\n")}\n\nNeeds verification:\n${route.missing.map(item => `- ${item.text}`).join("\n") || "See the official process for remaining admission conditions."}\n\nNext action: ${action.title}\n${action.detail}\n${action.href || "Return to your RelocAIte profile."}\n\nMVP rules: ${mvpRules.version}. Preparation only; no visa approval or official document verification.\n`;
}
