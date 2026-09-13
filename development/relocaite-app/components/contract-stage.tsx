"use client";

import { ArrowLeft, ArrowRight, Check, ChevronDown, Download, FileText, Info, Link2, UploadCloud } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyContractExtraction, parseContractExtraction } from "@/lib/contract-extraction";
import { confirmEmployment, employmentErrors, updateEmployment, type JourneyProfile, type ProfileField } from "@/lib/journey-profile";
import { loadDemoContract, manualContract } from "@/lib/demo-contract";
import { documentFileError } from "@/lib/document-vault";
import { contractFields, contractFindings, employerRequest, type FindingId, type ReviewStatus } from "@/lib/contract-review";
import type { VisaAssessment } from "@/lib/visa-assessment";
import { ContractInsights } from "./contract-insights";
import { ContractPreview, type LocalContractPreview } from "./contract-preview";
import { JourneyOverview } from "./journey-overview";

const statusClass: Record<ReviewStatus, string> = { Confirmed: "good", "Worth checking": "caution", Missing: "missing" };
function extractionError(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const error = (input as { error?: unknown }).error;
  return typeof error === "string" ? error : null;
}
function fieldOrigin(field: ProfileField): string {
  const source = field.origin === "demo-contract" ? "sample contract" : "uploaded contract";
  return field.value === field.extractedValue ? `Extracted from the ${source}` : `Extracted ${source} value: ${field.extractedValue}`;
}
export function ContractStage({ profile, assessment, onChange, onContinue, onBack }: { profile: JourneyProfile; assessment: VisaAssessment; onChange: (profile: JourneyProfile) => void; onContinue: () => void; onBack: () => void }) {
  const fileInputId = useId();
  const reopenRef = useRef<HTMLInputElement>(null);
  const extractionRequest = useRef(0);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [choosing, setChoosing] = useState(false);
  const [manualStarted, setManualStarted] = useState(false);
  const [selected, setSelected] = useState<FindingId>("salary");
  const [localPreview, setLocalPreview] = useState<LocalContractPreview | null>(null);
  const [original, setOriginal] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const started = manualStarted || !!profile.contractDocument || Object.values(profile.employment).some(field => field.value);
  const findings = contractFindings(profile);
  const errors = employmentErrors(profile);
  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview.url); }, [localPreview]);

  function focusLinked(id: FindingId, target: "source" | "finding") {
    setSelected(id);
    if (target === "source") setOriginal(false);
    requestAnimationFrame(() => {
      const element = document.getElementById(`${target}-${id}`);
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest" });
    });
  }
  function previewFile(file: File) {
    const mimeType = /\.pdf$/i.test(file.name) ? "application/pdf" : /\.png$/i.test(file.name) ? "image/png" : "image/jpeg";
    setLocalPreview({ url: URL.createObjectURL(new Blob([file], { type: mimeType })), mimeType, filename: file.name });
    setOriginal(true);
  }
  function chooseManual() {
    extractionRequest.current += 1; setExtracting(false);
    setLocalPreview(null);
    onChange(manualContract(profile));
    setManualStarted(true); setChoosing(false); setDraft(null); setCopyStatus(""); setSelected("role");
    setNotice("Enter the facts you know. Uncertain or blank fields remain visible as missing.");
  }
  async function extractContract(file: File) {
    const error = documentFileError(file);
    if (error) { setNotice(error); return; }
    const requestId = ++extractionRequest.current;
    previewFile(file);
    const clearedProfile = manualContract(profile, file.name);
    onChange(clearedProfile);
    setManualStarted(true); setChoosing(false); setDraft(null); setCopyStatus(""); setSelected("role"); setExtracting(true);
    setNotice(`Reading “${file.name}”… Keep this page open while the contract is analyzed.`);
    const form = new FormData();
    form.append("contract", file);
    try {
      const response = await fetch("/api/extract-contract", { method: "POST", body: form });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(extractionError(result) || "Contract extraction failed. Try again or enter the terms manually.");
      const extraction = parseContractExtraction(result);
      if (requestId !== extractionRequest.current) return;
      onChange(applyContractExtraction(clearedProfile, extraction));
      const extractedCount = Object.values(extraction.fields).filter(field => field.value).length;
      const warning = extraction.warnings[0] ? ` Check manually: ${extraction.warnings[0]}` : "";
      setNotice(`${extractedCount} contract fields were extracted from “${file.name}”. Review every value before confirming.${warning}`);
    } catch (caught) {
      if (requestId !== extractionRequest.current) return;
      setNotice(caught instanceof Error ? caught.message : "Contract extraction failed. Try again or enter the terms manually.");
    } finally {
      if (requestId === extractionRequest.current) setExtracting(false);
    }
  }
  function useDemo() {
    extractionRequest.current += 1; setExtracting(false);
    setLocalPreview(null); setOriginal(false); onChange(loadDemoContract(profile));
    setChoosing(false); setManualStarted(true); setSelected("salary"); setDraft(null); setCopyStatus("");
    setNotice("Demo mode: the linked excerpts and prepared fields come from the existing fictional sample. Review them before confirming.");
  }
  function confirm() {
    onChange(confirmEmployment(profile)); setNotice("Your entered information is confirmed. Any missing or unclear points remain visible.");
    requestAnimationFrame(() => document.getElementById("contract-review-title")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function replaceContract() {
    extractionRequest.current += 1; setExtracting(false); setChoosing(true);
  }
  return <div className="contract-review-screen" aria-busy={extracting}>
    <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> My Journey <span aria-hidden="true">/</span> Step 1</button>
    <JourneyOverview profile={profile} assessment={assessment}><div className="page-heading"><div><h1 id="contract-review-title">Step 1: Job Offer & Contract Review</h1><p>Contract information & readiness check</p></div></div></JourneyOverview>
    <div className="review-status-bar" aria-label="Contract findings summary">{(["Confirmed", "Worth checking", "Missing"] as const).map(status => <span className={`review-status-chip ${statusClass[status]}`} key={status}><span className="status-dot" />{status}<strong>{started ? findings.filter(finding => finding.status === status).length : 0}</strong></span>)}<span className="review-status-note">{started ? "Confirmed means reviewed by you, not legally verified." : "Findings appear when you add your contract."}</span></div>
    {notice && <div className="notice review-notice" role="status"><Info size={17} /><p>{notice}</p></div>}
    <input id={fileInputId} type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" className="sr-only" aria-label="Choose employment contract" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void extractContract(file); }} />
    <input ref={reopenRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" aria-label="Reopen employment contract preview" onChange={event => {
      const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
      const error = documentFileError(file); if (error) { setNotice(error); return; }
      if (file.name !== profile.contractDocument?.name) { setNotice("Choose the recorded file to preview it. To use a different contract, select Replace contract."); return; }
      previewFile(file); setNotice("Local preview reopened. Your confirmed facts are unchanged; the file contents are not saved.");
    }} />
    <div className="contract-workbench">
      <div className="contract-document-column"><div className="review-column-heading"><h2>Contract Analysis</h2>{started && !choosing && <button className="text-link" onClick={replaceContract}>Replace contract</button>}</div>
        {(!started || choosing) ? <section className="panel contract-upload-card" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) void extractContract(file); }}>
          <div className="contract-drop-target"><span className="large-icon"><UploadCloud size={32} /></span><h2>Upload your employment contract</h2><p>Drop a PDF here, or choose a file to analyze it.</p><Button asChild><label htmlFor={fileInputId}><UploadCloud size={16} /> Choose contract</label></Button><small>PDF, JPG or PNG · Up to 20 MB</small></div>
          <p className="small-note">The preview stays on this device. For extraction, the file is sent through the RelocAIte server to its configured AI provider and is not saved in your Journey Profile or Document Vault.</p>
          <div className="sample-contract-choice"><span className="pill amber">Fictional sample</span><h3>Try the complete journey</h3><p>Explore the existing software-engineer offer in Berlin, with linked contract excerpts and editable findings.</p><Button onClick={useDemo}>Use demo contract <ArrowRight size={16} /></Button><a className="text-link" href="/demo-employment-contract.pdf" download><Download size={14} /> View sample PDF</a></div>
          <div className="button-row"><Button variant="outline" onClick={() => { if (started) { setChoosing(false); setSelected("role"); } else chooseManual(); }}>{started ? "Review current fields" : "Enter manually"}</Button>{started && <Button variant="ghost" onClick={() => setChoosing(false)}>Keep current contract</Button>}</div>
          {choosing && <p className="small-note">Choosing a replacement resets the employment fields for review. Other profile information and Vault documents are retained.</p>}
        </section> : <ContractPreview profile={profile} findings={findings} selected={selected} onSelect={id => focusLinked(id, "finding")} localPreview={localPreview} onReopen={() => reopenRef.current?.click()} original={original} onOriginal={setOriginal} />}
      </div>
      <section className="contract-findings-column" aria-label="Findings and insights"><div className="review-column-heading"><h2>Findings & Insights</h2><span>{started ? `${findings.length} checks` : "Ready when you are"}</span></div>
        {started ? <><p className="findings-instruction">{extracting ? "Analyzing the new contract. Previous employment facts have been cleared." : "Select a finding to review or edit it. Extracted text is shown with its corresponding field when available."}</p><label className="form-field review-name"><span>What should we call you? <small>Optional</small></span><Input value={profile.name} maxLength={120} placeholder="Your first name" onChange={event => onChange({ ...profile, name: event.target.value })} /></label>
          <div className="contract-finding-list">{findings.map((finding, index) => <article key={finding.id} className={`contract-finding ${statusClass[finding.status]} ${selected === finding.id ? "selected" : ""}`} data-finding={finding.id}>
            <button id={`finding-${finding.id}`} className="finding-heading" aria-expanded={selected === finding.id} aria-controls={`finding-details-${finding.id}`} onClick={() => setSelected(finding.id)}><span className="finding-number">{index + 1}</span><span>{finding.title}</span><span className="finding-status">{finding.status}</span><ChevronDown size={15} /></button>
            <p className="finding-value">{finding.value}</p>
            <div id={`finding-details-${finding.id}`} hidden={selected !== finding.id}>
              <p className="finding-explanation">{finding.explanation}</p>
              {finding.corrected && <p className="finding-correction">Your correction differs from the sample. The source preview keeps its original values.</p>}
              {profile.contractDocument?.kind === "demo" && <button className="text-link finding-source-link" onClick={() => focusLinked(finding.id, "source")}><Link2 size={13} /> View linked excerpt</button>}
              <div className="finding-field-grid">{finding.keys.map(key => {
                const definition = contractFields[key]; const field = profile.employment[key];
                return <label className="form-field" key={key}><span>{definition.label}</span>{definition.options ? <select className="journey-select" value={field.value} onChange={event => onChange(updateEmployment(profile, key, event.target.value))}><option value="">Not provided</option>{definition.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <Input type={definition.type || "text"} min={definition.type === "number" ? 0 : undefined} step={definition.type === "number" ? "any" : undefined} value={field.value} maxLength={2000} onChange={event => onChange(updateEmployment(profile, key, event.target.value))} />}{definition.note && <small>{definition.note}</small>}{field.extractedValue !== null && <small className="field-origin">{fieldOrigin(field)}</small>}{field.origin === "contract-extraction" && field.evidence && <small className="field-origin">Source: “{field.evidence}”</small>}</label>;
              })}</div>
              <p className="finding-review-note">{finding.status === "Confirmed" ? "Information confirmed by you. Check the full contract before acting." : finding.status === "Missing" ? "Not provided, not found or not checked. Ask HR to clarify where needed." : "Review this information. Unclear terms remain worth checking after confirmation."}</p>
            </div>
          </article>)}</div>
          <details className="draft-details"><summary>Prepare a request for HR</summary><label className="form-field"><span>Edit your request before copying</span><textarea rows={9} value={draft ?? employerRequest(profile)} onChange={event => setDraft(event.target.value)} /></label><div className="button-row"><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(draft ?? employerRequest(profile)); setCopyStatus("Copied. Review and send it yourself."); } catch { setCopyStatus("Copy is unavailable. Select the text to copy it manually."); } }}>Copy request</Button><span role="status" className="small-note">{copyStatus}</span></div></details>
        </> : <section className="panel findings-empty"><FileText size={25} /><h3>Your contract, made clearer</h3><p>Employer and role, contract type, start date, pay, hours, leave, probation and notice. We’ll also help you spot administrative points to clarify with HR.</p><div className="empty-status-examples"><span className="finding-status good">Confirmed</span><span className="finding-status caution">Worth checking</span><span className="finding-status missing">Missing</span></div><p className="small-note">No facts or legal conclusions are assumed before your review.</p></section>}
        <ContractInsights profile={profile} compact />
      </section>
    </div>
    {errors.length > 0 && <div className="notice error" role="alert">{errors.join(" ")}</div>}
    <div className="contract-review-actions"><Button variant="outline" onClick={onBack}><ArrowLeft size={16} /> Back to journey</Button><p>{extracting ? "Reading the contract and preparing fields…" : profile.contractReviewed ? <><Check size={16} /> Confirmed facts carry forward. Missing items stay visible.</> : "Review your information, then confirm to continue."}</p>{profile.contractReviewed ? <Button onClick={onContinue}>Continue to Visa Application <ArrowRight size={16} /></Button> : <Button disabled={!started || choosing || extracting || errors.length > 0} onClick={confirm}>{extracting ? "Analyzing contract…" : "Confirm and see summary"} {!extracting && <ArrowRight size={16} />}</Button>}</div>
  </div>;
}
