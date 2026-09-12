# Anspruch — Work Log

Work log scoped to this folder (`Business/ventures/ai-women-hackathon/`). Anspruch pitch deck and prototype work for the AI.WOMEN Hackathon (Hamburg, 2026-09-12–13).

---

## 2026-09-10

### 1. Background check
- Reviewed the Notion page (AI.WOMEN Hackathon — Business Plan Option 2 & Prep). Already pivoted once on 9/9: "low-income social welfare discovery" → "money/rights that working foreigners in Germany miss out on without knowing" (Anspruch).
- The Notion doc itself states a principle: "don't bring this document as the answer — drop it if unvalidated." The founder's own validation (payslip check, 5–8 interviews, hands-on use of Taxfix/Sozialplattform) remained an in-progress item throughout the session.

### 2. Market & competitor research
- Live-verified Taxfix.de and Sozialplattform.de via WebSearch + Playwright (marketing/pricing/onboarding questionnaires, without signing up for an account).
- Output file: **[market-research.md](market-research.md)**
  - Key figures: 6.53M foreign workers in Germany (16.7%), average first-year tax refund €800–1,500, relocation cost flat-rate deduction €964 (+€643/family member), Homeoffice-Pauschale up to €1,260/year
  - Competitor re-confirmation: Sozialplattform/LeistungsLotse are low-income only (their questionnaire opens with "birthdate, citizenship, living situation" — zero tax/labor-rights questions); Taxfix is tax-only (Homeoffice-Pauschale/relocation costs are only usable if "you already know to file")

### 3. First pitch deck build
- Plan file: **[pitch-deck-plan.md](pitch-deck-plan.md)** — 12-slide structure mapping, marking which slides were buildable immediately
- **[anspruch-pitch-deck.html](anspruch-pitch-deck.html)** — first 8 slides built (1, 3, 4, 5, 6, 9, 10, 11) — German bureaucratic-document/statute (§) tone, deep ink-green + brass-gold palette, Fraunces + IBM Plex fonts

### 4. Delegable-task audit + execution
- User request: list what the user does manually that could be delegated
- Executed: live re-verification of Taxfix/Sozialplattform, filled in content for Slides 2 (Hook), 7 (Product Demo), 8 (Competition), 12 (Ask)
- **[anspruch-field-interview.html](../development/anspruch-field-interview.html)** — new build: a 20-second tap-through interview tool for recording answers face-to-face at the hackathon (localStorage storage, CSV export)

### 5. Money-focused hook + interactive interview tool
- Rewrote Slide 2 (Hook) around "I've watched more than 10 people never get their relocation costs back"
- Added a calculator-based tally to the interview tool

### 6. Bug fix + Berlin added
- **Bug**: "Clear all responses" didn't work → cause: `confirm()` was silently blocked inside the sandboxed iframe → fixed with a two-tap confirmation pattern
- Strengthened Slide 8's live competitor re-verification (real Taxfix figures: 10M+ filings, €5.1bn+ refunded, €1,240 average)
- Added a "budget vs. actually claimed" bar chart to Slide 4 (Grundsicherung im Alter: 40% claim it / 60% never do, ≈€2bn/year unpaid, DIW 2019)
- Added **Berlin** Bildungszeit (BiZeitG 2021) rules — same 5 days/year as Hessen, but different terminology (Bildungszeit), a ≤20-employee refusal exception, and a 10-day combination option → reflected in both the deck's Slide 7 calculator and the interview tool's calculator

### 7. Slide 8 turned into a matrix + Hamburg added
- Rebuilt Slide 8 from a text list into a 5-feature × 4-competitor matrix table, added a "≈€260M/year" impact box (assumptions shown explicitly: 6.53M × 10% missing it × €400 = €261M, labeled "back-of-envelope, not a verified market study")
- Added **Hamburg** Bildungsurlaub — confirmed a structure completely different from Hessen/Berlin (not 5 days/year but **10 days over a 2-year cycle**, starting Jan 1 after hire) → added maxDays/expiry branching to the calculator logic (both the deck and the interview tool)

### 8. GTM Hamburg mention + Financial Model slide + expanded to 13 slides
- Slide 10 (Go-to-Market): "Hessen, then outward" → "Hessen **and Hamburg**, then outward"
- Inserted new Slide 11, **"Financial Model"** (renumbering the deck from 12 to 13 slides): Year 1 (≈€12K ARR, 3,000 free users, 3 B2B pilots) / Year 3 (≈€240K ARR, 60K users, 45 accounts) / Year 5 (≈€1.6M ARR, 250K users, 190 accounts) — assumptions (B2C conversion 5→10%, B2B €20–25/employee/year) disclosed transparently in the caption

### 9. Prototype v1 → strategic research → prototype v2
- **[anspruch-scan.html](../development/anspruch-scan.html)** v1 built: Landing → Form → Scanning animation → Results (the rule-based calculator packaged to look like a product)
- User feedback: "this is just a different loading screen from the interview tool/deck — how does this make money?" → requested research into differentiation, legality, and feasibility
- **Key research finding**: German RDG (Rechtsdienstleistungsgesetz) + StBerG (Steuerberatungsgesetz) + the **BGH Smartlaw precedent (2021, I ZR 113/20)** — a tool that auto-generates a document from Q&A answers is "legal" (a form collection, not legal advice). However, anything tax-related is far stricter because StBerG applies regardless of automation (a Hamburg court ruled even automated VAT filing falls under the tax advisor's monopoly).
- Output file: **[product-scope-and-moat.md](product-scope-and-moat.md)** — "why nobody's done this" (legal structure + destination fragmentation + no single category having enough economics on its own), a legal-status/build-requirement/customer-value/market-gap breakdown table per service item, differentiation (moat) analysis, feasibility (confirmed OCR APIs are already commercial), and a check on the "receiving institution as customer" idea (valid for HR/IHK, not valid for Finanzamt)
- Rebuilt **anspruch-scan.html v2**: Upload → Confirm (verify extracted values) → Classify (scanning animation) → Route+Draft (per-item accordion — tap to reveal "where to submit" + an actual document/email draft + copy button) → Retain ("We got you, see you next year" + email reminder)
- Added one line to Slide 8: "tax refund guidance = an already-proven hook, everything else = white space nobody has bundled"

### 10. v1/v2 roadmap clarified + automation boundary made visible
- Question: "will the real product handle the full paperwork?" → clarified that the automation ceiling differs by category:
  - **Bildungsurlaub-type items**: not a government submission (internal email) → fully automatable including sending, no legal restriction
  - **Tax-related items**: filling in data (ELSTER field pre-fill) can be automated, but **only the user can submit** — a real legal ceiling that can't be crossed without an StBerG license
  - **Handling the entire tax filing**: not possible in v1 (no license), possible in v2 (Lohnsteuerhilfeverein/tax-advisor partnership, same structure as Taxfix Expert)
- Added this as Section 8 of the analysis doc
- Reflected in the prototype: added a **"Review & send to HR →"** button only to the Bildungsurlaub item (switches to a "✓ Sent to HR" state on click) + a "✓ We can send this for you" note. Tax-related items keep only "Copy draft" + a "You submit this yourself (Steuerberatungsgesetz reserves that step)" note — so the automatable/non-automatable boundary is visibly contrasted live on the same screen

## 2026-09-12

### 11. Deck exported to PDF + team overview doc
- Added print CSS to the deck (hides nav dots/counter when printing, page-break per slide, preserves the dark background/colors) and generated **anspruch-pitch-deck.pdf** via a headless-browser print (13 pages, matching the 13 slides exactly)
- Wrote **[ANSPRUCH-OVERVIEW.md](ANSPRUCH-OVERVIEW.md)** — a comprehensive English team-onboarding doc covering the problem, the pivot story, market evidence, the competitive matrix, the legal framework (RDG/StBerG/Smartlaw), itemized product scope, business model, the Year 1/3/5 financial model, go-to-market, what's been built, validation status (confirmed vs. still open, including the kill condition), why-me, and what a new team member should know

### 12. Pushed to GitHub
- Connected to [github.com/yunielee-de/RelocAIte](https://github.com/yunielee-de/RelocAIte) (an empty private repo) and pushed `anspruch-pitch-deck.pdf` and `anspruch-scan.html`, creating the `main` branch. Verified via the GitHub API that both files actually landed in the repo (an earlier claim of "done" was made before the push had actually run — corrected once the user flagged it).

### 13. Scraping pipeline + source registry
- Wrote **[scraping-and-source-pipeline.md](../development/scraping-and-source-pipeline.md)** — distinguishes scraping legal/regulatory content (this document's scope, no legal issue) from parsing user-uploaded documents (a separate OCR/Document-AI problem). Recommends the already-installed `firecrawl` skill family (`firecrawl-map` → `firecrawl-agent` → `firecrawl-monitor`) and defines a `sources.json` schema (`source_primary`/`source_secondary`/`confidence`/`next_check_due`) as the single source of truth to replace the `BL_INFO` objects currently hardcoded separately in all three HTML files.
- Created **[sources.json](sources.json)** — 12 entries populated with everything verified this session (Hessen/Berlin/Hamburg Bildungsurlaub, Homeoffice-Pauschale, Umzugskostenpauschale, average tax refund, foreign-worker population, and competitor facts), following that schema.

### 14. Switched all hackathon documents to English
- User feedback, direct and sharp: all Anspruch/hackathon documents must be written in English from now on, since the repo needs to be shareable with an international team — Korean docs don't work there (the pitch deck itself was already built in English for the same reason).
- Retranslated every existing Korean doc in this folder into English: `market-research.md`, `pitch-deck-plan.md`, `product-scope-and-moat.md`, `scraping-and-source-pipeline.md`, and this log.
- Saved as a persistent feedback memory so future sessions default to English for this venture without being asked again.

---

## Deliverable inventory

| File | Purpose | Latest Artifact |
|---|---|---|
| [market-research.md](market-research.md) | Market & competitor data (sourced) | — |
| [pitch-deck-plan.md](pitch-deck-plan.md) | Pitch deck 12-slide mapping plan | — |
| [product-scope-and-moat.md](product-scope-and-moat.md) | Product scope, legality, differentiation, feasibility analysis | — |
| [scraping-and-source-pipeline.md](../development/scraping-and-source-pipeline.md) | Scraping approach + source-registry schema guide | — |
| [sources.json](sources.json) | The actual source registry (12 verified facts) | — |
| [ANSPRUCH-OVERVIEW.md](ANSPRUCH-OVERVIEW.md) | Full English team-onboarding overview | — |
| [anspruch-pitch-deck.html](anspruch-pitch-deck.html) | Pitch deck (13 slides) | [Artifact](https://claude.ai/code/artifact/3962fe71-5456-4a3b-8aaf-a044bb40e417) |
| [anspruch-pitch-deck.pdf](anspruch-pitch-deck.pdf) | Pitch deck, PDF export (13 pages) | — |
| [anspruch-field-interview.html](../development/anspruch-field-interview.html) | Face-to-face hackathon interview tool | [Artifact](https://claude.ai/code/artifact/d838805c-e904-4701-9215-86247cdef5c3) |
| [anspruch-scan.html](../development/anspruch-scan.html) | Product prototype (Upload→Classify→Route→Draft→Retain) | [Artifact](https://claude.ai/code/artifact/0403b647-f414-4804-b3ac-c824ccd14b2e) |

GitHub: [github.com/yunielee-de/RelocAIte](https://github.com/yunielee-de/RelocAIte) (pitch deck PDF + prototype pushed so far)

## Still outstanding (the founder's own tasks)

- Payslip check (Kirchensteuer status) — share it and it can be read directly
- 5–8 face-to-face interviews (collected via the Field Interview tool) — kill condition: drop Anspruch if 3+ of 5 people can't name a concrete example
- Confirm the founder's own facts for Slide 2 (Hook) — the "[10+]" figure, and how many years it's actually been
- Finalize Slide 13 (Ask) based on team/judging format on hackathon day
