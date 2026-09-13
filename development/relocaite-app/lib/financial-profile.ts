import type { Profile } from "./assessment";
import type { JourneyProfile } from "./journey-profile";
import { annualSalary, fieldValue } from "./journey-profile";

export const emptyFinancialProfile: Profile = {
  name: "", city: "", federalState: "Berlin", arrivalDate: "", permit: "Other", permitExpiry: "", grossSalary: 0,
  movedForJob: false, relocationSpend: 0, employerReimbursement: 0, remoteDaysPerWeek: 0, foreignIncome: false,
  employmentMonths: 0, educationDaysUsed: 0, taxReturnFiled: false,
};

function stateForLocation(location: string): string {
  const value = location.toLowerCase();
  if (value.includes("berlin")) return "Berlin";
  if (value.includes("hamburg")) return "Hamburg";
  if (value.includes("frankfurt") || value.includes("wiesbaden") || value.includes("hessen")) return "Hessen";
  if (value.includes("munich") || value.includes("münchen") || value.includes("bayern") || value.includes("bavaria")) return "Bayern";
  if (value.includes("dresden") || value.includes("leipzig") || value.includes("sachsen") || value.includes("saxony")) return "Sachsen";
  return "Other";
}

export function hasJourneyProfileData(profile: JourneyProfile): boolean {
  return Boolean(profile.name.trim() || fieldValue(profile.employment.jobTitle) || fieldValue(profile.employment.salaryAmount) || fieldValue(profile.employment.workLocation) || profile.visaReviewed);
}

export function financialProfileFromJourney(profile: JourneyProfile): Profile {
  const location = fieldValue(profile.employment.workLocation);
  const annual = annualSalary(profile);
  const routeToPermit: Record<string, string> = { "blue-card": "EU Blue Card", "skilled-worker": "Skilled worker permit", "eu-eea": "EU / EEA citizen" };
  return {
    ...emptyFinancialProfile,
    name: profile.name.trim(),
    city: location,
    federalState: location ? stateForLocation(location) : "Berlin",
    permit: profile.visaReviewed && profile.selectedRoute ? routeToPermit[profile.selectedRoute] || "Other" : "Other",
    grossSalary: annual === null ? 0 : Math.round((annual / 12) * 100) / 100,
  };
}
