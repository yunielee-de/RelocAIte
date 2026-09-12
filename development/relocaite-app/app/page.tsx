"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderOpen,
  HomeIcon,
  House,
  Landmark,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Route,
  Search,
  Settings,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Finding, Profile } from "@/lib/assessment";

type Step = "welcome" | "dashboard" | "profile" | "upload" | "confirm" | "results";
type ExtractedFields = {
  employer: string;
  period: string;
  grossSalary: string;
  taxClass: string;
  healthInsurance: string;
  netPay: string;
};
type ExtractionResponse = {
  documentName: string;
  fields: Record<keyof ExtractedFields, { value: string; confidence: number }>;
};
type AssessmentResponse = {
  findings: Finding[];
  disclaimer: string;
};

const stepOrder: Step[] = ["profile", "upload", "confirm", "results"];
const defaultProfile: Profile = {
  name: "Priya",
  city: "Berlin",
  federalState: "Berlin",
  arrivalDate: "2026-02-03",
  permit: "EU Blue Card",
  permitExpiry: "2026-10-25",
  grossSalary: 6100,
  movedForJob: true,
  relocationSpend: 3200,
  employerReimbursement: 800,
  remoteDaysPerWeek: 3,
  foreignIncome: true,
  employmentMonths: 8,
  educationDaysUsed: 0,
  taxReturnFiled: false,
};
const emptyFields: ExtractedFields = {
  employer: "",
  period: "",
  grossSalary: "",
  taxClass: "",
  healthInsurance: "",
  netPay: "",
};

function Brand() {
  return (
    <Image
      src="/relocaite-logo.svg"
      alt="RelocAIte"
      width={174}
      height={39}
      className="h-auto w-[152px] sm:w-[174px]"
      priority
    />
  );
}

function Sidebar({ active = "Home" }: { active?: "Home" | "My journey" }) {
  const navigation = [
    { label: "Home", icon: HomeIcon },
    { label: "My journey", icon: Route },
    { label: "Documents", icon: FolderOpen },
    { label: "AI assistant", icon: MessageSquare },
    { label: "Resources", icon: BookOpen },
  ];
  return (
    <aside className="hidden min-h-screen flex-col border-r border-border bg-white px-3 py-6 md:flex">
      <div className="px-2"><Brand /></div>
      <nav className="mt-10 space-y-2" aria-label="Primary navigation">
        {navigation.map(({ label, icon: Icon }) => (
          <button
            type="button"
            key={label}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left type-label font-medium transition-colors ${active === label ? "bg-[#eaf3ff] text-primary" : "text-[#52617d] hover:bg-[#f5f8fc]"}`}
          >
            <Icon className="size-5" /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-2 border-t border-border pt-5">
        <button type="button" className="flex w-full items-center gap-3 px-4 py-2.5 type-label text-[#52617d]"><Settings className="size-5" /> Settings</button>
        <button type="button" className="flex w-full items-center gap-3 px-4 py-2.5 type-label text-[#52617d]"><LogOut className="size-5" /> Log out</button>
      </div>
    </aside>
  );
}

function AppHeader({
  step,
  onBack,
}: {
  step: Step;
  onBack: () => void;
}) {
  const index = stepOrder.indexOf(step);
  return (
    <header className="border-b border-border bg-white/95 shadow-[0_1px_12px_rgba(39,79,132,.04)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft />
          </Button>
          <div className="md:hidden"><Brand /></div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="type-label text-muted-foreground">
            Step {index + 1} of {stepOrder.length}
          </span>
          <Progress
            value={((index + 1) / stepOrder.length) * 100}
            className="w-36 bg-primary/10 [&_[data-slot=progress-indicator]]:bg-primary"
          />
        </div>
      </div>
    </header>
  );
}

function Welcome({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_82%_10%,rgba(47,128,237,.10),transparent_25%),linear-gradient(180deg,#fbfdff_0%,#f4f8fe_100%)] text-foreground">
      <header className="mx-auto flex w-full max-w-[1240px] items-center px-5 py-5 md:px-10">
        <Brand />
      </header>

      <section className="mx-auto grid w-full max-w-[1240px] gap-8 px-5 pb-10 pt-5 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)] lg:items-center lg:py-14">
        <div className="max-w-2xl">
          <h1 className="max-w-[720px] type-display font-semibold leading-[.94] tracking-[-0.065em]">Your Germany journey, made clearer.</h1>
          <p className="mt-7 max-w-xl type-body leading-8 text-muted-foreground">Understand your next steps—from documents and deadlines to money and workplace opportunities—in one clear, sourced plan.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="h-12 rounded-xl px-6 type-body shadow-[0_10px_28px_rgba(47,128,237,.24)]" onClick={onStart}>Start my journey <ArrowRight /></Button>
            <Button variant="ghost" size="lg" className="h-12 rounded-xl px-5 type-body" onClick={onDemo}>Explore demo</Button>
          </div>
          <ul className="mt-8 grid gap-3 type-label text-muted-foreground sm:grid-cols-3">
            {["Takes about 3 minutes", "Official sources included", "No legal jargon"].map((item) => <li className="flex items-center gap-2" key={item}><CircleCheck className="size-4 text-[#16a085]" />{item}</li>)}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute -inset-5 -z-10 rounded-[2.2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(47,128,237,.18),transparent_48%),radial-gradient(circle_at_80%_80%,rgba(38,185,154,.14),transparent_48%)] blur-xl" />
          <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_24px_64px_rgba(39,79,132,.12)]">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <img src="/priya-profile.png" alt="Priya’s profile" className="size-11 rounded-full object-cover ring-2 ring-white" />
                <div><p className="type-label text-muted-foreground">Priya’s preview</p><p className="mt-1 type-body font-semibold">3 next steps identified</p></div>
              </div>
            </div>
            <div className="space-y-3 p-4 sm:p-6">
              <article className="rounded-2xl bg-[linear-gradient(135deg,#2f80ed,#1768d3)] p-5 text-white"><div className="flex items-start justify-between gap-4"><p className="font-medium">Relocation costs</p><span className="rounded-full bg-white/12 px-2.5 py-1 type-label">Worth checking</span></div><p className="mt-6 type-heading font-semibold tracking-[-0.04em]">€2,400</p><p className="mt-2 type-label leading-6 text-white/70">Unreimbursed expenses to review before filing.</p></article>
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-border p-4"><p className="type-label font-semibold uppercase tracking-[.11em] text-muted-foreground">Deadline</p><p className="mt-3 font-semibold">Residence permit</p><p className="mt-1 type-label text-muted-foreground">Review in 43 days</p></article>
                <article className="rounded-2xl border border-border p-4"><p className="type-label font-semibold uppercase tracking-[.11em] text-muted-foreground">Payslip</p><p className="mt-3 font-semibold">Core fields identified</p><p className="mt-1 type-label text-muted-foreground">1 item to confirm</p></article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Dashboard({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const journey = [
    { title: "Job Offer & Contract", description: "Check, accept and understand your offer.", icon: BriefcaseBusiness, status: "Completed" },
    { title: "Visa Application", description: "Get the right visa with the right documents.", icon: FileText, status: "Completed" },
    { title: "Accommodation", description: "Find a place to call home and get registered.", icon: House, status: "In progress" },
    { title: "Compliance & Setup", description: "Insurance, housing, legal essentials and your Tax ID.", icon: ShieldCheck, status: "Not started" },
    { title: "Tax Basics", description: "Stay compliant and keep your receipts.", icon: Landmark, status: "Not started" },
    { title: "Tax Refund & Benefits", description: "Check what may apply to your situation.", icon: WalletCards, status: "Ready" },
  ];
  return (
    <div className="min-h-screen bg-[#f7faff] text-foreground md:grid md:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
      <Sidebar />
      <main className="min-w-0">
        <header className="flex h-[82px] items-center justify-between gap-5 px-5 md:px-8">
          <div className="md:hidden"><Brand /></div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden h-11 w-[290px] items-center gap-3 rounded-xl border border-border bg-[#fbfcff] px-4 type-label text-muted-foreground shadow-sm sm:flex">
              <Search className="size-5" /> Search anything...
            </div>
            <img src="/priya-profile.png" alt="Priya’s profile" className="size-11 rounded-full border-2 border-white object-cover shadow-sm" />
          </div>
        </header>

        <div className="mx-auto max-w-[1120px] px-5 py-7 md:px-8 md:py-9">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px] md:items-end xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h1 className="type-heading font-semibold tracking-[-0.045em]">Hi Priya</h1>
              <p className="mt-1 type-body text-muted-foreground">Let’s get you set up in Germany.</p>
              <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-[0_8px_28px_rgba(39,79,132,.06)]">
                <div className="flex items-end justify-between">
                  <div><p className="font-semibold">Your journey</p><p className="mt-1 type-label text-muted-foreground">2 of 6 steps completed</p></div>
                  <span className="type-body font-semibold text-primary">33%</span>
                </div>
                <Progress value={33} className="mt-4 h-3 bg-[#e8eef7] [&_[data-slot=progress-indicator]]:bg-primary" />
              </div>
            </div>
            <div className="relative min-h-[188px] overflow-hidden rounded-2xl bg-[#18395a] p-7 text-white shadow-[0_8px_28px_rgba(39,79,132,.08)]">
              <img src="/berlin-reichstag.jpg" alt="The Reichstag beside the River Spree in Berlin" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,28,52,.76)_0%,rgba(8,28,52,.25)_62%,rgba(8,28,52,.05)_100%)]" />
              <p className="relative z-10 type-heading font-medium leading-7">A new chapter<br />awaits.</p>
              <div className="relative z-10 mt-4 h-0.5 w-8 bg-white" />
              <a href="https://commons.wikimedia.org/wiki/File:Berlin_Reichstag_Bundestag_von_der_Spree_aus_gesehen.JPG" target="_blank" rel="noreferrer" className="absolute bottom-2 right-3 z-10 type-label text-white/75 hover:text-white">Photo: Schlaier · Public domain</a>
            </div>
          </div>

          <h2 className="mb-4 mt-7 type-heading font-semibold">Your steps</h2>
          <div className="space-y-3">
            {journey.map(({ title, description, icon: Icon, status }, index) => {
              const active = status === "In progress";
              const ready = status === "Ready";
              const complete = status === "Completed";
              return (
                <article key={title} className={`grid gap-4 rounded-2xl border bg-white p-4 shadow-[0_5px_20px_rgba(39,79,132,.045)] sm:grid-cols-[40px_64px_minmax(0,1fr)_auto_24px] sm:items-center ${active || ready ? "border-[#9cc8ff]" : "border-border"}`}>
                  <span className="grid size-9 place-items-center rounded-full bg-[#f0f4fa] type-label font-semibold text-[#536481]">{index + 1}</span>
                  <span className={`grid size-14 place-items-center rounded-xl ${complete ? "bg-[#e6f8f3] text-[#13a487]" : ready || active ? "bg-[#eaf3ff] text-primary" : "bg-[#f1f4f9] text-[#536481]"}`}><Icon className="size-7" /></span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-0.5 type-label text-muted-foreground">{description}</p>
                    {active ? <button type="button" onClick={onDemo} className="mt-2 rounded-full bg-primary px-6 py-2 type-label font-medium text-white">Continue</button> : null}
                    {ready ? <button type="button" onClick={onStart} className="mt-2 type-label font-semibold text-primary">Start check</button> : null}
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1.5 type-label font-medium ${complete ? "bg-[#def7f0] text-[#07866f]" : active ? "bg-[#eaf3ff] text-[#1768d3]" : ready ? "bg-[#eaf3ff] text-[#1768d3]" : "bg-[#f1f4f8] text-[#52617d]"}`}>
                    {complete ? "✓ Completed" : status}
                  </span>
                  <ArrowRight className="hidden size-5 text-[#536481] sm:block" />
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-[0_5px_20px_rgba(39,79,132,.045)] sm:flex-row sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#eaf3ff] text-primary"><Sparkles className="size-5" /></span>
            <div className="flex-1"><p className="font-semibold">Need help with your next step?</p><p className="type-label text-muted-foreground">Ask our AI assistant about working and living in Germany.</p></div>
            <Button variant="secondary" className="rounded-full"><MessageSquare /> Ask AI assistant</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="type-label font-medium">{label}</span>
      {children}
      {note ? <span className="type-label leading-5 text-muted-foreground">{note}</span> : null}
    </label>
  );
}

function ProfileStep({
  profile,
  setProfile,
  onNext,
}: {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      eyebrow="About you"
      title="Let’s personalize your journey."
      description="A few details help us show the steps that matter to you. Review everything before we build your plan."
      side={<ProfileAside />}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name">
          <Input
            className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />
        </Field>
        <Field label="German city">
          <Input
            className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
            value={profile.city}
            onChange={(event) => setProfile({ ...profile, city: event.target.value })}
          />
        </Field>
        <Field label="Federal state">
          <Select
            value={profile.federalState}
            onValueChange={(value) => setProfile({ ...profile, federalState: value })}
          >
            <SelectTrigger className="h-12 w-full rounded-xl bg-white px-4 type-body shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Berlin">Berlin</SelectItem>
              <SelectItem value="Hamburg">Hamburg</SelectItem>
              <SelectItem value="Hessen">Hessen</SelectItem>
              <SelectItem value="Bayern">Bayern</SelectItem>
              <SelectItem value="Sachsen">Sachsen</SelectItem>
              <SelectItem value="Other">Another state</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Arrival date">
          <Input
            type="date"
            className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
            value={profile.arrivalDate}
            onChange={(event) => setProfile({ ...profile, arrivalDate: event.target.value })}
          />
        </Field>
        <Field label="Residence status">
          <Select
            value={profile.permit}
            onValueChange={(value) => setProfile({ ...profile, permit: value })}
          >
            <SelectTrigger className="h-12 w-full rounded-xl bg-white px-4 type-body shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EU Blue Card">EU Blue Card</SelectItem>
              <SelectItem value="Skilled worker permit">Skilled worker permit</SelectItem>
              <SelectItem value="EU / EEA citizen">EU / EEA citizen</SelectItem>
              <SelectItem value="Other">Other / unsure</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {profile.permit !== "EU / EEA citizen" ? (
          <Field label="Permit expiry">
            <Input
              type="date"
              className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
              value={profile.permitExpiry}
              onChange={(event) => setProfile({ ...profile, permitExpiry: event.target.value })}
            />
          </Field>
        ) : null}
        <Field label="Monthly gross salary (€)">
          <Input
            type="number"
            min="0"
            className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
            value={profile.grossSalary}
            onChange={(event) => setProfile({ ...profile, grossSalary: Number(event.target.value) })}
          />
        </Field>
        <Field label="Months with current employer">
          <Input
            type="number"
            min="0"
            className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
            value={profile.employmentMonths}
            onChange={(event) => setProfile({ ...profile, employmentMonths: Number(event.target.value) })}
          />
        </Field>
        <Field label="Education-leave days used in current period">
          <Input
            type="number"
            min="0"
            max="10"
            className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
            value={profile.educationDaysUsed}
            onChange={(event) => setProfile({ ...profile, educationDaysUsed: Number(event.target.value) })}
          />
        </Field>
        <Field label="Remote days per week">
          <Select
            value={String(profile.remoteDaysPerWeek)}
            onValueChange={(value) => setProfile({ ...profile, remoteDaysPerWeek: Number(value) })}
          >
            <SelectTrigger className="h-12 w-full rounded-xl bg-white px-4 type-body shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5].map((day) => (
                <SelectItem key={day} value={String(day)}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="mt-7 space-y-4 rounded-2xl border border-border bg-white p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            className="mt-1 size-5"
            checked={profile.movedForJob}
            onCheckedChange={(checked) => setProfile({ ...profile, movedForJob: checked === true })}
          />
          <span>
            <span className="block font-medium">I moved to Germany for this job</span>
            <span className="mt-1 block type-label leading-6 text-muted-foreground">This helps identify relocation-related records worth reviewing.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            className="mt-1 size-5"
            checked={profile.taxReturnFiled}
            onCheckedChange={(checked) => setProfile({ ...profile, taxReturnFiled: checked === true })}
          />
          <span>
            <span className="block font-medium">I already filed this year’s German tax return</span>
            <span className="mt-1 block type-label leading-6 text-muted-foreground">This avoids showing a filing action you have already completed.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            className="mt-1 size-5"
            checked={profile.foreignIncome}
            onCheckedChange={(checked) => setProfile({ ...profile, foreignIncome: checked === true })}
          />
          <span>
            <span className="block font-medium">I had income outside Germany this tax year</span>
            <span className="mt-1 block type-label leading-6 text-muted-foreground">We use this only to identify when professional review is safer.</span>
          </span>
        </label>
      </div>

      {profile.movedForJob ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Your relocation spend (€)">
            <Input
              type="number"
              min="0"
              className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
              value={profile.relocationSpend}
              onChange={(event) => setProfile({ ...profile, relocationSpend: Number(event.target.value) })}
            />
          </Field>
          <Field label="Employer reimbursed (€)">
            <Input
              type="number"
              min="0"
              className="h-12 rounded-xl bg-white px-4 type-body md:type-body"
              value={profile.employerReimbursement}
              onChange={(event) => setProfile({ ...profile, employerReimbursement: Number(event.target.value) })}
            />
          </Field>
        </div>
      ) : null}

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          className="h-12 rounded-xl px-6 type-body"
          onClick={onNext}
          disabled={!profile.name || !profile.city || !profile.arrivalDate}
        >
          Continue to payslip <ArrowRight />
        </Button>
      </div>
    </StepShell>
  );
}

function ProfileAside() {
  return (
    <div className="space-y-6">
      <div className="grid size-12 place-items-center rounded-2xl bg-[#dff8f1] text-[#087663]">
        <ShieldCheck className="size-6" />
      </div>
      <div>
        <p className="type-heading font-semibold tracking-[-0.02em]">Why these questions?</p>
        <p className="mt-3 leading-7 text-muted-foreground">
          Dates, residence status, and employment facts determine which rules are relevant. Missing facts are shown as questions—not guessed.
        </p>
      </div>
      <div className="border-t border-border pt-5 type-label leading-6 text-muted-foreground">
        Prototype note: information remains in this browser session and is used only to generate the demo assessment.
      </div>
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  description,
  children,
  side,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  side?: React.ReactNode;
}) {
  return (
    <main className="mx-auto grid w-full max-w-[1160px] gap-8 px-5 py-9 md:px-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section>
        <p className="type-label font-semibold uppercase tracking-[.13em] text-[#1768d3]">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl type-display font-semibold leading-[1.02] tracking-[-0.055em]">{title}</h1>
        <p className="mb-9 mt-4 max-w-2xl type-body leading-8 text-muted-foreground">{description}</p>
        {children}
      </section>
      {side ? <aside className="h-fit rounded-[1.25rem] border border-[#dce8f8] bg-[#eef5ff] p-6 shadow-[0_12px_36px_rgba(39,79,132,.06)] lg:sticky lg:top-8">{side}</aside> : null}
    </main>
  );
}

function UploadStep({
  onExtracted,
  onSkip,
}: {
  onExtracted: (fields: ExtractedFields, fileName: string) => void;
  onSkip: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function extract(fileName: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/extract-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: fileName }),
      });
      if (!response.ok) throw new Error("Document extraction failed");
      const data = (await response.json()) as ExtractionResponse;
      onExtracted(
        Object.fromEntries(Object.entries(data.fields).map(([key, item]) => [key, (item as { value: string }).value])) as ExtractedFields,
        data.documentName,
      );
    } catch {
      setError("We couldn’t read that document. Try the demo payslip instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <StepShell
      eyebrow="Your document"
      title="Add one recent payslip."
      description="We’ll extract only the fields needed for this assessment. You confirm them before anything is evaluated."
      side={
        <div>
          <FileCheck2 className="size-8 text-[#2f80ed]" />
          <p className="mt-5 type-body font-semibold">What we look for</p>
          <ul className="mt-4 space-y-3 type-label leading-6 text-muted-foreground">
            {["Gross and net salary", "Tax class", "Employer and pay period", "Health insurance label"].map((item) => (
              <li className="flex gap-2" key={item}><Check className="mt-1 size-4 shrink-0 text-[#16a085]" />{item}</li>
            ))}
          </ul>
        </div>
      }
    >
      <div
        className="grid min-h-[330px] place-items-center rounded-[1.5rem] border-2 border-dashed border-[#b8ccec] bg-white/80 p-6 text-center shadow-[0_12px_38px_rgba(39,79,132,.05)] transition-colors hover:border-primary hover:bg-white"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) extract(file.name);
        }}
      >
        <div className="max-w-md">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#eaf3ff] text-[#2f80ed]">
            <UploadCloud className="size-8" />
          </div>
          <h2 className="mt-6 type-heading font-semibold">Drop your payslip here</h2>
          <p className="mt-2 leading-7 text-muted-foreground">PDF, JPG, or PNG. For this prototype, any file uses a safe synthetic extraction response.</p>
          <Input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) extract(file.name);
            }}
          />
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-xl bg-white px-5"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? <RefreshCw className="animate-spin" /> : <UploadCloud />} Choose file
            </Button>
            <Button
              size="lg"
              className="h-11 rounded-xl px-5"
              onClick={() => extract("Priya_Payslip_August_2026.pdf")}
              disabled={busy}
            >
              <FileText /> Use demo payslip
            </Button>
          </div>
          <Button
            type="button"
            variant="link"
            className="mt-3 text-muted-foreground"
            onClick={onSkip}
            disabled={busy}
          >
            Skip the document and confirm details manually
          </Button>
          {error ? <p role="alert" className="mt-4 type-label text-destructive">{error}</p> : null}
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 type-label text-muted-foreground">
        <LockKeyhole className="size-4" /> Your document is not stored by this prototype.
      </p>
    </StepShell>
  );
}

function ConfirmStep({
  fields,
  setFields,
  fileName,
  onAssess,
  busy,
  error,
}: {
  fields: ExtractedFields;
  setFields: (fields: ExtractedFields) => void;
  fileName: string;
  onAssess: () => void;
  busy: boolean;
  error: string;
}) {
  const rows: { key: keyof ExtractedFields; label: string; suffix?: string; confidence: string }[] = [
    { key: "employer", label: "Employer", confidence: "High confidence" },
    { key: "period", label: "Pay period", confidence: "High confidence" },
    { key: "grossSalary", label: "Gross salary", suffix: "€", confidence: "High confidence" },
    { key: "netPay", label: "Net pay", suffix: "€", confidence: "High confidence" },
    { key: "taxClass", label: "Tax class", confidence: "Check this field" },
    { key: "healthInsurance", label: "Health insurer", confidence: "Check this field" },
  ];
  return (
    <StepShell
      eyebrow="Document check"
      title="We found six key details."
      description="Please confirm the extracted values. Corrections here become verified facts for the rules engine."
      side={
        <div>
          <div className="grid size-12 place-items-center rounded-2xl bg-[#dff8f1] text-[#087663]"><FileCheck2 /></div>
          <p className="mt-5 font-semibold">Document read</p>
          <p className="mt-1 break-all type-label leading-6 text-muted-foreground">{fileName}</p>
          <div className="mt-5 border-t border-border pt-5 type-label leading-6 text-muted-foreground">
            Relocaite never silently treats uncertain extraction as fact.
          </div>
        </div>
      }
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-border bg-white">
        {rows.map((row, index) => (
          <div className={`grid gap-2 px-5 py-4 sm:grid-cols-[170px_minmax(0,1fr)_130px] sm:items-center ${index ? "border-t border-border" : ""}`} key={row.key}>
            <label className="type-label font-medium" htmlFor={row.key}>{row.label}</label>
            <div className="relative">
              {row.suffix ? <span className="absolute left-3 top-1/2 -translate-y-1/2 type-label text-muted-foreground">{row.suffix}</span> : null}
              <Input
                id={row.key}
                className={`h-10 rounded-lg bg-[#f7faff] ${row.suffix ? "pl-7" : ""}`}
                value={fields[row.key]}
                onChange={(event) => setFields({ ...fields, [row.key]: event.target.value })}
              />
            </div>
            <span className={`flex items-center gap-1.5 type-label font-medium ${row.confidence.startsWith("High") ? "text-[#087663]" : "text-[#9a651d]"}`}>
              <span className={`size-2 rounded-full ${row.confidence.startsWith("High") ? "bg-[#26b99a]" : "bg-[#e2a547]"}`} />
              {row.confidence}
            </span>
          </div>
        ))}
      </div>
      {error ? <p role="alert" className="mt-4 type-label text-destructive">{error}</p> : null}
      <div className="mt-8 flex justify-end">
        <Button size="lg" className="h-12 rounded-xl px-6 type-body" onClick={onAssess} disabled={busy}>
          {busy ? <><RefreshCw className="animate-spin" /> Building your plan</> : <>Show my next steps <Sparkles /></>}
        </Button>
      </div>
    </StepShell>
  );
}

const categoryMeta = {
  money: { icon: WalletCards, label: "Money opportunity", tone: "bg-[#dff8f1] text-[#087663]" },
  deadline: { icon: CalendarClock, label: "Deadline", tone: "bg-[#ffddb0] text-[#603c12]" },
  work: { icon: BriefcaseBusiness, label: "Work & records", tone: "bg-[#eaf3ff] text-[#1768d3]" },
  expert: { icon: Landmark, label: "Expert review", tone: "bg-[#e7dfe5] text-[#5a3548]" },
};

function ResultsStep({
  profile,
  findings,
  disclaimer,
  onRestart,
}: {
  profile: Profile;
  findings: Finding[];
  disclaimer: string;
  onRestart: () => void;
}) {
  const [openId, setOpenId] = useState(findings[0]?.id || "");
  const [copiedId, setCopiedId] = useState("");
  const moneyTotal = findings
    .filter((finding) => finding.category === "money")
    .reduce((total, finding) => total + Number(finding.value.replace(/[^0-9]/g, "")), 0);
  return (
    <main className="mx-auto w-full max-w-[1160px] px-5 py-8 md:px-10 md:py-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="type-label font-semibold uppercase tracking-[.13em] text-[#1768d3]">Your next steps</p>
          <h1 className="mt-3 type-display font-semibold leading-none tracking-[-0.06em]">
            {profile.name}, here’s what to do next.
          </h1>
          <p className="mt-4 max-w-2xl type-body leading-8 text-muted-foreground">
            We matched your confirmed facts against {findings.length} relevant checks. Every result explains its evidence and limits.
          </p>
        </div>
        <Button variant="outline" className="h-11 rounded-xl bg-white" onClick={onRestart}>
          <RefreshCw /> Start again
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[linear-gradient(135deg,#2f80ed,#1768d3)] p-5 text-white shadow-[0_14px_32px_rgba(47,128,237,.18)]">
          <p className="type-label text-white/65">Actions identified</p>
          <p className="mt-3 type-heading font-semibold">{findings.length}</p>
        </div>
        <div className="rounded-2xl bg-[#dff8f1] p-5 text-[#087663]">
          <p className="type-label text-[#087663]/70">Expenses to review</p>
          <p className="mt-3 type-heading font-semibold">€{moneyTotal.toLocaleString("en-DE")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="type-label text-muted-foreground">Profile</p>
          <p className="mt-3 type-body font-semibold">{profile.city} · {profile.permit}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {findings.map((finding, index) => {
          const meta = categoryMeta[finding.category];
          const Icon = meta.icon;
          const isOpen = openId === finding.id;
          return (
            <article key={finding.id} className="overflow-hidden rounded-[1.4rem] border border-border bg-white">
              <button
                type="button"
                className="grid w-full gap-4 p-5 text-left sm:grid-cols-[48px_minmax(0,1fr)_150px_28px] sm:items-center md:p-6"
                onClick={() => setOpenId(isOpen ? "" : finding.id)}
                aria-expanded={isOpen}
              >
                <span className={`grid size-12 place-items-center rounded-2xl ${meta.tone}`}><Icon /></span>
                <span>
                  <span className="type-label font-semibold uppercase tracking-[.11em] text-muted-foreground">{index + 1}. {meta.label}</span>
                  <span className="mt-1 block type-body font-semibold">{finding.title}</span>
                  <span className="mt-1 block type-label leading-6 text-muted-foreground">{finding.summary}</span>
                </span>
                <span className="sm:text-right">
                  <span className="block type-heading font-semibold">{finding.value}</span>
                  <span className="mt-1 block type-label font-medium text-muted-foreground">{finding.status}</span>
                </span>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
              {isOpen ? (
                <div className="border-t border-border bg-[#f7faff] px-5 py-5 md:px-[88px] md:py-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="type-label font-semibold">Why this appeared</p>
                      <p className="mt-2 type-label leading-7 text-muted-foreground">{finding.reason}</p>
                    </div>
                    <div>
                      <p className="type-label font-semibold">Recommended next step</p>
                      <p className="mt-2 type-label leading-7 text-muted-foreground">{finding.action}</p>
                    </div>
                  </div>
                  {finding.destination ? (
                    <div className="mt-5 rounded-xl border border-border bg-white px-4 py-3 type-label">
                      <span className="font-semibold">Where it goes:</span>{" "}
                      <span className="text-muted-foreground">{finding.destination}</span>
                    </div>
                  ) : null}
                  {finding.draft ? (
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="type-label font-semibold">Ready-to-edit request</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-white"
                          onClick={async () => {
                            await navigator.clipboard.writeText(finding.draft || "");
                            setCopiedId(finding.id);
                          }}
                        >
                          {copiedId === finding.id ? <><Check /> Copied</> : "Copy draft"}
                        </Button>
                      </div>
                      <textarea
                        className="min-h-48 w-full resize-y rounded-xl border border-border bg-white p-4 type-label leading-6 outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                        readOnly
                        value={finding.draft}
                        aria-label={`Draft request for ${finding.title}`}
                      />
                      <p className="mt-2 type-label leading-5 text-muted-foreground">Relocaite prepares the draft. You review and send it yourself.</p>
                    </div>
                  ) : null}
                  <a
                    className="mt-5 inline-flex items-center gap-2 type-label font-semibold text-[#1768d3] underline decoration-[#8abcf5] underline-offset-4"
                    href={finding.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {finding.source.label} <ExternalLink className="size-4" />
                  </a>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dce8f8] bg-[#eef5ff] p-5 type-label leading-6 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#1768d3]" />
        <p>{disclaimer}</p>
      </div>
    </main>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("welcome");
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [fields, setFields] = useState<ExtractedFields>(emptyFields);
  const [fileName, setFileName] = useState("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const previousStep = useMemo<Record<Exclude<Step, "welcome" | "dashboard">, Step>>(
    () => ({ profile: "welcome", upload: "profile", confirm: "upload", results: "confirm" }),
    [],
  );

  function goTo(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createAssessment() {
    setBusy(true);
    setError("");
    try {
      const updatedProfile = { ...profile, grossSalary: Number(fields.grossSalary || profile.grossSalary) };
      setProfile(updatedProfile);
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) throw new Error("Assessment failed");
      const data = (await response.json()) as AssessmentResponse;
      setFindings(data.findings);
      setDisclaimer(data.disclaimer);
      goTo("results");
    } catch {
      setError("We couldn’t create the plan. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "welcome") {
    return (
      <Welcome
        onStart={() => goTo("profile")}
        onDemo={() => {
          setProfile(defaultProfile);
          goTo("dashboard");
        }}
      />
    );
  }

  if (step === "dashboard") {
    return (
      <Dashboard
        onStart={() => goTo("profile")}
        onDemo={() => goTo("profile")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
      <Sidebar active="My journey" />
      <div className="min-w-0">
      <AppHeader step={step} onBack={() => goTo(previousStep[step])} />
      {step === "profile" ? (
        <ProfileStep profile={profile} setProfile={setProfile} onNext={() => goTo("upload")} />
      ) : null}
      {step === "upload" ? (
        <UploadStep
          onExtracted={(nextFields, nextFileName) => {
            setFields(nextFields);
            setFileName(nextFileName);
            goTo("confirm");
          }}
          onSkip={() => {
            setFields({
              employer: "",
              period: "",
              grossSalary: String(profile.grossSalary || ""),
              taxClass: "",
              healthInsurance: "",
              netPay: "",
            });
            setFileName("No document — manual confirmation");
            goTo("confirm");
          }}
        />
      ) : null}
      {step === "confirm" ? (
        <ConfirmStep
          fields={fields}
          setFields={setFields}
          fileName={fileName}
          onAssess={createAssessment}
          busy={busy}
          error={error}
        />
      ) : null}
      {step === "results" ? (
        <ResultsStep
          profile={profile}
          findings={findings}
          disclaimer={disclaimer}
          onRestart={() => {
            setFields(emptyFields);
            setFindings([]);
            goTo("welcome");
          }}
        />
      ) : null}
      </div>
    </div>
  );
}
