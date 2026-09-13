"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, Check, ExternalLink, FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { documentAvailable, documentCatalog, documentFileError, recordDocument, setDocumentStatus, vaultDocument, type DocumentType } from "@/lib/document-vault";
import type { JourneyProfile } from "@/lib/journey-profile";
import { journeyStages } from "@/lib/journey-stages";
import type { ChecklistItem } from "@/lib/visa-assessment";

export function DocumentControl({ profile, type, onChange, onContract }: { profile: JourneyProfile; type: DocumentType; onChange: (profile: JourneyProfile) => void; onContract: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [error, setError] = useState("");
  const document = vaultDocument(profile, type);
  return <div className="document-controls">
    <input id={inputId} ref={input} type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg" aria-label={`Record ${documentCatalog[type].label}`} onChange={event => {
      const file = event.target.files?.[0]; event.target.value = "";
      if (!file) return;
      const error = documentFileError(file); setError(error || "");
      if (!error) onChange(recordDocument(profile, type, file.name));
    }} />
    <Button variant="outline" size="sm" onClick={() => type === "employment" ? onContract() : input.current?.click()}><UploadCloud size={14} />{document ? "Replace / update" : "Add document"}</Button>
    {type !== "employment" && !documentAvailable(profile, type) && <Button variant="ghost" size="sm" onClick={() => onChange(document ? setDocumentStatus(profile, type, "available") : recordDocument(profile, type, null, "self-reported"))}>I have this document</Button>}
    {type !== "employment" && documentAvailable(profile, type) && <button className="text-link" onClick={() => onChange(setDocumentStatus(profile, type, "needs-update"))}>Needs update</button>}
    {error && <p role="alert" className="document-error">{error}</p>}
  </div>;
}
export function DocumentVault({ profile, checklist, onChange, onContract, onVisa }: { profile: JourneyProfile; checklist: ChecklistItem[]; onChange: (profile: JourneyProfile) => void; onContract: () => void; onVisa: () => void }) {
  const [type, setType] = useState<DocumentType>("employment");
  const missing = checklist.filter(item => item.documentType && !item.ready);
  return <>
    <div className="page-heading"><div><p className="eyebrow">ONE PROFILE · EVERY STAGE</p><h1>Your Document Vault</h1><p>Add a document once. Reuse its record throughout your journey.</p></div><span className="pill blue"><FileText size={15} />{profile.documents.length} records</span></div>
    <div className="notice"><FileText size={18} /><p>This browser saves filenames, dates and status only. File contents are not uploaded or stored. Keep the originals on your device; “Already provided” means a record is available, not that an authority has verified it.</p></div>
    <section className="panel form-panel"><h2>Add to your journey</h2><div className="vault-add"><label className="form-field"><span>Document type</span><select className="journey-select" value={type} onChange={event => setType(event.target.value as DocumentType)}>{Object.entries(documentCatalog).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label><DocumentControl key={type} profile={profile} type={type} onChange={onChange} onContract={onContract} /></div></section>
    <section className="panel form-panel"><h2>Available documents & updates</h2>{profile.documents.length === 0 && <p className="section-description">No documents recorded yet. Start with your employment contract or add a record above.</p>}
      {profile.documents.map(document => <article className="vault-record" key={document.id} data-document-type={document.type}>
        <div className="section-row"><h3>{documentCatalog[document.type].label}</h3><span className={`pill ${document.status === "available" ? "green" : "amber"}`}>{document.status === "needs-update" ? "Needs update" : document.filename ? <><Check size={14} />Already provided</> : "Reported ready"}</span></div>
        <p className="vault-filename">{document.filename || "You reported that you have this document; no file selected."}</p>
        <p className="small-note">{document.source === "demo" ? "Fictional sample · not application evidence" : document.source === "self-reported" ? "Self-reported availability" : "File metadata only · original stays on your device"} · Added {document.dateAdded ? new Date(document.dateAdded).toLocaleDateString("en-GB") : "before this upgrade (date unknown)"}{document.updatedAt && document.updatedAt !== document.dateAdded ? ` · Updated ${new Date(document.updatedAt).toLocaleDateString("en-GB")}` : ""}</p>
        <p className="vault-usage">Used in: {document.phases.map(phase => `${phase}. ${journeyStages[phase - 1].title}`).join(" · ")}{document.type === "accommodation" ? " (Step 2 only if requested)" : ""}</p>
        <DocumentControl profile={profile} type={document.type} onChange={onChange} onContract={onContract} />
        {document.source === "demo" && document.type === "employment" && <a className="text-link" href="/demo-employment-contract.pdf" target="_blank" rel="noreferrer">Open sample PDF <ExternalLink size={14} /></a>}
      </article>)}
    </section>
    <section className="panel form-panel"><h2>Missing or still to check for your potential route</h2>{missing.length ? <div className="document-list">{missing.map(item => <div key={item.id}><FileText size={17} /><span>{item.label}</span><span className="pill amber">{item.needsApplicability ? "Check applicability" : "To prepare"}</span></div>)}</div> : <p className="section-description">{checklist.length ? "Document records are ready for this preparation list. The responsible authority still verifies the evidence." : "Complete the visa check to see the documents relevant to your potential route."}</p>}<Button variant="outline" onClick={onVisa}>View personalized checklist <ArrowRight /></Button></section>
  </>;
}
