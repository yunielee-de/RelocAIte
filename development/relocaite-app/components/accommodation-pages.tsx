"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Flag,
  Info,
  Lightbulb,
  Link2,
  MapPin,
  MessageCircle,
  MoreVertical,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  documentAvailable,
  documentFileError,
  recordDocument,
  type DocumentType,
} from "@/lib/document-vault";
import type { JourneyProfile } from "@/lib/journey-profile";
import { officialSources } from "@/lib/mvp-visa-rules";

type CommonProps = {
  profile: JourneyProfile;
  onChange: (profile: JourneyProfile) => void;
  onBack: () => void;
  onDocuments: () => void;
  onAssistant: () => void;
};
const DocIcon = () => (
  <span className="reference-doc-icon">
    <FileText />
  </span>
);
const Status = ({
  ready,
  optional = false,
}: {
  ready: boolean;
  optional?: boolean;
}) => (
  <span className={`reference-doc-status ${ready ? "ready" : ""}`}>
    {ready ? <CheckCircle2 /> : <Circle />}
    {ready ? "Ready" : optional ? "If required" : "Not uploaded"}
  </span>
);
const sessionPreviews = new Map<DocumentType, { url: string; file: File }>();
function UploadButton({
  profile,
  onChange,
  onView,
  type,
  label,
  ready,
}: {
  profile: JourneyProfile;
  onChange: (profile: JourneyProfile) => void;
  onView: () => void;
  type: DocumentType;
  label: string;
  ready: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const preview = sessionPreviews.get(type);
  function choose(next: File | null) {
    setFile(next);
    setError(next ? documentFileError(next) || "" : "");
  }
  function save() {
    if (!file) return setError("Choose a file first.");
    const issue = documentFileError(file);
    if (issue) return setError(issue);
    const previous = sessionPreviews.get(type);
    if (previous) URL.revokeObjectURL(previous.url);
    sessionPreviews.set(type, { url: URL.createObjectURL(file), file });
    onChange(recordDocument(profile, type, file.name));
    setOpen(false);
  }
  if (ready)
    return (
      <>
        <Button
          variant="outline"
          onClick={() => (preview ? setPreviewOpen(true) : onView())}
        >
          View
        </Button>
        {previewOpen &&
          preview &&
          createPortal(
            <div
              className="upload-modal-backdrop"
              onMouseDown={() => setPreviewOpen(false)}
            >
              <section
                className="panel file-preview-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`preview-${type}`}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <header>
                  <div>
                    <h2 id={`preview-${type}`}>{preview.file.name}</h2>
                    <p>
                      Local preview · this file has not been uploaded to a
                      server.
                    </p>
                  </div>
                  <button
                    aria-label="Close preview"
                    onClick={() => setPreviewOpen(false)}
                  >
                    <X />
                  </button>
                </header>
                <object
                  data={preview.url}
                  type={preview.file.type || "application/pdf"}
                  aria-label={preview.file.name}
                >
                  <p>
                    Preview unavailable.{" "}
                    <a href={preview.url} target="_blank" rel="noreferrer">
                      Open the file in a new tab
                    </a>
                    .
                  </p>
                </object>
                <footer>
                  <Button variant="outline" asChild>
                    <a href={preview.url} target="_blank" rel="noreferrer">
                      Open in new tab <ExternalLink />
                    </a>
                  </Button>
                  <Button onClick={() => setPreviewOpen(false)}>Done</Button>
                </footer>
              </section>
            </div>,
            document.body,
          )}
      </>
    );
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open &&
        createPortal(
          <div
            className="upload-modal-backdrop"
            onMouseDown={() => setOpen(false)}
          >
            <section
              className="panel upload-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`upload-${type}`}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                className="upload-modal-close"
                aria-label="Close upload"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
              <span className="upload-modal-icon">
                <UploadCloud />
              </span>
              <h2 id={`upload-${type}`}>Upload document</h2>
              <p>
                Select a PDF, JPG or PNG file. The file stays on this device;
                RelocAIte saves its name and readiness status.
              </p>
              <input
                ref={input}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) => choose(event.target.files?.[0] || null)}
              />
              <button
                className="upload-drop-zone"
                onClick={() => input.current?.click()}
              >
                <UploadCloud />
                <strong>{file?.name || "Choose a file"}</strong>
                <span>PDF, JPG or PNG · up to 20 MB</span>
              </button>
              {error && (
                <p className="upload-modal-error" role="alert">
                  {error}
                </p>
              )}
              <div className="upload-modal-actions">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={!file || Boolean(error)}>
                  Add to documents
                </Button>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
function PageTitle({
  icon: Icon,
  title,
  subtitle,
  detail,
  onBack,
  backLabel = "Back to Accommodation",
}: {
  icon: typeof FileText;
  title: string;
  subtitle: string;
  detail?: string;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <>
      <button className="back-link reference-back" onClick={onBack}>
        <ArrowLeft /> {backLabel}
      </button>
      <header className="reference-page-title">
        <span>
          <Icon />
        </span>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {detail && <small>{detail}</small>}
        </div>
      </header>
    </>
  );
}
function HelpCard({
  onAssistant,
  copy,
}: {
  onAssistant: () => void;
  copy: string;
}) {
  return (
    <section className="panel reference-side-card">
      <span className="reference-round-icon">
        <MessageCircle />
      </span>
      <div>
        <h3>Need help?</h3>
        <p>{copy}</p>
      </div>
      <Button onClick={onAssistant}>
        Ask AI Assistant <ArrowRight />
      </Button>
    </section>
  );
}
function TipsCard({
  title = "Good to know",
  tips,
}: {
  title?: string;
  tips: string[];
}) {
  return (
    <section className="panel reference-side-card reference-tips">
      <span className="reference-round-icon">
        <Lightbulb />
      </span>
      <div>
        <h3>{title}</h3>
        <ul>
          {tips.map((tip) => (
            <li key={tip}>
              <CheckCircle2 />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
function Progress({
  ready,
  total,
  green = false,
  noun = "required documents",
}: {
  ready: number;
  total: number;
  green?: boolean;
  noun?: string;
}) {
  const percent = Math.round((ready / total) * 100);
  return (
    <section
      className={`panel reference-page-progress ${green ? "green" : ""}`}
    >
      <strong>
        {ready} of {total} {noun} ready
      </strong>
      <b>{percent}%</b>
      <div>
        <span style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}

const rentalDocs: {
  type: DocumentType;
  title: string;
  detail: string;
  optional?: boolean;
}[] = [
  {
    type: "identity",
    title: "Passport or national ID",
    detail: "A copy of your passport or national ID card.",
  },
  {
    type: "income",
    title: "Proof of income",
    detail: "Recent payslips or other proof of income.",
  },
  {
    type: "employment",
    title: "Employment contract",
    detail: "A copy of your employment contract.",
  },
  {
    type: "schufa",
    title: "SCHUFA (if applicable)",
    detail: "A credit check report commonly requested by landlords.",
    optional: true,
  },
  {
    type: "previous-rent",
    title: "Personal introduction",
    detail: "A short introduction about yourself (e.g. work, lifestyle).",
    optional: true,
  },
  {
    type: "accommodation",
    title: "Other supporting documents",
    detail: "For example proof of study enrolment or guarantor documents.",
    optional: true,
  },
];
export function RentalDocumentsPage({
  profile,
  onChange,
  onBack,
  onDocuments,
  onAssistant,
}: CommonProps) {
  const ready = rentalDocs.filter((item) =>
    documentAvailable(profile, item.type),
  ).length;
  return (
    <div className="reference-detail-page">
      <div className="reference-detail-grid">
        <main>
          <PageTitle
            icon={FileText}
            title="Rental documents"
            subtitle="Get your documents ready for rental applications."
            onBack={onBack}
          />
          <Progress ready={ready} total={rentalDocs.length} green />
          <p className="reference-page-intro">
            Keep the documents commonly requested when applying for an apartment
            in Germany in one place. You can upload, view and manage your
            documents here.
          </p>
          <section className="reference-document-stack">
            {rentalDocs.map((item, index) => {
              const available = documentAvailable(profile, item.type);
              return (
                <article
                  className="panel reference-document-row"
                  key={item.type}
                >
                  <span
                    className={`reference-check ${available ? "ready" : ""}`}
                  >
                    {available ? <Check /> : index + 1}
                  </span>
                  <DocIcon />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                  <Status ready={available} optional={item.optional} />
                  <UploadButton
                    profile={profile}
                    onChange={onChange}
                    onView={onDocuments}
                    type={item.type}
                    label={item.optional ? "Add" : "Upload"}
                    ready={available}
                  />
                  <MoreVertical />
                </article>
              );
            })}
          </section>
          <section className="reference-info-banner">
            <ShieldCheck />
            <div>
              <h3>Your documents stay under your control</h3>
              <p>
                Only upload documents you want to use in RelocAIte. Always
                review sensitive information before sharing documents with a
                landlord.
              </p>
            </div>
          </section>
        </main>
        <aside>
          <section className="panel reference-side-card">
            <span className="reference-round-icon">
              <FileText />
            </span>
            <div>
              <h3>About rental documents</h3>
              <p>
                These are documents commonly requested when applying for an
                apartment in Germany. Requirements vary by city, landlord and
                housing type.
              </p>
              <a
                href={officialSources.housing.url}
                target="_blank"
                rel="noreferrer"
              >
                Learn more about rental documents <ArrowRight />
              </a>
            </div>
          </section>
          <HelpCard
            onAssistant={onAssistant}
            copy="Ask our AI assistant anything about rental documents, landlord requirements or your situation."
          />
          <TipsCard
            title="Useful resources"
            tips={[
              "What is SCHUFA and do I need it?",
              "How to write a personal introduction",
              "Document templates",
              "Tips for a successful rental application",
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

const anmeldungDocs: {
  type: DocumentType;
  title: string;
  detail: string;
  optional?: boolean;
}[] = [
  {
    type: "identity",
    title: "Passport / National ID",
    detail: "Valid passport or national ID card.",
  },
  {
    type: "housing-confirmation",
    title: "Wohnungsgeberbestätigung",
    detail: "Confirmation from your landlord.",
  },
  {
    type: "accommodation",
    title: "Anmeldung form",
    detail: "Completed and signed.",
  },
  {
    type: "previous-rent",
    title: "Rental agreement",
    detail: "Your signed rental contract (Mietvertrag).",
  },
  {
    type: "anmeldung",
    title: "Additional documents",
    detail: "May be required in some cases.",
    optional: true,
  },
];
export function AnmeldungPage({
  profile,
  onChange,
  onBack,
  onDocuments,
}: CommonProps) {
  const ready = anmeldungDocs.filter((item) =>
    documentAvailable(profile, item.type),
  ).length;
  return (
    <div className="reference-detail-page">
      <div className="reference-detail-grid">
        <main>
          <PageTitle
            icon={Building2}
            title="Anmeldung"
            subtitle="Get everything ready to register your address."
            onBack={onBack}
          />
          <Progress ready={ready} total={4} />
          <section className="panel reference-checklist">
            <h2>Document checklist</h2>
            <p>
              Upload the required documents and keep everything in one place.
            </p>
            {anmeldungDocs.map((item) => {
              const available = documentAvailable(profile, item.type);
              return (
                <div className="reference-checklist-row" key={item.title}>
                  <DocIcon />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                  <Status ready={available} optional={item.optional} />
                  <UploadButton
                    profile={profile}
                    onChange={onChange}
                    onView={onDocuments}
                    type={item.type}
                    label={item.optional ? "Add" : "Upload"}
                    ready={available}
                  />
                  <MoreVertical />
                </div>
              );
            })}
          </section>
          <section className="reference-next">
            <h2>Appointment preparation</h2>
            <p>Find your local authority and get ready for your appointment.</p>
            {[
              [
                MapPin,
                "Find your local Bürgeramt",
                "Search for the registration office in your city.",
                "Find office",
              ],
              [
                CalendarDays,
                "Check if an appointment is required",
                "In most cities, you need to book online.",
                "Learn how",
              ],
              [
                FileText,
                "Prepare for your appointment",
                "Bring all required originals and arrive on time.",
                "View tips",
              ],
            ].map(([Icon, title, copy, action], i) => (
              <div key={String(title)}>
                <span>{i + 1}</span>
                <i>
                  <Icon />
                </i>
                <div>
                  <h3>{String(title)}</h3>
                  <p>{String(copy)}</p>
                </div>
                <Button variant="outline">
                  {String(action)} <ArrowRight />
                </Button>
              </div>
            ))}
          </section>
          <section className="reference-finish">
            <Flag />
            <div>
              <h3>After your appointment</h3>
              <p>Upload your Meldebestätigung and mark this step complete.</p>
            </div>
            <UploadButton
              profile={profile}
              onChange={onChange}
              onView={onDocuments}
              type="anmeldung"
              label="Upload"
              ready={documentAvailable(profile, "anmeldung")}
            />
          </section>
        </main>
        <aside>
          <section className="reference-page-hero">
            <Image src="/berlin-reichstag.jpg" alt="Berlin skyline" fill />
            <div>
              A registered address
              <br />
              opens new opportunities.
              <span />
            </div>
          </section>
          <section className="panel reference-side-card">
            <span className="reference-round-icon">
              <Info />
            </span>
            <div>
              <h3>What is Anmeldung?</h3>
              <p>
                Anmeldung is the registration of your German address with the
                local registration authority (Bürgeramt). After registration,
                you’ll receive a Meldebestätigung.
              </p>
            </div>
          </section>
          <TipsCard
            tips={[
              "Requirements can vary by city and your personal situation.",
              "You usually need an appointment at the Bürgeramt.",
              "Bring original documents to your appointment.",
              "Register within 14 days of moving in.",
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

export function RentalListingPage({ onBack, onAssistant }: CommonProps) {
  const [url, setUrl] = useState(
    "https://www.immobilienscout24.de/expose/123456789",
  );
  const [checked, setChecked] = useState(true);
  return (
    <div className="reference-detail-page">
      <div className="reference-detail-grid">
        <main>
          <PageTitle
            icon={ShieldCheck}
            title="Check rental listing"
            subtitle="Get a second opinion on a rental listing with AI."
            detail="Paste the listing link or upload screenshots and we’ll review it for potential warning signs."
            onBack={onBack}
          />
          <section className="panel listing-input-card">
            <div className="listing-tabs">
              <button className="active">
                <Link2 />
                Listing link
              </button>
              <button>
                <FileText />
                Screenshots
              </button>
            </div>
            <h2>Rental listing URL</h2>
            <p>Paste the link to the rental listing.</p>
            <div>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <Button onClick={() => setChecked(true)}>
                Check with AI <ArrowRight />
              </Button>
            </div>
          </section>
          {checked && (
            <section className="panel listing-results">
              <header>
                <span>
                  <Info />
                </span>
                <div>
                  <h2>Some warning signs found</h2>
                  <p>
                    This listing shows patterns commonly seen in rental scams.
                  </p>
                </div>
              </header>
              <div className="listing-summary">
                <div className="listing-placeholder">
                  <Building2 />
                </div>
                <div>
                  <h3>Modern 2-room apartment in Berlin Mitte</h3>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url} <ExternalLink />
                  </a>
                  <p>
                    <MapPin /> Berlin, Mitte · €650 · 55 m²
                  </p>
                </div>
              </div>
              <h3 className="observations-title">
                <Info /> AI observations
              </h3>
              {[
                [
                  "Unusually low rent",
                  "The rent is significantly below the average for similar apartments.",
                ],
                [
                  "Landlord claims to be abroad",
                  "The landlord mentions being unable to arrange an in-person viewing.",
                ],
                [
                  "Request for payment before viewing",
                  "The listing asks for a deposit before you have seen the apartment.",
                ],
                [
                  "Limited listing details",
                  "The description is missing important information.",
                ],
                [
                  "Communication outside platform",
                  "The landlord asks to continue via email or WhatsApp.",
                ],
              ].map(([title, copy]) => (
                <div className="listing-observation" key={title}>
                  <span>!</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </div>
              ))}
              <div className="reference-info-banner">
                <Sparkles />
                <div>
                  <h3>AI-generated guidance</h3>
                  <p>
                    This check identifies common warning signs only. It cannot
                    confirm whether a listing or landlord is legitimate. Never
                    send money solely based on this assessment.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
        <aside>
          <section className="reference-page-hero">
            <Image
              src="/berlin-reichstag.jpg"
              alt="Residential buildings in Germany"
              fill
            />
            <div>
              Smarter checks
              <br />
              for a safer home.
              <span />
            </div>
          </section>
          <section className="panel reference-side-card reference-numbered">
            <span className="reference-round-icon">
              <Lightbulb />
            </span>
            <div>
              <h3>Suggested next steps</h3>
              {[
                "Don’t transfer money yet",
                "Ask for an in-person or video viewing",
                "Keep communication on the rental platform",
                "Verify the landlord and property independently",
              ].map((step, i) => (
                <p key={step}>
                  <b>{i + 1}</b>
                  <strong>{step}</strong>
                </p>
              ))}
            </div>
          </section>
          <HelpCard
            onAssistant={onAssistant}
            copy="Ask our AI assistant anything about this listing or general rental safety."
          />
        </aside>
      </div>
    </div>
  );
}

const contractOverviewDocs = [
  ["employment", "Job offer", "The official offer from your employer."],
  ["employment", "Employment contract", "Your signed contract."],
  [
    "declaration",
    "Company information",
    "Optional company profile or HR contact.",
  ],
  [
    "route-declarations",
    "Additional documents",
    "Annexes or confirmations, if required.",
  ],
] as const;
const visaOverviewDocs = [
  [
    "identity",
    "Valid passport",
    "Your passport must be valid for the required period.",
  ],
  [
    "route-declarations",
    "Visa application form",
    "Fill in and sign the national visa application form.",
  ],
  ["photo", "Biometric photos", "Recent photos in the required format."],
  [
    "employment",
    "Employment contract / binding job offer",
    "Your signed contract or binding job offer.",
  ],
  ["declaration", "Declaration of Employment", "Provided by your employer."],
  [
    "qualification",
    "Qualification / degree documents",
    "Your university degree and certificates.",
  ],
  [
    "insurance",
    "Health insurance evidence",
    "Proof of valid coverage for Germany.",
  ],
] as const;
export function JourneyDocumentOverviewPage({
  kind,
  profile,
  onChange,
  onBack,
  onDocuments,
  onAssistant,
  onContinue,
}: CommonProps & { kind: "contract" | "visa"; onContinue: () => void }) {
  const visa = kind === "visa";
  const docs = visa ? visaOverviewDocs : contractOverviewDocs;
  const ready = docs.filter(([type]) =>
    documentAvailable(profile, type),
  ).length;
  const steps = visa
    ? [
        "Check your visa requirements",
        "Book an appointment",
        "Prepare for your appointment",
        "Submit your application",
      ]
    : [
        "Review your job offer",
        "Discuss any questions",
        "Sign your contract",
        "Keep a copy in RelocAIte",
      ];
  return (
    <div className="reference-detail-page">
      <div className="reference-detail-grid">
        <main>
          <PageTitle
            icon={visa ? FileText : Flag}
            title={visa ? "Visa Application" : "Job Offer & Contract"}
            subtitle={
              visa
                ? "Get the right visa with the right documents."
                : "Check, accept and understand your job offer."
            }
            detail={
              visa
                ? "This checklist is tailored to your situation and confirmed profile."
                : "Make sure you have everything you need before signing your contract."
            }
            onBack={onBack}
            backLabel="Back to My Journey"
          />
          {visa && (
            <section className="panel reference-route">
              <span className="reference-round-icon">
                <Sparkles />
              </span>
              <div>
                <h3>Your route: EU Blue Card</h3>
                <p>Based on your job offer and profile.</p>
              </div>
              <Button variant="ghost" onClick={onContinue}>
                Change visa type
              </Button>
            </section>
          )}
          <Progress
            ready={ready}
            total={docs.length}
            noun={visa ? "documents" : "recommended items"}
          />
          <section className="panel reference-checklist">
            <h2>{visa ? "Your visa documents" : "Document checklist"}</h2>
            <p>
              {visa
                ? "Upload and keep the key documents for your visa application in one place."
                : "Upload and keep the key documents related to your job offer and contract."}
            </p>
            {docs.map(([type, title, detail]) => {
              const available = documentAvailable(profile, type);
              return (
                <div className="reference-checklist-row" key={title}>
                  <DocIcon />
                  <div>
                    <h3>{title}</h3>
                    <p>{detail}</p>
                  </div>
                  <Status
                    ready={available}
                    optional={title.includes("Additional")}
                  />
                  <UploadButton
                    profile={profile}
                    onChange={onChange}
                    onView={onDocuments}
                    type={type}
                    label={title.includes("Additional") ? "Add" : "Upload"}
                    ready={available}
                  />
                  <MoreVertical />
                </div>
              );
            })}
          </section>
          <section className="reference-next">
            <h2>Next steps</h2>
            <p>Follow these steps to move forward with confidence.</p>
            {steps.map((step, index) => (
              <div key={step}>
                <span>{index + 1}</span>
                <i>{index === 1 ? <CalendarDays /> : <FileText />}</i>
                <div>
                  <h3>{step}</h3>
                  <p>
                    {visa
                      ? "Review the latest requirements and prepare your originals."
                      : "Review the details and keep your confirmed information up to date."}
                  </p>
                </div>
                <Button variant="outline" onClick={onContinue}>
                  {index === 0 ? "View guide" : "Learn more"}
                  <ArrowRight />
                </Button>
              </div>
            ))}
          </section>
        </main>
        <aside>
          <section className="reference-page-hero">
            <Image
              src="/berlin-reichstag.jpg"
              alt="A new chapter in Germany"
              fill
            />
            <div>
              {visa ? (
                <>
                  Your next chapter
                  <br />
                  starts with the
                  <br />
                  right visa.
                </>
              ) : (
                <>
                  A great opportunity
                  <br />
                  for your next chapter
                  <br />
                  in Germany.
                </>
              )}
              <span />
            </div>
          </section>
          <section className="panel reference-side-card">
            <span className="reference-round-icon">
              <Info />
            </span>
            <div>
              <h3>{visa ? "About the EU Blue Card" : "Why this matters"}</h3>
              <p>
                {visa
                  ? "The EU Blue Card allows highly qualified professionals from non-EU countries to live and work in Germany. Requirements depend on the role, qualification and salary."
                  : "Your job offer and employment contract define your role, salary, working hours and other important conditions. Understand the terms before you sign."}
              </p>
            </div>
          </section>
          <TipsCard
            tips={
              visa
                ? [
                    "Requirements depend on your nationality and visa type.",
                    "Processing times vary by country and location.",
                    "Some documents may need translation.",
                    "Always check the responsible German mission.",
                  ]
                : [
                    "Read the contract carefully.",
                    "Check salary, working hours, probation and notice period.",
                    "Ask your employer about anything unclear.",
                    "A written contract is required for many visa applications.",
                  ]
            }
          />
          <HelpCard
            onAssistant={onAssistant}
            copy={
              visa
                ? "Ask about visa requirements, documents or the application process."
                : "Ask about job offers, contracts or working in Germany."
            }
          />
        </aside>
      </div>
    </div>
  );
}
