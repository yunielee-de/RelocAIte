export type Profile = {
  name: string;
  city: string;
  federalState: string;
  arrivalDate: string;
  permit: string;
  permitExpiry: string;
  grossSalary: number;
  movedForJob: boolean;
  relocationSpend: number;
  employerReimbursement: number;
  remoteDaysPerWeek: number;
  foreignIncome: boolean;
  employmentMonths: number;
  educationDaysUsed: number;
  taxReturnFiled: boolean;
};

export type Finding = {
  id: string;
  category: "money" | "deadline" | "work" | "expert";
  status: string;
  title: string;
  value: string;
  summary: string;
  reason: string;
  action: string;
  source: { label: string; url: string };
  destination?: string;
  draft?: string;
  priority: number;
};

export function assessProfile(profile: Profile): Finding[] {
  const findings: Finding[] = [];
  const unreimbursed = Math.max(
    0,
    profile.relocationSpend - profile.employerReimbursement,
  );

  const educationRules: Record<string, { days: number; period: string; term: string; source: { label: string; url: string } }> = {
    Berlin: {
      days: 5,
      period: "this calendar year",
      term: "Bildungszeit",
      source: {
        label: "Berlin Senate — Bildungszeit",
        url: "https://www.berlin.de/sen/arbeit/weiterbildung/bildungszeit/",
      },
    },
    Hessen: {
      days: 5,
      period: "this calendar year",
      term: "Bildungsurlaub",
      source: {
        label: "Arbeitswelt Hessen — Bildungsurlaub",
        url: "https://arbeitswelt.hessen.de/bildungsurlaub/infos-fuer-beschaeftigte/wer-hat-ab-wann-und-wie-viel-anspruch-auf-bildungsurlaub/",
      },
    },
    Hamburg: {
      days: 10,
      period: "the applicable two-year period",
      term: "Bildungsurlaub",
      source: {
        label: "Hamburg — Bildungsurlaub",
        url: "https://hibb.hamburg.de/bildungswege-abschluesse/karriere-und-weiterbildung/bildungsurlaub-bildungsfreistellung/",
      },
    },
  };
  const educationRule = educationRules[profile.federalState];
  if (educationRule) {
    const remaining = Math.max(0, educationRule.days - profile.educationDaysUsed);
    findings.push({
      id: "education-leave",
      category: "work",
      status: profile.employmentMonths >= 6 ? "Potential paid leave" : "Available after 6 months",
      title: educationRule.term,
      value: profile.employmentMonths >= 6 ? `${remaining} days` : `${6 - profile.employmentMonths} months to go`,
      summary:
        profile.employmentMonths >= 6
          ? `You may have ${remaining} paid education-leave days remaining for ${educationRule.period}, subject to an eligible course and employer confirmation.`
          : "The initial waiting period may not yet be complete.",
      reason: `You work in ${profile.federalState}, reported ${profile.employmentMonths} months with this employer, and ${profile.educationDaysUsed} days already used.`,
      action:
        "Choose a recognised course, obtain its recognition confirmation, and contact HR early. The employer makes the final calculation.",
      destination: "Your employer or HR team",
      draft:
        `Subject: Request for ${educationRule.term}\n\nHi [Manager name],\n\nI would like to request ${remaining} day(s) of ${educationRule.term} for the recognised course [course name] from [dates]. I have attached the registration and recognition confirmation.\n\nCould you please confirm the internal process and my remaining entitlement?\n\nThank you,\n[Your name]`,
      source: educationRule.source,
      priority: 0,
    });
  }

  if (profile.movedForJob && unreimbursed > 0) {
    findings.push({
      id: "relocation-costs",
      category: "money",
      status: "Worth reviewing",
      title: "Job-related relocation costs",
      value: `€${unreimbursed.toLocaleString("en-DE")}`,
      summary:
        "You reported relocation expenses that your employer did not reimburse. Some job-related costs may qualify as income-related expenses.",
      reason: `You moved for work and paid €${profile.relocationSpend.toLocaleString("en-DE")}; your employer reimbursed €${profile.employerReimbursement.toLocaleString("en-DE")}.`,
      action:
        "Collect invoices, travel receipts, and proof of your job start. Confirm deductibility with an authorised tax professional before filing.",
      source: {
        label: "§ 9 German Income Tax Act (EStG)",
        url: "https://www.gesetze-im-internet.de/estg/__9.html",
      },
      destination: "Your tax records / authorised tax professional",
      priority: 1,
    });
  }

  if (profile.permit !== "EU / EEA citizen" && profile.permitExpiry) {
    const expiry = new Date(`${profile.permitExpiry}T12:00:00`);
    const today = new Date("2026-09-12T12:00:00");
    const days = Math.max(
      0,
      Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000),
    );
    findings.push({
      id: "permit-expiry",
      category: "deadline",
      status: days <= 60 ? "Time-sensitive" : "Plan ahead",
      title: "Residence permit review",
      value: days === 0 ? "Due now" : `${days} days`,
      summary:
        "Your residence document is approaching its expiry date. Appointment availability and required documents vary by authority.",
      reason: `Your recorded permit expiry is ${expiry.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.`,
      action:
        "Review the current renewal requirements and appointment process for your local immigration authority.",
      source: {
        label: "Make it in Germany — visa and residence",
        url: "https://www.make-it-in-germany.com/en/visa-residence",
      },
      priority: days <= 60 ? 0 : 2,
    });
  }

  if (profile.remoteDaysPerWeek > 0) {
    findings.push({
      id: "remote-work",
      category: "work",
      status: "Build your evidence",
      title: "Remote-work documentation",
      value: `${profile.remoteDaysPerWeek} days/week`,
      summary:
        "Your work pattern may affect which employment expenses are relevant. Keep a consistent record of workplace and home-working days.",
      reason: `You reported working remotely ${profile.remoteDaysPerWeek} days per week.`,
      action:
        "Save your remote-work agreement and begin a simple work-location calendar. Do not count the same day in multiple categories.",
      source: {
        label: "Federal Government guidance on home working",
        url: "https://www.bundesfinanzministerium.de/Content/EN/Standardartikel/Topics/Taxation/Articles/home-office.html",
      },
      priority: 3,
    });
  }

  if (profile.foreignIncome) {
    findings.push({
      id: "cross-border-income",
      category: "expert",
      status: "Expert review",
      title: "Cross-border income",
      value: "Needs context",
      summary:
        "Foreign income can involve residence, treaty, and timing questions. Relocaite should not decide this from a short questionnaire.",
      reason: "You indicated that you received income outside Germany during the relevant tax year.",
      action:
        "Bring the income statement, dates of residence, and any foreign tax paid to an authorised tax adviser.",
      source: {
        label: "Federal Ministry of Finance — international taxation",
        url: "https://www.bundesfinanzministerium.de/Web/EN/Issues/Taxation/International-taxation/international-taxation.html",
      },
      priority: 2,
    });
  }

  if (!profile.taxReturnFiled) {
    findings.push({
      id: "tax-return-status",
      category: "money",
      status: "Still open",
      title: "Tax return check",
      value: "Not filed",
      summary:
        "You indicated that you have not filed for this tax year. Whether filing is required or beneficial depends on your complete situation.",
      reason: "Your profile marks this year’s German tax return as not yet filed.",
      action:
        "Gather your annual wage tax certificate and supporting records. Use ELSTER, suitable software, or an authorised tax professional.",
      destination: "Finanzamt via ELSTER, or an authorised professional",
      source: {
        label: "Make it in Germany — salary, taxes and social security",
        url: "https://www.make-it-in-germany.com/en/working-in-germany/working-environment/salary-taxes-social-security",
      },
      priority: 4,
    });
  }

  return findings.sort((a, b) => a.priority - b.priority);
}
