import type { JourneyProfile, StageId } from "./journey-profile";
import { nextAction, visaStageComplete, type VisaAssessment } from "./visa-assessment";

export const journeyStages: { id: StageId; title: string; description: string }[] = [
  { id: "contract", title: "Job Offer & Contract", description: "Understand your offer and confirm the facts that matter." },
  { id: "visa", title: "Visa Application", description: "Explore a potential route and prepare your documents." },
  { id: "accommodation", title: "Accommodation & Registration", description: "Find a place to call home and get registered." },
  { id: "setup", title: "Compliance & Setup", description: "Arrange insurance and get ready for employment and tax setup." },
  { id: "benefits", title: "Tax Refund & Benefits", description: "Explore potential support and keep track of relevant expenses." },
];
export const stageTasks = {
  accommodation: [
    { id: "housing-plan", label: "I checked the documents requested for my housing search." },
    { id: "registration-plan", label: "I checked my local Anmeldung process and how to obtain a Wohnungsgeberbestätigung." },
  ],
  setup: [
    { id: "insurance-plan", label: "I reviewed continuous health coverage and my insurance options." },
    { id: "tax-plan", label: "I reviewed my Tax ID and employer onboarding next steps." },
    { id: "expense-plan", label: "I have a plan to keep relevant expense records." },
  ],
  benefits: [{ id: "benefits-plan", label: "I reviewed the potential opportunities and chose a follow-up to explore." }],
} as const;
export function journeyProgress(profile: JourneyProfile, assessment: VisaAssessment) {
  const done = [profile.contractReviewed, visaStageComplete(profile, assessment),
    ...(["accommodation", "setup", "benefits"] as const).map(stage => stageTasks[stage].every(task => profile.tasksDone[task.id]))];
  const completed = done.filter(Boolean).length;
  const currentIndex = done.findIndex(value => !value);
  return { done, completed, percent: completed / journeyStages.length * 100, currentIndex,
    states: journeyStages.map((stage, index) => done[index] ? "Completed" : index === currentIndex || profile.visitedStages.includes(stage.id) ? "In progress" : "Not started") };
}
export function journeyNextAction(profile: JourneyProfile, assessment: VisaAssessment) {
  const progress = journeyProgress(profile, assessment);
  const current = journeyStages[progress.currentIndex];
  if (!current) return { title: "Keep your journey up to date", detail: "Your in-app preparation steps are complete. Revisit your information as your move progresses; official decisions and real-world tasks remain yours to confirm.", destination: "benefits" as StageId };
  if (current.id === "contract") return { title: "Confirm your employment information", detail: "Use the sample contract or enter your own details, then confirm what you know.", destination: current.id };
  if (current.id === "visa") {
    const route = profile.visaReviewed && assessment.routes.find(route => route.id === profile.selectedRoute);
    const action = route ? nextAction(profile, route) : null;
    return { title: action?.title ?? "Find your potential visa route", detail: action?.detail ?? "Your contract facts are ready. Add only the nationality and qualification information still missing.", destination: action?.destination === "contract" ? "contract" as const : "visa" as const };
  }
  return { title: current.id === "accommodation" ? "Plan your housing and registration" : current.id === "setup" ? "Prepare your insurance and tax setup" : "Explore potential financial support", detail: current.description, destination: current.id };
}
