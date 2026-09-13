import type { JourneyProfile } from "./journey-profile";
import { annualSalary, fieldValue } from "./journey-profile";

export type AssistantLink = { label: string; url: string };
export type AssistantAnswer = { text: string; link?: AssistantLink };

const housingGuide = "https://willkommenszentrum.berlin.de/wohnen/wohnungssuche";
const anmeldungGuide = "https://service.berlin.de/dienstleistung/120686/";
const scamGuide = "https://www.verbraucherzentrale-berlin.de/wissen/vertraege-reklamation/abzocke/fakewohnungen-im-internet-so-erkennen-sie-falsche-immobilienanzeigen-27576";

export function suggestedLink(question: string): AssistantLink | undefined {
  const q = question.toLowerCase();
  if (/scam|fraud|fake|safe|legit|deposit/.test(q)) return { label: "Rental-scam guidance", url: scamGuide };
  if (/anmeldung|register|registration|bürgeramt|address/.test(q)) return { label: "Official Berlin Anmeldung service", url: anmeldungGuide };
  if (/wohnung|apartment|flat|housing|rent|landlord/.test(q)) return { label: "Berlin housing guidance", url: housingGuide };
  return undefined;
}

export function curatedAnswer(question: string, profile: JourneyProfile): AssistantAnswer {
  const q = question.toLowerCase();
  const link = suggestedLink(question);
  if (/wohnung|apartment|flat|housing|rent|landlord/.test(q) && !/scam|fraud|fake|safe|legit|deposit/.test(q))
    return { text: "For a housing search, prepare your ID, proof of income, employment contract and—if requested—SCHUFA information. Never transfer a deposit before verifying the property and landlord, and confirm that registration at the address is permitted.", link };
  if (/scam|fraud|fake|safe|legit|deposit/.test(q))
    return { text: "Warning signs include unusually low rent, pressure to pay before a viewing, a landlord who cannot meet or arrange a video viewing, requests to leave the rental platform, and missing address or contract details. Verify independently before sharing money or sensitive documents.", link };
  if (/anmeldung|register|registration|bürgeramt|address/.test(q))
    return { text: "After moving in, check the registration process for your municipality. In Berlin, registration is generally required within 14 days. Prepare your identity document, signed registration form and Wohnungsgeberbestätigung; additional documents can depend on your situation.", link };
  if (/visa|blue card|residence/.test(q))
    return { text: "Your potential visa route depends on nationality, qualification, role, salary and other conditions. Use RelocAIte’s visa preparation step to review your confirmed facts, then verify current requirements with the responsible German authority." };
  if (/salary|income|pay/.test(q)) {
    const salary = annualSalary(profile);
    const currency = fieldValue(profile.employment.currency) || "currency unknown";
    return { text: `${salary === null ? "Your salary is not confirmed yet" : `Your confirmed profile shows ${new Intl.NumberFormat("en-GB").format(salary)} ${currency} gross per year`}. RelocAIte carries confirmed base pay forward for preparation, but landlords and authorities may still request original evidence.` };
  }
  if (/contract|job offer|employer/.test(q)) {
    const employer = fieldValue(profile.employment.employer);
    return { text: `${employer ? `Your confirmed profile lists ${employer}. ` : ""}Review the role, salary, work location, hours, probation period and notice terms before signing. Ask the employer to clarify anything missing or inconsistent.` };
  }
  if (/document|upload|passport|schufa/.test(q))
    return { text: "Use the Document Vault to track which records are available. RelocAIte saves readiness and filename metadata in this browser, not the original files." };
  return { text: "I can help with housing searches, rental-scam warning signs, Anmeldung, documents, contracts, salary and visa preparation. Tell me which step you are working on and what is unclear." };
}

export function assistantContext(profile: JourneyProfile): Record<string, string | number | null> {
  return {
    jobTitle: fieldValue(profile.employment.jobTitle) || null,
    annualGrossSalary: annualSalary(profile),
    currency: fieldValue(profile.employment.currency) || null,
    workLocation: fieldValue(profile.employment.workLocation) || null,
    workCountry: fieldValue(profile.employment.workCountry) || null,
    nationality: fieldValue(profile.qualification.nationality) || null,
    qualification: fieldValue(profile.qualification.highestQualification) || null,
    selectedVisaRoute: profile.visaReviewed ? profile.selectedRoute : null,
  };
}
