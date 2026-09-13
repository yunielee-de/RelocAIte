// Phase 1 evidence snapshot. Intentionally local: do not change the shared team registry.
// Reviewed against the official pages below on 2026-09-13. No live scraping in assessments.
export const mvpRules = {
  version: "2026.09.13-mvp.2", effectiveFrom: "2026-01-01", effectiveThrough: "2026-12-31", reviewedAt: "2026-09-13",
  standardBlueCardAnnualEur: 50700, reducedBlueCardAnnualEur: 45934.20, minimumBlueCardMonths: 6, adultNationalVisaFeeEur: 75,
  scope: "Standard academic Blue Card and formally qualified skilled-worker cases. Reduced salary, experience-only, recognition-partnership, family, and existing-permit cases need separate review. Age 45+ skilled-worker cases are escalated in this MVP.",
} as const;
export const officialSources = {
  visaFees: { label: "Federal Foreign Office · Visa procedure and fees", url: "https://www.auswaertiges-amt.de/en/visa-service/215870-215870", scope: "National visa application forms, usual fee and exemptions" },
  fastTrack: { label: "Make it in Germany · Fast-track procedure", url: "https://www.make-it-in-germany.com/en/looking-for-foreign-professionals/entering/the-fast-track-procedure-for-skilled-workers", scope: "Employer authorisation, authority coordination and preliminary approval when using the accelerated procedure" },
  vacation: { label: "Federal Leave Act · Section 3", url: "https://www.gesetze-im-internet.de/burlg/__3.html", scope: "24 working days for a six-day week; equivalent to 20 for a five-day week" },
  notice: { label: "Civil Code · Section 622", url: "https://www.gesetze-im-internet.de/bgb/__622.html", scope: "Notice periods, agreed probation and exceptions" },
  educationLeave: { label: "Berlin · Bildungszeit", url: "https://www.berlin.de/sen/arbeit/weiterbildung/bildungszeit/", scope: "Paid education leave in Berlin; other federal states have their own rules" },
  housing: { label: "Make it in Germany · Housing and registration", url: "https://www.make-it-in-germany.com/en/living-in-germany/housing-mobility/housing-registration", scope: "Rental application documents and local registration preparation" },
  registration: { label: "Federal Registration Act · Section 17", url: "https://www.gesetze-im-internet.de/bmg/__17.html", scope: "Registration after moving into a dwelling" },
  housingConfirmation: { label: "Federal Registration Act · Section 19", url: "https://www.gesetze-im-internet.de/bmg/__19.html", scope: "Housing provider's move-in confirmation" },
  healthInsurance: { label: "Make it in Germany · Health insurance", url: "https://www.make-it-in-germany.com/en/living-in-germany/money-insurance/health-insurance", scope: "Continuous coverage, statutory/private insurance and individual eligibility" },
  liability: { label: "Make it in Germany · Additional insurance", url: "https://www.make-it-in-germany.com/en/living-in-germany/money-insurance/additional", scope: "Voluntary personal liability insurance" },
  legalInsurance: { label: "BaFin · Insurance explained", url: "https://www.bafin.de/SharedDocs/Downloads/DE/Broschuere/dl_b_versicherungen_leichte_sprache.pdf?__blob=publicationFile&v=6", scope: "Optional legal expenses insurance and other insurance types" },
  taxId: { label: "BZSt · Obtain your Tax ID", url: "https://online.portal.bzst.de/SharedDocs/Leistungsbeschreibung/EN/erneute_mitteilung_der_ID-Nr.html", scope: "Tax identification number assigned on first registration and recovery of an existing number" },
  taxes: { label: "Federal Finance Ministry · An ABC of Taxes", url: "https://www.bundesfinanzministerium.de/Content/EN/Standardartikel/Press_Room/Publications/Brochures/abc-of-taxes.pdf?__blob=publicationFile&v=3", scope: "Income tax, employment expenses and church tax" },
  training: { label: "Federal Employment Agency · Training support", url: "https://www.arbeitsagentur.de/karriere-und-weiterbildung/foerderung-berufliche-weiterbildung/foerderung-beschaeftigte", scope: "Conditional continuing-education support in cooperation with an employer" },
  recognitionFunding: { label: "Recognition in Germany · Financial support", url: "https://www.anerkennung-in-deutschland.de/html/en/pro/financial-support.php", scope: "Recognition funding depending on residence, income and programme requirements" },
  blueCard: { label: "Make it in Germany · EU Blue Card", url: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card", scope: "2026 standard salary, academic qualification, job match and minimum contract period" },
  skilled: { label: "Make it in Germany · Qualified professionals", url: "https://www.make-it-in-germany.com/en/visa-residence/types/work-qualified-professionals", scope: "Recognised qualifications, qualified employment, licensing and age-related requirements" },
  freeMovement: { label: "Federal Foreign Office · EU citizens", url: "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/04-eubuergerarbeitsmoeglichkeiten/606668", scope: "EU employment and local registration" },
  entry: { label: "Make it in Germany · Entry and visa procedure", url: "https://www.make-it-in-germany.com/en/visa-residence/apply-for-visa", scope: "EU/EFTA access, country-dependent entry process, mission checklists and insurance" },
  swiss: { label: "Service Berlin · Swiss residence documentation", url: "https://service.berlin.de/dienstleistung/324287/", scope: "Swiss-specific residence notification; Berlin procedure is a local example" },
  recognition: { label: "Make it in Germany · Academic qualifications", url: "https://www.make-it-in-germany.com/en/working-in-germany/recognition/foreign-academic-qualifications", scope: "Anabin evidence or ZAB comparability for foreign degrees" },
  recognitionFinder: { label: "Recognition in Germany · Recognition Finder", url: "https://www.anerkennung-in-deutschland.de/en/finder", scope: "Identify the relevant recognition authority and regulated profession" },
  blueChecklist: { label: "Federal Government · Blue Card preparation guide", url: "https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_EN/Visum_Blaue_Karte_EN.pdf", scope: "Passport, qualification, employment, insurance; mission-specific checklist remains necessary" },
  declaration: { label: "Federal Employment Agency · Declaration of Employment", url: "https://www.arbeitsagentur.de/datei/erklaerung-zum-beschaeftigungsverhaeltnis_ba047549.pdf", scope: "Employer-completed form; check whether the responsible mission requests it" },
} as const;
export type SourceKey = keyof typeof officialSources;
export const euEeaCountries: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", HR: "Croatia", CY: "Cyprus", CZ: "Czechia", DK: "Denmark", EE: "Estonia", FI: "Finland", FR: "France", DE: "Germany", GR: "Greece", HU: "Hungary", IE: "Ireland", IT: "Italy", LV: "Latvia", LT: "Lithuania", LU: "Luxembourg", MT: "Malta", NL: "Netherlands", PL: "Poland", PT: "Portugal", RO: "Romania", SK: "Slovakia", SI: "Slovenia", ES: "Spain", SE: "Sweden", IS: "Iceland", LI: "Liechtenstein", NO: "Norway",
};
export const nationalityOptions = { ...euEeaCountries, CH: "Switzerland", IN: "India", US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia", BR: "Brazil", CN: "China", EG: "Egypt", ID: "Indonesia", IR: "Iran", JP: "Japan", KE: "Kenya", KR: "South Korea", MX: "Mexico", NG: "Nigeria", NZ: "New Zealand", PK: "Pakistan", PH: "Philippines", TR: "Türkiye", UA: "Ukraine", ZA: "South Africa", OTHER: "Another non-EU/EEA/Swiss nationality", UNKNOWN: "Not sure / multiple nationalities to check" };
