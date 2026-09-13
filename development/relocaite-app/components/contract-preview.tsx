"use client";

import Image from "next/image";
import { ExternalLink, FileText, Link2 } from "lucide-react";
import { demoEmployment } from "@/lib/demo-contract";
import { demoSourceValues, type ContractFinding, type FindingId } from "@/lib/contract-review";
import type { JourneyProfile } from "@/lib/journey-profile";

export type LocalContractPreview = { url: string; mimeType: "application/pdf" | "image/png" | "image/jpeg"; filename: string };
export function ContractPreview({ profile, findings, selected, onSelect, localPreview, onReopen, original, onOriginal }: {
  profile: JourneyProfile; findings: ContractFinding[]; selected: FindingId; onSelect: (id: FindingId) => void; localPreview: LocalContractPreview | null; onReopen: () => void;
  original: boolean; onOriginal: (original: boolean) => void;
}) {
  const demo = profile.contractDocument?.kind === "demo";
  const sourceUrl = demo ? "/demo-employment-contract.pdf" : localPreview?.url;
  return <section className="panel contract-paper-panel" aria-label="Contract document preview">
    <header className="contract-paper-header"><FileText size={19} /><div><strong>{profile.contractDocument?.name || "Your employment information"}</strong><p>{demo ? "Existing demo contract · fictional sample" : "Original stays on your device"}</p></div>{sourceUrl && <a className="text-link" href={sourceUrl} target="_blank" rel="noreferrer" aria-label="Open original contract in a new tab"><ExternalLink size={16} /></a>}</header>
    {demo && <div className="preview-switch" aria-label="Document preview mode"><button aria-pressed={!original} onClick={() => onOriginal(false)}><Link2 size={14} /> Linked excerpts</button><button aria-pressed={original} onClick={() => onOriginal(true)}>Original PDF</button></div>}
    {demo && !original ? <div className="contract-paper-scroll"><article className="contract-paper"><p className="paper-caption">FICTIONAL SAMPLE · SELECTED CLAUSES</p><h2>Arbeitsvertrag</h2><p className="paper-intro">{demoEmployment.employer[0]}<br />{demoEmployment.jobTitle[0]} · {demoEmployment.workLocation[0]}</p><p className="paper-help">Select a highlighted value to review its finding. These excerpts retain the source values when you make corrections.</p>
      {findings.map((finding, index) => {
        const absent = finding.id === "visa-support";
        const evidence = [...new Set(finding.keys.map(key => demoEmployment[key][1]))].join(" ");
        return <section className={absent ? "paper-review-note" : "paper-clause"} key={finding.id}><h3>{absent ? "Review note · not a contract clause" : finding.title}</h3><p><button id={`source-${finding.id}`} className={`contract-highlight ${finding.status === "Confirmed" ? "good" : finding.status === "Missing" ? "missing" : "caution"} ${selected === finding.id ? "selected" : ""}`} onClick={() => onSelect(finding.id)} aria-label={`View finding: ${finding.title}`} aria-controls={`finding-${finding.id}`} aria-pressed={selected === finding.id}><mark>{absent ? "Visa support not found in the sample" : demoSourceValues(finding.id).map(field => field.value).join(" · ")}</mark><sup>{index + 1}</sup></button></p><p className="paper-evidence" lang={absent ? "en" : "de"}>{evidence}</p></section>;
      })}<p className="paper-end">End of selected excerpts · open the PDF for the full sample.</p></article></div> : sourceUrl ? <div className="original-preview">{localPreview && localPreview.mimeType !== "application/pdf" ? <Image src={localPreview.url} alt="Your selected employment contract" width={900} height={1200} unoptimized /> : <object data={sourceUrl} type="application/pdf" aria-label="Original employment contract PDF"><p>PDF preview is unavailable in this browser. <a href={sourceUrl} target="_blank" rel="noreferrer">Open the original PDF</a>.</p></object>}<p className="small-note">{demo ? "Original sample PDF. Use Linked excerpts for interactive highlights." : "Local preview only. No contents are uploaded, extracted or saved. Enter the facts in the findings alongside the document."}</p></div> : <div className="preview-unavailable"><FileText size={38} /><h3>{profile.contractDocument ? "Your file stays with you" : "Review your contract alongside these fields"}</h3><p>{profile.contractDocument ? "The Vault remembers the filename, but not the file contents. Select the same file again to preview it here. Your saved facts will stay in place." : "Enter the information from your offer in the findings. You can also select a file to see a local preview."}</p>{profile.contractDocument && <button className="text-link" onClick={onReopen}>Choose file for preview <ExternalLink size={14} /></button>}</div>}
  </section>;
}
