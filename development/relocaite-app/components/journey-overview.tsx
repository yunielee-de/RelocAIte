import Image from "next/image";
import type { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { journeyProgress } from "@/lib/journey-stages";
import type { JourneyProfile } from "@/lib/journey-profile";
import type { VisaAssessment } from "@/lib/visa-assessment";

export function JourneyOverview({ profile, assessment, children }: { profile: JourneyProfile; assessment: VisaAssessment; children: ReactNode }) {
  const progress = journeyProgress(profile, assessment);
  return <div className="journey-hero">
    <div className="journey-hero-main">{children}<section className="panel journey-overview reference-progress"><div className="section-row"><h2>Your journey</h2><span className="progress-number">{progress.percent}%</span></div><p>{progress.completed} of 5 steps completed <span className="muted-dot">·</span> In-app preparation</p><Progress aria-label="Journey readiness progress" value={progress.percent} className="journey-progress" /></section></div>
    <section className="berlin-chapter" aria-label="A new chapter awaits">
      <Image className="berlin-chapter-image" src="/berlin-reichstag.jpg" alt="The Reichstag beside the River Spree in Berlin" fill sizes="(min-width: 950px) 34vw, 0px" />
      <div><p>A new chapter<br />awaits.</p><span /></div>
      <a className="berlin-photo-credit" href="https://commons.wikimedia.org/wiki/File:Berlin_Reichstag_Bundestag_von_der_Spree_aus_gesehen.JPG" target="_blank" rel="noreferrer">Photo: Schlaier · Public domain</a>
    </section>
  </div>;
}
