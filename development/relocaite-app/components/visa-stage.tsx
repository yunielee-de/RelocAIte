"use client";

import { ArrowLeft, ArrowRight, Check, CircleHelp, Download, ExternalLink, FileCheck2, Info, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { confirmQualification, editField, emptyField, fieldValue, invalidateAssessment, salaryLabel, type JourneyProfile, type QualificationKey } from "@/lib/journey-profile";
import { loadDemoBackground } from "@/lib/demo-contract";
import { DocumentControl } from "./document-vault";
import { documentAvailable, vaultDocument } from "@/lib/document-vault";
import { applicationKeys, type ApplicationRequirement } from "@/lib/journey-profile";
import { euEeaCountries, mvpRules, nationalityOptions, officialSources } from "@/lib/mvp-visa-rules";
import { checklistText, nextAction, routeChecklist, type VisaAssessment } from "@/lib/visa-assessment";

const yesNo: [string, string][] = [["yes", "Yes"], ["no", "No"], ["unknown", "Not sure yet"]];
const questionDefinitions: { key: QualificationKey; label: string; options?: [string, string][]; note?: string }[] = [
  { key: "nationality", label: "Nationality used for this move", options: Object.entries(nationalityOptions).sort((a, b) => a[1].localeCompare(b[1])), note: "If you have more than one, check whether an EU/EEA or Swiss nationality applies." },
  { key: "highestQualification", label: "Highest qualification", note: "For example: BSc Computer Science or a vocational training certificate." },
  { key: "qualificationType", label: "Qualification type", options: [["academic", "University / academic degree"], ["vocational", "Qualified vocational training"], ["other", "Other / experience only"], ["unknown", "Not sure yet"]] },
  { key: "qualificationCountry", label: "Country where you obtained it" },
  { key: "profession", label: "Profession / field", note: "Clarify the professional field behind your job title; your contract title is already known." },
  { key: "recognitionStatus", label: "Recognition / comparability in Germany", options: [["recognised", "Recognition / comparability confirmed"], ["german-qualification", "Qualification obtained in Germany"], ["pending", "Application in progress"], ["not-recognised", "Not recognised / partial result"], ["unknown", "Not checked / not sure"]], note: "A reported result still needs supporting evidence. Ticking a checklist item does not verify recognition." },
  { key: "qualifiedJob", label: "Does the job require a degree or qualified vocational training?", options: yesNo },
  { key: "degreeMatchesJob", label: "Does your academic qualification match the job?", options: yesNo, note: "Used for the standard academic Blue Card check." },
  { key: "regulatedProfession", label: "Is your profession regulated in Germany?", options: yesNo, note: "For example, some healthcare professions require permission to practise. Choose “not sure” if you have not checked." },
  { key: "practiceLicence", label: "Do you have the required German professional licence?", options: yesNo },
  { key: "ageBand", label: "Your age when starting this employment", options: [["under45", "Under 45"], ["45plus", "45 or older"], ["unknown", "Prefer to verify separately"]], note: "Used to flag additional skilled-worker requirements for individual review." },
];
export function VisaStage({ profile, assessment, onChange, onAssess, busy, error, onBack, onContract, onDocuments }: {
  profile: JourneyProfile; assessment: VisaAssessment; onChange: (profile: JourneyProfile) => void; onAssess: (profile: JourneyProfile) => Promise<void>; busy: boolean; error: string; onBack: () => void; onContract: () => void; onDocuments: () => void;
}) {
  const [editing, setEditing] = useState(!profile.visaReviewed);
  const [showKnown, setShowKnown] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");
  const nationality = profile.qualification.nationality.value;
  const free = Object.hasOwn(euEeaCountries, nationality) || nationality === "CH";
  const questions = questionDefinitions.filter(question => {
    if (free && !["nationality", "regulatedProfession", "practiceLicence", "profession"].includes(question.key)) return false;
    if (question.key === "practiceLicence" && profile.qualification.regulatedProfession.value !== "yes") return false;
    if (question.key === "degreeMatchesJob" && profile.qualification.qualificationType.value !== "academic") return false;
    return true;
  });
  const known = questions.filter(question => fieldValue(profile.qualification[question.key]) && !["unknown", "UNKNOWN"].includes(fieldValue(profile.qualification[question.key])));
  const visible = questions.filter(question => showKnown || !known.includes(question));
  const selected = assessment.routes.find(route => route.id === profile.selectedRoute) || assessment.routes[0];
  const checklist = selected ? routeChecklist(profile, selected) : [];
  const action = selected ? nextAction(profile, selected) : null;
  function change(key: QualificationKey, value: string) {
    const qualification = { ...profile.qualification, [key]: editField(profile.qualification[key], value) };
    if (["highestQualification", "qualificationCountry", "qualificationType"].includes(key)) qualification.recognitionStatus = emptyField();
    if (["profession", "highestQualification", "qualificationType"].includes(key)) qualification.degreeMatchesJob = emptyField();
    if (key === "regulatedProfession") qualification.practiceLicence = emptyField();
    onChange({ ...invalidateAssessment(profile), qualification });
  }
  function download() {
    if (!selected) return;
    const url = URL.createObjectURL(new Blob([checklistText(profile, selected)], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "RelocAIte-preparation-checklist.txt"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <>
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Your journey</button>
    <div className="page-heading"><div><p className="eyebrow">STAGE 2 OF 5</p><h1>Step 2: Visa Application</h1><p>We already know your offer. Let’s fill in only what’s missing.</p></div><span className="pill blue"><FileCheck2 size={15} /> Visa Application</span></div>
    <section className="panel carried-facts"><span className="carried-icon"><Check /></span><div><h2>Carried forward from your contract</h2><p>{fieldValue(profile.employment.employer) || "Employer unconfirmed"} <span>·</span> {fieldValue(profile.employment.jobTitle) || "Job unconfirmed"} <span>·</span> {fieldValue(profile.employment.workLocation) || "Location unconfirmed"}</p><strong>{salaryLabel(profile)}</strong></div><Button variant="outline" onClick={onContract}>Review contract</Button></section>
    {documentAvailable(profile, "employment") && <div className="contract-reuse"><Check size={17} /><strong>Employment contract ✓ Already provided</strong><span>{vaultDocument(profile, "employment")?.source === "demo" ? "Fictional sample · not application evidence" : "Metadata carried forward · keep the original"}</span><button className="text-link" onClick={onDocuments}>View in Document Vault <ArrowRight size={14} /></button></div>}
    {(editing || !profile.visaReviewed) && <section className="panel form-panel"><div className="section-row"><div><h2>A few details about you</h2><p className="section-description">Not sure? Say so. We’ll turn uncertainty into a next step.</p></div><Button variant="outline" disabled={busy} onClick={() => { onChange(loadDemoBackground(profile)); setShowKnown(true); }}>Use example background</Button></div>
      <p className="small-note">“Use example background” fills fictional information for an Indian software professional. Review it before continuing.</p>
      {known.length > 0 && <div className="known-facts"><p><Check size={16} /> {known.length} answers already confirmed. You don’t need to enter them again.</p><Button variant="link" onClick={() => setShowKnown(!showKnown)}>{showKnown ? "Hide confirmed answers" : "Review or edit confirmed answers"}</Button></div>}
      <div className="form-grid">{visible.map(question => {
        const field = profile.qualification[question.key];
        return <label className="form-field" key={question.key}><span>{question.label}</span>{question.options ? <select className="journey-select" value={field.value} onChange={event => change(question.key, event.target.value)}><option value="">Select an answer</option>{question.options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select> : <Input maxLength={2000} value={field.value} onChange={event => change(question.key, event.target.value)} />}{question.note && <small>{question.note}</small>}{field.origin === "demo-profile" && <small className="field-origin">Example background · review this answer</small>}</label>;
      })}</div>
      {free && <div className="notice"><Info size={18} /><p>Your selected nationality points to a free-movement pathway. We’ll skip the Blue Card salary and qualification questions; professional licensing can still matter.</p></div>}
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="form-actions"><p>Only confirmed information is used. Unknowns remain visible.</p><Button disabled={busy || !profile.qualification.nationality.value} onClick={async () => { await onAssess(confirmQualification(profile)); setEditing(false); }}>{busy ? <RefreshCw className="animate-spin" /> : null}{busy ? "Checking your preparation" : "Show my potential route"}<ArrowRight /></Button></div>
    </section>}
    {profile.visaReviewed && !editing && <>
      <div className="section-row result-heading"><div><p className="eyebrow">BASED ON YOUR CONFIRMED INFORMATION</p><h2>Your potential routes</h2></div><Button variant="outline" onClick={() => setEditing(true)}>Edit qualification details</Button></div>
      <p className="result-notice">{assessment.notice}</p>
      {assessment.routes.length === 0 && <section className="panel empty-panel"><CircleHelp size={32} /><h2>We need a little more context</h2><p>Confirm a nationality used for this move. We won’t infer it from your name, employer or qualification.</p><Button onClick={() => setEditing(true)}>Review nationality <ArrowRight /></Button></section>}
      <div className="route-grid">{assessment.routes.map(route => <article key={route.id} className={`panel route-card ${selected?.id === route.id ? "selected" : ""}`}><div className="section-row"><span className={`pill ${route.status === "potential" ? "green" : "amber"}`}>Potential route · {route.status === "potential" ? "Initial checks met" : route.status === "verify" ? "Needs verification" : "Separate review needed"}</span>{selected?.id === route.id && <span className="selected-dot" aria-label="Selected pathway" />}</div><h3>{route.title}</h3><p>{route.summary}</p><h4>Why it may fit</h4><ul className="requirement-list satisfied">{route.satisfied.length ? route.satisfied.map(text => <li key={text}><Check size={16} /><span>{text}</span></li>) : <li><CircleHelp size={16} /><span>More confirmed information is needed.</span></li>}</ul><h4>Still needs verification</h4><ul className="requirement-list">{route.missing.length ? route.missing.map(item => <li key={item.id}><CircleHelp size={16} /><span>{item.text}</span></li>) : <li><Info size={16} /><span>These initial checks appear satisfied from your answers. The authority must verify evidence and remaining admission conditions.</span></li>}</ul>{route.notes.map(note => <p className="small-note" key={note}>{note}</p>)}<div className="source-links">{route.sources.map(key => <a key={key} href={officialSources[key].url} target="_blank" rel="noreferrer">{officialSources[key].label}<ExternalLink size={13} /></a>)}</div><Button variant={selected?.id === route.id ? "secondary" : "outline"} onClick={() => onChange({ ...profile, selectedRoute: route.id })}>{selected?.id === route.id ? "Viewing this checklist" : "View preparation checklist"}<ArrowRight /></Button></article>)}</div>
      {selected && !["eu-eea", "swiss"].includes(selected.id) && <section className="panel form-panel application-context">
        <h2>Tailor your application checklist</h2><p className="section-description">Check the responsible mission’s instructions. These are document requirements for your application, not additional eligibility findings. Unknown means “check applicability”; it does not mean universally required.</p>
        <div className="form-grid">{applicationKeys.map(key => <label className="form-field" key={key}><span>{{ employmentDeclaration: "Employer Declaration of Employment", biometricPhoto: "Biometric photo", routeDeclarations: "Route-specific declarations", accommodationEvidence: "Accommodation evidence" }[key]}</span><select className="journey-select" value={profile.application[key]} onChange={event => onChange({ ...profile, application: { ...profile.application, [key]: event.target.value as ApplicationRequirement } })}><option value="unknown">Not checked with mission yet</option><option value="required">Requested for my application</option><option value="not-required">Mission confirmed not required</option></select></label>)}</div>
        <label className="fast-track-choice"><Checkbox checked={profile.application.fastTrack} onCheckedChange={checked => onChange({ ...profile, application: { ...profile.application, fastTrack: checked === true } })} /><span>My employer and I are using the accelerated skilled-worker procedure (fast-track).</span></label>
        <a className="text-link" href={officialSources.entry.url} target="_blank" rel="noreferrer">Check the official application process <ExternalLink size={14} /></a>
      </section>}
      {selected && <section className="panel checklist-panel"><div className="section-row"><div><p className="eyebrow">YOUR PREPARATION CHECKLIST</p><h2>Know what’s ready. See what’s missing.</h2><p className="section-description">For {selected.title.toLowerCase()} · {checklist.filter(item => item.ready).length} of {checklist.length} items ready</p></div><Button variant="outline" onClick={download}><Download size={16} /> Download checklist</Button></div><p className="small-note">Document availability is reported by you. Only metadata persists; keep your original files. Requirements depend on your case and mission. This is not a complete official application checklist.</p><div className="checklist-items">{checklist.map(item => <div className={`checklist-item ${item.ready ? "ready" : ""}`} key={item.id}><Checkbox id={`doc-${item.id}`} checked={item.ready} disabled={item.automatic} onCheckedChange={checked => onChange({ ...profile, documentsReady: { ...profile.documentsReady, [item.id]: checked === true } })} /><div><label htmlFor={`doc-${item.id}`}>{item.label}</label>{item.availability && <span className="availability-label">{item.availability === "provided" ? "✓ Already provided" : "Reported ready"}</span>}<p>{item.detail}</p><a className="text-link" href={officialSources[item.source].url} target="_blank" rel="noreferrer">Official source <ExternalLink size={12} /></a>{item.documentType && <DocumentControl profile={profile} type={item.documentType} onChange={onChange} onContract={onContract} />}</div><span className={`pill ${item.ready ? "green" : "neutral"}`}>{item.needsApplicability ? "Check applicability" : item.ready ? item.documentType ? "In Document Vault" : item.automatic ? "From profile" : "Reviewed" : "To prepare"}</span></div>)}</div><div className="button-row"><Button variant="outline" onClick={onDocuments}>Open Document Vault <ArrowRight size={15} /></Button><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(checklistText(profile, selected)); setCopyNotice("Checklist copied."); } catch { setCopyNotice("Clipboard unavailable. Use Download checklist instead."); } }}>Copy checklist</Button><span role="status" className="small-note">{copyNotice}</span></div></section>}
      {selected && !["eu-eea", "swiss"].includes(selected.id) && <section className="panel form-panel visa-timeline"><h2>If a national D visa is required</h2><p className="section-description">Entry requirements depend on nationality, residence and circumstances. Confirm the responsible mission’s process; review and appointments can overlap or occur in a different order.</p><ol>{["Prepare & submit application", "Authority / mission review", "Appointment / biometrics when required", "Visa decision / issuance", "Travel + later residence-permit steps"].map((step, index) => <li key={step}><span>{index + 1}</span><strong>{step}</strong></li>)}</ol><p>Budget approximately €{mvpRules.adultNationalVisaFeeEur} for an adult national visa application. Exemptions or reductions can apply; other procedure fees may be separate. Processing times vary and are not guaranteed.</p><a className="text-link" href={officialSources.visaFees.url} target="_blank" rel="noreferrer">Official visa procedure & fees <ExternalLink size={14} /></a></section>}
      {action && <section className="next-action-banner final-action"><span className="action-icon"><ArrowRight size={25} /></span><div><p className="eyebrow">ONE CLEAR NEXT ACTION</p><h2>{action.title}</h2><p>{action.detail}</p></div>{action.destination ? <Button onClick={() => action.destination === "contract" ? onContract() : setEditing(true)}>Review information <ArrowRight /></Button> : <Button asChild><a href={action.href} target="_blank" rel="noreferrer">Open official guidance <ExternalLink size={16} /></a></Button>}</section>}
      <p className="small-note source-date">Official-source snapshot reviewed {mvpRules.reviewedAt} · applies to 2026 · {mvpRules.version}. {mvpRules.scope}</p>
    </>}
  </>;
}
