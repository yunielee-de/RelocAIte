import type { JourneyProfile } from "./journey-profile";

export const documentCatalog = {
  employment: { label: "Employment contract", phases: [1, 2, 3] },
  identity: { label: "Passport / national ID", phases: [2, 3] },
  qualification: { label: "Degree / qualification certificate", phases: [2, 5] },
  recognition: { label: "Recognition / anabin evidence", phases: [2, 5] },
  insurance: { label: "Health insurance evidence", phases: [2, 4] },
  declaration: { label: "Erklärung zum Beschäftigungsverhältnis", phases: [2] },
  photo: { label: "Biometric photo", phases: [2] },
  "route-declarations": { label: "Route-specific declarations", phases: [2] },
  "fast-track": { label: "Fast-track authorisation / preliminary approval", phases: [2] },
  accommodation: { label: "Accommodation evidence / rental agreement", phases: [2, 3] },
  licence: { label: "Professional licence", phases: [2] },
  income: { label: "Proof of income", phases: [3] },
  schufa: { label: "SCHUFA credit report", phases: [3] },
  "previous-rent": { label: "Previous-rent evidence", phases: [3] },
  "housing-confirmation": { label: "Wohnungsgeberbestätigung", phases: [3] },
  anmeldung: { label: "Anmeldung confirmation", phases: [3, 4] },
  "tax-id": { label: "Tax ID letter", phases: [4] },
  expenses: { label: "Relocation / work expense records", phases: [4, 5] },
} as const;
export type DocumentType = keyof typeof documentCatalog;
export type VaultDocument = {
  id: string;
  type: DocumentType;
  filename: string | null;
  dateAdded: string | null;
  updatedAt: string | null;
  status: "available" | "needs-update";
  source: "demo" | "user-file" | "self-reported";
  phases: number[];
};
export function vaultDocument(profile: JourneyProfile, type: DocumentType) {
  return profile.documents.find(document => document.type === type);
}
export function documentAvailable(profile: JourneyProfile, type: DocumentType) {
  return vaultDocument(profile, type)?.status === "available";
}
export function recordDocument(profile: JourneyProfile, type: DocumentType, filename: string | null, source: VaultDocument["source"] = "user-file", now = new Date().toISOString()): JourneyProfile {
  const previous = vaultDocument(profile, type);
  const document: VaultDocument = {
    id: previous?.id ?? `document-${type}`, type, filename: filename?.slice(0, 255) || null,
    dateAdded: previous?.dateAdded ?? now, updatedAt: now, status: "available", source,
    phases: [...documentCatalog[type].phases],
  };
  return { ...profile, documents: [...profile.documents.filter(item => item.type !== type), document] };
}
export function setDocumentStatus(profile: JourneyProfile, type: DocumentType, status: VaultDocument["status"]): JourneyProfile {
  return { ...profile, documents: profile.documents.map(item => item.type === type ? { ...item, status } : item) };
}
export function documentFileError(file: Pick<File, "name" | "size">): string | null {
  if (file.size > 20 * 1024 * 1024) return "Choose a file smaller than 20 MB.";
  if (!/\.(pdf|png|jpe?g)$/i.test(file.name)) return "Choose a PDF, JPG or PNG file.";
  return null;
}
// v1 knew filenames only for contracts. Keep old self-reported readiness without inventing filenames or dates.
export function migrateDocuments(profile: JourneyProfile): VaultDocument[] {
  const documents: VaultDocument[] = [];
  for (const type of Object.keys(documentCatalog) as DocumentType[]) {
    const contract = type === "employment" ? profile.contractDocument : null;
    if (!contract && !profile.documentsReady[type]) continue;
    documents.push({ id: `document-${type}`, type, filename: contract?.name ?? null, dateAdded: null, updatedAt: null,
      status: "available", source: contract ? contract.kind === "demo" ? "demo" : "user-file" : "self-reported", phases: [...documentCatalog[type].phases] });
  }
  return documents;
}
