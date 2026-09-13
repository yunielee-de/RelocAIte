"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ExternalLink, Info } from "lucide-react";
import { JourneyShell, type JourneyView } from "@/components/journey-shell";
import { JourneyDashboard } from "@/components/journey-dashboard";
import { ContractStage } from "@/components/contract-stage";
import { VisaStage } from "@/components/visa-stage";
import { DocumentVault } from "@/components/document-vault";
import { LaterStage } from "@/components/later-stage";
import { JourneyAssistant } from "@/components/journey-assistant";
import {
  AnmeldungPage,
  JourneyDocumentOverviewPage,
  RentalDocumentsPage,
  RentalListingPage,
} from "@/components/accommodation-pages";
import { journeyStages } from "@/lib/journey-stages";
import { createProfile, type JourneyProfile } from "@/lib/journey-profile";
import { loadProfile, resetProfile, saveProfile } from "@/lib/journey-storage";
import {
  assessVisa,
  routeChecklist,
  type VisaAssessment,
} from "@/lib/visa-assessment";
import { mvpRules, officialSources } from "@/lib/mvp-visa-rules";

export default function Home() {
  const [profile, setProfile] = useState<JourneyProfile>(createProfile);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<JourneyView>("home");
  const [storageNotice, setStorageNotice] = useState("");
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [saved, setSaved] = useState("Loading your profile");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestSequence = useRef(0);
  useEffect(() => {
    let restored;
    try {
      restored = loadProfile(window.localStorage);
    } catch {
      restored = {
        profile: createProfile(),
        notice:
          "Browser storage is unavailable. You can use the journey in this tab, but it will not survive a refresh.",
      };
    }
    // Restore browser-only storage after hydration, never during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(restored.profile);
    setStorageNotice(restored.notice);
    setStorageBlocked(Boolean(restored.notice));
    setSaved(restored.notice ? "Session only" : "Saved on this browser");
    setReady(true);
  }, []);
  const assessment = useMemo(() => assessVisa(profile), [profile]);
  const route = assessment.routes.find(
    (route) => route.id === profile.selectedRoute,
  );
  const checklist =
    profile.visaReviewed && route ? routeChecklist(profile, route) : [];
  function persistProgress(next: JourneyProfile) {
    if (storageBlocked) return;
    let success = false;
    try {
      success = saveProfile(window.localStorage, next);
    } catch {
      /* Storage access can be blocked. */
    }
    setSaved(
      success ? "Saved on this browser" : "Session only · saving unavailable",
    );
    if (!success)
      setStorageNotice(
        "Your profile could not be saved. You can continue in this tab. Download your checklist before leaving.",
      );
  }
  function updateProfile(next: JourneyProfile) {
    requestSequence.current++;
    setBusy(false);
    setError("");
    setProfile(next);
    persistProgress(next);
  }
  function navigate(next: JourneyView) {
    requestSequence.current++;
    setBusy(false);
    setError("");
    const destination =
      next === "visa" && !profile.contractReviewed ? "contract" : next;
    const stage = journeyStages.find((stage) => stage.id === destination);
    if (stage && !profile.visitedStages.includes(stage.id))
      updateProfile({
        ...profile,
        visitedStages: [...profile.visitedStages, stage.id],
      });
    setView(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() =>
      document
        .getElementById("journey-content")
        ?.focus({ preventScroll: true }),
    );
  }
  async function runAssessment(confirmed: JourneyProfile) {
    const sequence = ++requestSequence.current;
    setProfile(confirmed);
    persistProgress(confirmed);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/visa-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmed),
      });
      const data = (await response.json()) as VisaAssessment & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error || "The assessment could not be completed.");
      if (requestSequence.current !== sequence) return;
      const assessed = {
        ...confirmed,
        visaReviewed: true,
        selectedRoute: data.routes[0]?.id || null,
      };
      setProfile(assessed);
      persistProgress(assessed);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (requestSequence.current === sequence)
        setError(
          error instanceof Error
            ? error.message
            : "Please try again. Your confirmed information is still here.",
        );
    } finally {
      if (requestSequence.current === sequence) setBusy(false);
    }
  }
  function reset() {
    requestSequence.current++;
    setBusy(false);
    setError("");
    let cleared = false;
    try {
      cleared = resetProfile(window.localStorage);
    } catch {
      /* Keep a session-only fallback. */
    }
    setProfile(createProfile());
    setView("home");
    setStorageBlocked(!cleared);
    setStorageNotice(
      cleared
        ? ""
        : "The saved profile could not be cleared. Clear this site's data in your browser to remove the previous saved copy.",
    );
    setSaved(cleared ? "Saved on this browser" : "Session only");
  }
  if (!ready)
    return (
      <main className="journey-loading">
        <span className="loading-mark">R</span>
        <p>Opening your next chapter…</p>
      </main>
    );
  return (
    <JourneyShell
      view={view}
      onNavigate={navigate}
      name={profile.name}
      saved={saved}
      onReset={reset}
    >
      {storageNotice && (
        <div className="notice" role="alert">
          <Info size={18} />
          <p>{storageNotice}</p>
        </div>
      )}
      {(view === "home" || view === "journey") && (
        <JourneyDashboard
          profile={profile}
          assessment={assessment}
          onNavigate={navigate}
        />
      )}
      {view === "contract" && (
        <ContractStage
          profile={profile}
          assessment={assessment}
          onChange={updateProfile}
          onContinue={() => navigate("visa")}
          onBack={() => navigate("home")}
        />
      )}
      {view === "visa" && (
        <VisaStage
          profile={profile}
          assessment={assessment}
          onChange={updateProfile}
          onAssess={runAssessment}
          busy={busy}
          error={error}
          onBack={() => navigate("home")}
          onContract={() => navigate("contract")}
          onDocuments={() => navigate("documents")}
        />
      )}
      {view === "documents" && (
        <DocumentVault
          profile={profile}
          checklist={checklist}
          onChange={updateProfile}
          onContract={() => navigate("contract")}
          onVisa={() => navigate("visa")}
        />
      )}
      {(view === "accommodation" ||
        view === "setup" ||
        view === "benefits") && (
        <LaterStage
          key={view}
          stage={view}
          profile={profile}
          onChange={updateProfile}
          onBack={() => navigate("home")}
          onContract={() => navigate("contract")}
          onDocuments={() => navigate("documents")}
          onAssistant={() => navigate("assistant")}
          onRentalDocuments={() => navigate("rental-documents")}
          onRentalListing={() => navigate("rental-listing")}
          onAnmeldung={() => navigate("anmeldung")}
          onContinue={() =>
            navigate(
              view === "accommodation"
                ? "setup"
                : view === "setup"
                  ? "benefits"
                  : "home",
            )
          }
        />
      )}
      {view === "rental-documents" && (
        <RentalDocumentsPage
          profile={profile}
          onChange={updateProfile}
          onBack={() => navigate("accommodation")}
          onDocuments={() => navigate("documents")}
          onAssistant={() => navigate("assistant")}
        />
      )}
      {view === "rental-listing" && (
        <RentalListingPage
          profile={profile}
          onChange={updateProfile}
          onBack={() => navigate("accommodation")}
          onDocuments={() => navigate("documents")}
          onAssistant={() => navigate("assistant")}
        />
      )}
      {view === "anmeldung" && (
        <AnmeldungPage
          profile={profile}
          onChange={updateProfile}
          onBack={() => navigate("accommodation")}
          onDocuments={() => navigate("documents")}
          onAssistant={() => navigate("assistant")}
        />
      )}
      {view === "contract-overview" && (
        <JourneyDocumentOverviewPage
          kind="contract"
          profile={profile}
          onChange={updateProfile}
          onBack={() => navigate("home")}
          onDocuments={() => navigate("documents")}
          onAssistant={() => navigate("assistant")}
          onContinue={() => navigate("contract")}
        />
      )}
      {view === "visa-overview" && (
        <JourneyDocumentOverviewPage
          kind="visa"
          profile={profile}
          onChange={updateProfile}
          onBack={() => navigate("home")}
          onDocuments={() => navigate("documents")}
          onAssistant={() => navigate("assistant")}
          onContinue={() => navigate("visa")}
        />
      )}
      {view === "resources" && (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">CLARITY STARTS WITH GOOD SOURCES</p>
              <h1>Resources you can check</h1>
              <p>Official guidance behind your preparation steps.</p>
            </div>
            <BookOpen className="heading-icon" />
          </div>
          <div className="notice">
            <Info size={18} />
            <p>
              The local MVP rules cover a small set of cases for 2026. Source
              pages were reviewed on {mvpRules.reviewedAt}. Local authorities
              may require additional documents.
            </p>
          </div>
          <div className="resources-grid">
            {Object.entries(officialSources).map(([key, source]) => (
              <a
                key={key}
                className="panel resource-card"
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="resource-icon">
                  <BookOpen size={20} />
                </span>
                <h2>{source.label}</h2>
                <p>{source.scope}</p>
                <span className="text-link">
                  Visit official source <ExternalLink size={14} />
                </span>
              </a>
            ))}
          </div>
          <section className="panel legacy-note">
            <div>
              <h2>Looking ahead: Tax Refund & Benefits</h2>
              <p>
                The original financial assessment is preserved as a separate
                prototype. Integration with your Journey Profile is upcoming.
              </p>
            </div>
            <a
              className="text-link"
              href="/financial-preview"
              target="_blank"
              rel="noreferrer"
            >
              Open existing financial preview <ExternalLink size={15} />
            </a>
          </section>
        </>
      )}
      {view === "assistant" && <JourneyAssistant profile={profile} />}
    </JourneyShell>
  );
}
