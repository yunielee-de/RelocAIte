# RelocAIte — Hackathon Day Log (2026-09-12)

Separated out from the full [log.md](log.md): this file covers only the work done **after the hackathon officially started** (today, 2026-09-12, Day 1 of the AI.WOMEN Hackathon, Hamburg). Everything from before the event — the 2026-09-10 prep work (market research, first pitch-deck build, prototype v1/v2, legal-scope research) — stays in `log.md` and isn't repeated here.

---

### 1. Deck exported to PDF + team overview doc
- Added print CSS to the deck (hides nav dots/counter when printing, page-break per slide, preserves the dark background/colors) and generated **anspruch-pitch-deck.pdf** via a headless-browser print (13 pages, matching the 13 slides exactly)
- Wrote **[ANSPRUCH-OVERVIEW.md](ANSPRUCH-OVERVIEW.md)** — a comprehensive English team-onboarding doc covering the problem, the pivot story, market evidence, the competitive matrix, the legal framework (RDG/StBerG/Smartlaw), itemized product scope, business model, the Year 1/3/5 financial model, go-to-market, what's been built, validation status, why-me, and what a new team member should know

### 2. Pushed to GitHub
- Connected to [github.com/yunielee-de/RelocAIte](https://github.com/yunielee-de/RelocAIte) (an empty private repo) and pushed `anspruch-pitch-deck.pdf` and `anspruch-scan.html`, creating the `main` branch. Verified via the GitHub API that both files actually landed in the repo.

### 3. Scraping pipeline + source registry
- Wrote **[scraping-and-source-pipeline.md](scraping-and-source-pipeline.md)** — separates scraping legal/regulatory content (no legal issue) from parsing user-uploaded documents (a separate OCR/Document-AI problem). Documents which tools were actually verified as installed and used (scrapling, Playwright, WebSearch/WebFetch — firecrawl was checked and found not installed in this environment) and defines the `sources.json` schema (`source_primary`/`source_secondary`/`confidence`/`method`/`next_check_due`) as the single source of truth, replacing the `BL_INFO` objects hardcoded separately across the HTML files.
- Created **[sources.json](sources.json)** — 12 entries (Hessen/Berlin/Hamburg Bildungsurlaub, Homeoffice-Pauschale, Umzugskostenpauschale, average tax refund, foreign-worker population, competitor facts), each tagged with which method sourced it.

### 4. Switched all hackathon documents to English
- Direct user feedback: all RelocAIte/hackathon documents must be in English from now on, since the repo needs to be shareable with an international team.
- Retranslated every existing Korean doc in this folder into English, including this log.
- Saved as a persistent feedback memory so future sessions default to English for this venture without being asked again.

### 5. Repo cleaned for hackathon start + renamed to RelocAIte
- Confidentiality review: flagged that the strategy docs (moat analysis, itemized differentiation, financial-model reasoning) are effectively the founder's own strategic playbook — recommended sharing conclusions with teammates, not the full reasoning trail, so they stay local rather than pushed.
- Hackathon rule surfaced: teams must start from scratch, so pre-built deliverables can't sit in the shared repo as if built during the event.
- Cleaned the GitHub repo: removed the pitch deck HTML, the field-interview tool, and all strategy docs from the pushed repo (kept locally); moved the original two files (deck PDF, scan prototype) into a new `reference/` folder explicitly labeled "private prior work, not part of the in-event build"; kept only `sources.json` (raw verified data) in `product-strategy/`.
- Standardized naming from "Anspruch" to **RelocAIte** across docs and the repo.
- Fixed dangling cross-file links in the pushed docs after the cleanup.

### 6. Per-step service summaries
- Wrote **[step-service-summaries.md](step-service-summaries.md)** — a one-line summary + service checklist for each of the 5 Consumer Journey steps, written as ready-to-use UI copy, with ✅/🟡/🆕 status markers so unbuilt features aren't shown to end users as if live.

### 7. Major scope update from real relocation data (whiteboard + personal Notion research)
- Transcribed a team whiteboard photo and a large batch of concrete detail the founder provided directly: target-audience framing (expats/expats-to-be + foreign students + "beginners in society" — **flagged as contradicting an earlier "not students" correction**, left unresolved pending team confirmation), a Tax/Support/Subsidy value-prop framing, a "step-by-step + customization" delivery model, the B2B channel reconfirmed, and a positioning statement ("AI does everything a relocation agency's case worker does, except what legally requires a lawyer").
- Added real Step 2 (visa) detail — a 9-item D-Visa document checklist and the actual 4-stage D-Visa process timeline — and a Step 3 (accommodation) neighborhood-comparison table, plus a link to a larger personal Notion page covering Blue Card application mechanics, the full 6-insurance stack, and detailed German tax/Anmeldung mechanics. Fetched and mined that page for product-relevant facts only.
- Rewrote **[consumer-journey.md](consumer-journey.md)** with the new positioning and the target-audience contradiction flagged; moved Steps 2–4 from 🆕 to 🟡 (real reference data now exists, not yet converted into `sources.json`).
- Updated **[step-service-summaries.md](step-service-summaries.md)** with concrete per-step service lists.
- Created **[relocation-reference-data.md](relocation-reference-data.md)** — §1 visa documents/D-Visa stages/Blue Card mechanics/Fiktionsbescheinigung; §2 accommodation platform comparison/scam checklist/neighborhood-comparison template/Anmeldung rules; §3 the full 6-insurance stack (resolved the whiteboard's "Haupt-"/"Legal-" ambiguity: Haupt- = mandatory public health insurance, Legal- = Rechtsschutzversicherung); §4 Tax-ID/Steuerklasse mechanics and dual-country taxation. Marked local-only pending anonymization.

### 8. Explored the teammate's real app build
- A teammate pushed an actual Next.js/TypeScript app to `development/relocaite-app` (shadcn/ui, two API routes: `assessment`, `extract-document`). Cloned and ran it locally (hosted demo required login).
- Walked the full 4-step flow live: profile form → payslip upload (synthetic extraction, no real OCR yet) → confidence-tagged confirmation screen → categorized action plan with ready-to-copy HR drafts.
- Notable: the app **independently converged on the same RDG/StBerG boundaries** this project's own research found — drafts but doesn't auto-send even the Bildungszeit request, and routes cross-border income to "Expert Review" with the same reasoning.

### 9. Contract-redline UI concept (Step 1)
- Demoed Step 1 against the founder's own CJ Foods offer research using a new Step-1 screen design shared as a screenshot.
- No literal signed contract text existed to run — only salary-negotiation notes — so built the demo as a clearly labeled illustrative example contract rather than pretending to parse a real document.
- Verified the current 2026 EU Blue Card threshold live (€50,700 general / €45,934 shortage occupations).
- Built **[step1-contract-review-mockup.html](step1-contract-review-mockup.html)** — an interactive redline-style UI: contract clauses in a document-like serif view with color-coded underlines (green/confirmed, amber/negotiate, red/missing), paired with a findings list; clicking a marked clause or its finding card highlights both in sync. 7 findings, each tied to a real legal default or a number from the founder's own research.

### 10. Adjusted the mockup to demo an eligibility-blocking finding
- Changed the example salary to €50,500 — €200 under the verified 2026 Blue Card threshold — and escalated that finding from amber to red ("fix before signing," a visa-eligibility blocker, not just a pay question), with a note that a small raise clears it.

---

## Today's deliverables

| File | Purpose | Latest Artifact |
|---|---|---|
| [ANSPRUCH-OVERVIEW.md](ANSPRUCH-OVERVIEW.md) | Full English team-onboarding overview (kept local) | — |
| [anspruch-pitch-deck.pdf](anspruch-pitch-deck.pdf) | Pitch deck, PDF export (13 pages) | — |
| [scraping-and-source-pipeline.md](scraping-and-source-pipeline.md) | Scraping approach + source-registry schema guide | — |
| [sources.json](sources.json) | Source registry — Step 5 (Tax) facts, 12 entries | — |
| [step-service-summaries.md](step-service-summaries.md) | Per-step one-line summary + service list (UI-copy-ready) | — |
| [consumer-journey.md](consumer-journey.md) | 5-step journey, positioning, target audience (⚠️ contradiction open) | — |
| [relocation-reference-data.md](relocation-reference-data.md) | Backing data for Steps 2–4 — local only, contains personal-case detail | — |
| [step1-contract-review-mockup.html](step1-contract-review-mockup.html) | Step 1 contract-redline UI concept | [Artifact](https://claude.ai/code/artifact/719b6b3f-f166-4d1d-ac34-697ed60f2bb9) |

GitHub ([github.com/yunielee-de/RelocAIte](https://github.com/yunielee-de/RelocAIte)) — cleaned for hackathon start, holds only:
- `product-strategy/sources.json`
- `development/scraping-and-source-pipeline.md`
- `reference/anspruch-pitch-deck.pdf`, `reference/anspruch-scan.html` (labeled private prior work)
- `development/relocaite-app/` — the team's actual in-progress Next.js build (pushed by a teammate)

## Still outstanding

**The founder's own tasks:**
- Payslip check (Kirchensteuer status)
- 5–8 face-to-face interviews (Field Interview tool) — kill condition: drop RelocAIte if 3+ of 5 people can't name a concrete example
- Confirm the deck Hook slide's "[10+]" figure
- Finalize the deck's Ask slide based on team/judging format
- Get the actual CJ Foods contract text if/when signed, to replace the illustrative example in `step1-contract-review-mockup.html`

**Team/product decisions:**
- Resolve the target-audience contradiction: skilled professionals only, or + foreign students? (`consumer-journey.md`)
- Convert `relocation-reference-data.md` (Steps 2–4) into proper `sources.json` entries with primary-source citations
- Decide whether/how to anonymize `relocation-reference-data.md` before sharing beyond this local folder
