# RelocAIte — Consumer Journey (whiteboard transcription, 2026-09-12)

Transcribed from a team whiteboarding session. Some handwriting is ambiguous — flagged inline with `[unclear: ...]` rather than guessed. Verify these with whoever wrote them before treating as final.

**Target statement on the board**: "to be for working / studying [in German] society" — i.e. the product is meant to serve people relocating to Germany **either for work or for study**, not employed workers only. This is a scope note worth confirming: it's broader than the "working foreigners" framing the pitch deck currently uses.

---

## 1. Technical / data-flow sketch (top of board)

A rough architecture sketch, not a finished spec — capturing it as-is for the Development track to formalize:

- **API / scraping** (circled as one block) → feeds a **DB**
- **"students"** segment, broken into **Seg 1 – Seg 5** with pass/fail-looking marks next to each (readable as some segments marked ✓ and others ✗ — exact meaning unclear, looks like a filtering or eligibility-matching step)
- These feed into a **Consumer Search** component, backed by **storage**, producing a **result**

**Read as**: a segmented-matching pipeline — scrape/collect source data → store in a DB → segment users (student personas 1–5?) → match against stored data via a search/query layer → return a result to the user. This lines up with the `sources.json` + rule-engine approach already built for the prototype, but the "Seg 1–5" student-segment idea is new and not yet reflected anywhere in the existing build.

**Development track should**: turn this into an actual data-flow diagram once the "Seg 1–5" categories are defined (are these student visa types? study levels? something else?).

## 2. Consumer Journey — 6 steps

This is the core flow on the board, labeled `<Consumer Journey>`.

### ① Job offer validity check
- Input: **Contract of employment**
- → Accepting the offer / sharing documents
- → Discuss with HR: **annual leave, education leave** (Bildungsurlaub)

### ② Visa application
- Related note on the board: **Insurance (health insurance)** is a dependency here
- 1) Which visa am I eligible for
- 2) Required documents (checklist) — education/professional qualification, employment declaration
- 3) Pre-verification of documents

### ③ Accommodation
- Documents submission to the landlord
- **Anmeldung** (registration) — including "the location of offices" [unclear: likely means where to register / which Bürgeramt]
- Rental agreement
- Note: **"we don't need Schufa"** [unclear: likely means the product doesn't require a Schufa credit check from the user — a scope/privacy decision worth confirming]
- Sub-branch: **Religion** [unclear: likely connects to Kirchensteuer/church-tax registration, which ties directly into the Kirchensteuer item already in the pitch deck's Hook]

### ④ Insurance
- **Haupt-** [unclear: likely Hauptversicherung / primary statutory insurance]
- **Legal-** [unclear: likely legal/liability insurance, e.g. Rechtsschutzversicherung]

### ⑤ Tax
- Tax ID
- Note: **need to keep receipts**

### ⑥ Tax refund
- Branches into: **Relocation**, **Home office support**
- **"Another one"** — placeholder on the board for further categories to be added later

---

## 3. What's already built vs. what's new

| Journey step | Status |
|---|---|
| ① Job offer validity check | 🆕 New — not researched or built yet |
| ② Visa application | 🆕 New — not researched or built yet |
| ③ Accommodation | 🆕 New — not researched or built yet (the Kirchensteuer/Religion note connects to existing Hook content, though) |
| ④ Insurance | 🆕 New — not researched or built yet |
| ⑤ Tax | ✅ Substantially built — this is the core of what's already researched and in `sources.json` (Umzugskostenpauschale, Homeoffice-Pauschale, average refund figures) |
| ⑥ Tax refund → Relocation / Home office support | ✅ Built — this is exactly the current Anspruch Scan prototype's scope (Bildungsurlaub, Homeoffice-Pauschale, relocation deduction, tax filing) |

**In short**: everything built so far (the pitch deck, the field-interview tool, the Anspruch Scan prototype, `sources.json`) covers steps ⑤–⑥ of this journey. Steps ①–④ are a real scope expansion — before building them, they need the same treatment steps ⑤–⑥ already got: legal-framework check (does RDG/StBerG — or a different law entirely, since visa/immigration matters are governed by AufenthG, not StBerG — apply here?), competitor re-verification, and source research into `sources.json`.

## 4. Open questions to resolve with the team before building further

- Is the target user "working OR studying," or does the deck's existing "working foreigners" framing stay as the primary wedge, with students as a later expansion?
- What do the "Seg 1–5" student segments actually mean?
- Confirm the "no Schufa needed" scope decision for Accommodation — is that a hard product constraint or an assumption?
- Visa/immigration guidance (step ②) sits under different German law than tax/labor entitlements (Aufenthaltsgesetz, not RDG/StBerG) — this needs its own legal-boundary check before any auto-drafting is added there, the same way `2026-09-10-anspruch-product-scope-and-moat.md` did for the tax/labor side.
