"use client";

import { ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, ChevronRight, Circle, CircleDollarSign, FileCheck2, HeartPulse, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JourneyOverview } from "./journey-overview";
import type { JourneyProfile } from "@/lib/journey-profile";
import type { VisaAssessment } from "@/lib/visa-assessment";
import { journeyStages, journeyProgress, journeyNextAction } from "@/lib/journey-stages";
import type { JourneyView } from "./journey-shell";

const icons = [BriefcaseBusiness, FileCheck2, Building2, HeartPulse, CircleDollarSign];
export function JourneyDashboard({ profile, assessment, onNavigate }: { profile: JourneyProfile; assessment: VisaAssessment; onNavigate: (view: JourneyView) => void }) {
  const progress = journeyProgress(profile, assessment);
  const action = journeyNextAction(profile, assessment);
  return <div className="reference-dashboard">
    <JourneyOverview profile={profile} assessment={assessment}><div className="page-heading"><div><h1>{profile.name ? `Hi ${profile.name}` : "Welcome to RelocAIte"} <span className="wave" aria-hidden="true">👋</span></h1><p>Let’s get you set up in Germany.</p></div></div></JourneyOverview>
    <section className="next-action-banner dashboard-next-action"><span className="action-icon"><Sparkles size={25} /></span><div><p className="eyebrow">YOUR NEXT ACTION</p><h2>{action.title}</h2><p>{action.detail}</p></div><Button onClick={() => onNavigate(action.destination)}>{action.destination === "contract" && !profile.contractDocument ? "Start with your contract" : "Continue"}<ArrowRight /></Button></section>
    <div className="section-row stage-heading"><h2>Your steps</h2><span className="quiet-label">One profile. One journey.</span></div>
    <div className="journey-stage-list">{journeyStages.map((stage, index) => {
      const complete = progress.done[index];
      const active = index === progress.currentIndex;
      const Icon = icons[index];
      return <article key={stage.id} className={`panel journey-stage-row ${active ? "current" : ""}`} aria-label={`Step ${index + 1}: ${stage.title}`}>
        <span className="stage-number">{index + 1}</span><span className={`stage-icon ${complete ? "complete" : ""}`}><Icon size={26} /></span>
        <div className="stage-copy"><h3>{stage.title}</h3><p>{stage.description}</p><button className={`stage-link ${active ? "primary" : ""}`} onClick={() => onNavigate(stage.id)}>{active ? "Continue" : "View details"}{active && <ArrowRight size={15} />}</button></div>
        <span className={`stage-status ${complete ? "done" : progress.states[index] === "In progress" ? "in-progress" : ""}`}>{complete ? <BadgeCheck size={16} /> : <Circle size={15} />}{progress.states[index]}</span>
        <ChevronRight className="stage-chevron" size={21} aria-hidden="true" />
      </article>;
    })}</div>
    <p className="small-note">Completed means the in-app readiness checks or preparation reviews are done. It does not mean a visa was issued, registration completed, or benefits awarded. You can explore later steps at any time.</p>
    <section className="panel assistant-banner"><span className="assistant-icon"><MessageCircle size={25} /></span><div><h3>Need help with your next step?</h3><p>Explore plain-English explanations using your confirmed profile.</p></div><Button variant="secondary" onClick={() => onNavigate("assistant")}><Sparkles size={16} /> Ask AI Assistant</Button></section>
  </div>;
}
