"use client";

import { ArrowLeft, ArrowRight, Check, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { documentAvailable, documentCatalog, vaultDocument, type DocumentType } from "@/lib/document-vault";
import { fieldValue, salaryLabel, type JourneyProfile } from "@/lib/journey-profile";
import { journeyStages, stageTasks } from "@/lib/journey-stages";
import { officialSources, type SourceKey } from "@/lib/mvp-visa-rules";
import { DocumentControl } from "./document-vault";

type LaterStageId = keyof typeof stageTasks;
function Source({ source }: { source: SourceKey }) { return <a className="text-link" href={officialSources[source].url} target="_blank" rel="noreferrer">{officialSources[source].label}<ExternalLink size={13} /></a>; }
export function LaterStage({ stage, profile, onChange, onBack, onContract, onDocuments, onContinue }: {
  stage: LaterStageId; profile: JourneyProfile; onChange: (profile: JourneyProfile) => void; onBack: () => void; onContract: () => void; onDocuments: () => void; onContinue: () => void;
}) {
  const index = journeyStages.findIndex(item => item.id === stage);
  const tasks = stageTasks[stage];
  const completed = tasks.every(task => profile.tasksDone[task.id]);
  const documents: DocumentType[] = stage === "accommodation" ? ["employment", "identity", "income", "schufa", "previous-rent", "housing-confirmation", "anmeldung"] : stage === "setup" ? ["insurance", "anmeldung", "tax-id", "expenses"] : ["expenses", "qualification", "recognition"];
  const facts = [fieldValue(profile.employment.employer), fieldValue(profile.employment.jobTitle), fieldValue(profile.employment.workLocation)].filter(Boolean);
  const title = stage === "accommodation" ? "Prepare for a place of your own." : stage === "setup" ? "Get the essentials in place." : "Discover what may be available to you.";
  return <>
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Your journey</button>
    <div className="page-heading"><div><p className="eyebrow">STAGE {index + 1} OF 5</p><h1>{journeyStages[index].title}</h1><p>{title}</p></div><span className={`pill ${completed ? "green" : "blue"}`}>{completed ? "Preparation reviewed" : "Your preparation guide"}</span></div>
    <section className="panel carried-facts"><span className="carried-icon"><Check /></span><div><h2>Known from your profile</h2><p>{facts.join(" · ") || "No employment facts confirmed yet. You can explore this guide and return to your contract later."}</p><strong>{salaryLabel(profile)}</strong>{fieldValue(profile.employment.startDate) && <p>Employment starts: {fieldValue(profile.employment.startDate)}</p>}</div><Button variant="outline" onClick={onContract}>Review profile facts</Button></section>
    <div className="later-stage-grid"><div>
      {stage === "accommodation" && <>
        <section className="panel guide-card"><h2>Prepare your rental application</h2><p>Landlords may request proof of income, an employment contract, ID and a SCHUFA credit report. Some also ask for evidence of previous rent payments. Confirm what this landlord needs before sharing sensitive information.</p><p>If you are new to Germany and have no SCHUFA history or previous German payslips, explain your situation and ask which alternatives they accept. Your confirmed salary helps you prepare, but is not a payslip.</p><Source source="housing" /></section>
        <section className="panel guide-card"><h2>Wohnungsgeberbestätigung</h2><p>This is your housing provider’s confirmation that you moved into a dwelling. Ask the landlord or authorised housing provider how and when they will supply it. A rental agreement alone does not replace this confirmation for registration.</p><Source source="housingConfirmation" /></section>
        <section className="panel guide-card"><h2>Anmeldung at your local Bürgeramt</h2><p>After moving in, register with the responsible local registration authority, generally within two weeks. Check the process, required documents and appointment availability for the municipality where you will live. Your work location is not necessarily your home municipality.</p><p>Keep the registration confirmation. It connects to your Tax ID and later employment setup.</p><Source source="registration" /></section>
      </>}
      {stage === "setup" && <>
        <section className="panel guide-card"><h2>Health insurance · core setup</h2><p>Arrange continuous coverage from arrival through the start of employment. Confirm the entry-period requirements with the mission and your insurer. Statutory (GKV) and private (PKV) systems have different eligibility, contribution and family-cover rules; salary alone does not choose the right cover for you.</p><p>Confirm your membership and coverage start with the insurer, and provide the details requested by payroll.</p><Source source="healthInsurance" /></section>
        <section className="panel guide-card"><h2>Additional cover · your choice</h2><h3>Privathaftpflicht</h3><p>Personal liability insurance is strongly recommended to protect against claims when you cause harm to others. It is voluntary, not legally mandatory.</p><Source source="liability" /><h3>Rechtsschutz</h3><p>Legal expenses insurance is optional. Consider your needs, exclusions and waiting periods before deciding. It is not a mandatory relocation requirement.</p><Source source="legalInsurance" /></section>
        <section className="panel guide-card"><h2>Your Tax ID & employment onboarding</h2><p>Your Steueridentifikationsnummer is generally assigned after your first registration in Germany. If you already have one, it stays yours; use the BZSt service to recover it if needed. Provide your Tax ID and the information requested by your employer through their secure onboarding process.</p><Source source="taxId" /><h3>Church tax & religious affiliation</h3><p>Church tax can apply to members of religious communities that levy it. Registration and payroll information should reflect your actual legal affiliation. If unclear, ask the registration authority or tax office to clarify; personal belief and recorded membership are not always the same.</p><Source source="taxes" /><h3>Start keeping records</h3><p>Retain receipts and details of relocation, work and home-office expenses, including dates, purpose and employer reimbursements. A record may help a later review; it does not guarantee deductibility.</p></section>
      </>}
      {stage === "benefits" && <>
        <section className="panel guide-card"><span className="pill blue">Potential opportunity</span><h2>Tax returns & work-related expenses</h2><p>You may be eligible to claim some relocation, work or home-office expenses, depending on your circumstances and the applicable rules. Keep receipts and distinguish your own costs from amounts reimbursed by your employer. A tax return can result in a refund or additional tax; a refund is not promised.</p><Source source="taxes" /></section>
        <section className="panel guide-card"><h2>Learning & professional development</h2><h3>Bildungsurlaub / Bildungszeit</h3><p>You may be eligible for paid time off for approved education under the rules of your federal state. Check eligibility and the employer notice process before booking.</p><Source source="educationLeave" /><h3>Weiterbildung support</h3><p>Potential training support depends on the programme, course and employment situation. Ask your employer and the Federal Employment Agency about the applicable conditions before paying for a course.</p><Source source="training" /><h3>Qualification & recognition funding</h3><p>Support may be available depending on residence, income and funding conditions. Contact the programme before incurring recognition costs.</p><Source source="recognitionFunding" /></section>
        <section className="panel guide-card financial-cta"><h2>Explore the financial assessment</h2><p>The existing Anspruch prototype helps you explore potential financial opportunities. It is a separate preview and does not yet import your Journey Profile.</p><Button asChild><a href="/financial-preview">Open financial preview <ArrowRight /></a></Button></section>
      </>}
    </div><aside>
      <section className="panel guide-card"><div className="section-row"><h2>Available / Missing</h2><FileText size={20} /></div><p>{stage === "accommodation" ? "Preparation suggestions, not universal rental requirements. Reuse what you already have." : "These records are shared with your other stages. Add only what is useful for your situation."}</p>
        <div className="stage-document-list">{documents.map(type => {
          const available = documentAvailable(profile, type);
          const document = vaultDocument(profile, type);
          return <div key={type}><h3>{documentCatalog[type].label}</h3><span className={`pill ${available ? "green" : "neutral"}`}>{available ? document?.filename ? "✓ Already provided" : "Reported ready" : document ? "Needs update" : "Missing / check need"}</span>{document?.source === "demo" && <p className="small-note">Fictional sample · not application evidence</p>}<DocumentControl profile={profile} type={type} onChange={onChange} onContract={onContract} /></div>;
        })}</div><Button variant="outline" onClick={onDocuments}>Open Document Vault <ArrowRight /></Button>
      </section>
      <section className="panel guide-card"><h2>My preparation review</h2><p>Mark what you have reviewed. These checks track your preparation, not completed registration, insurance purchase or tax filing.</p><div className="stage-task-list">{tasks.map(task => <label key={task.id}><Checkbox checked={profile.tasksDone[task.id] === true} onCheckedChange={checked => onChange({ ...profile, tasksDone: { ...profile.tasksDone, [task.id]: checked === true } })} /><span>{task.label}</span></label>)}</div></section>
    </aside></div>
    <section className="next-action-banner"><span className="action-icon"><ArrowRight /></span><div><p className="eyebrow">YOUR NEXT ACTION</p><h2>{stage === "accommodation" ? "Check your local registration process" : stage === "setup" ? "Confirm coverage and onboarding with your employer" : "Choose an opportunity to verify"}</h2><p>{stage === "accommodation" ? "Ask the housing provider for the move-in confirmation and find the official registration service for your home municipality." : stage === "setup" ? "Confirm insurance start dates and the payroll documents still needed. Keep your evidence in the shared Vault." : "Use the financial preview as a starting point, then verify the programme or tax conditions for your own situation."}</p></div><Button onClick={onContinue}>{stage === "benefits" ? "Back to journey" : "Explore next stage"}<ArrowRight /></Button></section>
  </>;
}
