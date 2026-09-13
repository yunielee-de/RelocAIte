"use client";

import Image from "next/image";
import { ArrowRight, Bell, BookOpen, ChevronDown, FileText, House, Map, Menu, MessageCircle, RotateCcw, Search, ShieldCheck, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { StageId } from "@/lib/journey-profile";

export type JourneyView = "home" | "journey" | "documents" | "assistant" | "resources" | "contract-overview" | "visa-overview" | "rental-documents" | "rental-listing" | "anmeldung" | StageId;
const navigation = [
  { id: "home", label: "Home", icon: House }, { id: "journey", label: "My Journey", icon: Map },
  { id: "documents", label: "Documents", icon: FileText }, { id: "assistant", label: "AI Assistant", icon: MessageCircle },
  { id: "resources", label: "Resources", icon: BookOpen },
] as const;

export function JourneyShell({ view, onNavigate, name, saved, onReset, children }: {
  view: JourneyView; onNavigate: (view: JourneyView) => void; name: string; saved: string; onReset: () => void; children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const referenceUtility = ["accommodation", "contract-overview", "visa-overview", "rental-documents", "rental-listing", "anmeldung"].includes(view);
  function navigate(next: JourneyView) { onNavigate(next); setMenuOpen(false); }
  return <div className={`journey-app view-${view}`}>
    <a href="#journey-content" className="skip-link">Skip to content</a>
    <div className="mobile-bar">
      <button onClick={() => navigate("home")} aria-label="RelocAIte home"><Image src="/relocaite-logo-transparent.png" alt="RelocAIte" width={180} height={60} priority unoptimized /></button>
      <Button variant="ghost" size="icon" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
    </div>
    {menuOpen && <button className="nav-overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`journey-sidebar ${menuOpen ? "is-open" : ""}`}>
      <button className="sidebar-brand" onClick={() => navigate("home")} aria-label="RelocAIte home"><Image src="/relocaite-logo-transparent.png" alt="RelocAIte" width={180} height={60} priority unoptimized /></button>
      <p className="sidebar-caption">YOUR NEW CHAPTER</p>
      <nav aria-label="Main navigation" className="sidebar-nav">{navigation.map(item => {
        const active = view === item.id || item.id === "journey" && ["contract", "contract-overview", "visa", "visa-overview", "accommodation", "rental-documents", "rental-listing", "anmeldung", "setup", "benefits"].includes(view);
        return <button key={item.id} onClick={() => navigate(item.id)} aria-current={active ? "page" : undefined} className={active ? "active" : ""}><item.icon size={20} /><span>{item.label}</span>{item.id === "assistant" && <span className="nav-tag">Preview</span>}</button>;
      })}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><ShieldCheck size={22} /><strong>One profile.<br />One journey.</strong><p>No repeated paperwork.</p></div>
        <button className="reset-button" onClick={() => resetDialog.current?.showModal()}><RotateCcw size={17} /> Reset local profile</button>
        <p className="sidebar-storage">Saved on this browser.<br />Original documents are not stored.</p>
      </div>
    </aside>
    <div className="journey-workspace">
      <header className="workspace-topbar">{referenceUtility ? <><label className="accommodation-search"><Search /><span className="sr-only">Search</span><input placeholder="Search anything..." aria-label="Search anything" /></label><div className="accommodation-user"><button aria-label="Notifications"><Bell /></button><span className="avatar" aria-label={name || "Your profile"}>{name.trim().slice(0, 1).toUpperCase() || "R"}</span><strong>{name || "Your profile"}</strong><ChevronDown /></div></> : <><span className="topbar-label">Your move to Germany <ArrowRight size={14} /></span><div className="topbar-user"><span className="save-indicator" role="status"><span />{saved}</span><span className="avatar" aria-label={name || "Your profile"}>{name.trim().slice(0, 1).toUpperCase() || "R"}</span></div></>}</header>
      <main id="journey-content" className="workspace-content" tabIndex={-1}>{children}</main>
      <footer className="workspace-footer">RelocAIte · A little clarity for your next big step.<span>Hackathon preview · Preparation guidance</span></footer>
    </div>
    <dialog ref={resetDialog} aria-labelledby="reset-title" className="panel reset-dialog"><h2 id="reset-title">Start a new journey?</h2><p>This removes this browser’s RelocAIte profile and checklist progress. Your files on disk are unaffected.</p><div className="button-row"><Button autoFocus variant="outline" onClick={() => resetDialog.current?.close()}>Keep my profile</Button><Button onClick={() => { onReset(); resetDialog.current?.close(); }}>Reset profile</Button></div></dialog>
  </div>;
}
