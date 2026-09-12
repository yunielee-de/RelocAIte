# RelocAIte (Anspruch) — Pitch Deck Content Reference

A single place to pull copy/content from when building or updating slides — separate from the actual deck file (`anspruch-pitch-deck.html`) so non-technical teammates can read and edit the content without touching code. Reflects the built deck (13 slides) plus notes on where the broader Consumer Journey (see `consumer-journey.md`) would extend it.

---

## Naming

- **Anspruch** — the product name used throughout the deck and prototypes so far. German for "a legal claim — an entitlement you hold whether or not you know to ask for it."
- **RelocAIte** — the GitHub repo / team name (relocation + AI). Not yet used inside the deck itself — worth deciding whether the product is named Anspruch, RelocAIte, or Anspruch-by-RelocAIte before the next deck revision.

## 1. Title

**Anspruch**
"The money and rights foreign workers in Germany don't know they're owed."
*AI.WOMEN Hackathon · Hamburg · Sept 2026*

## 2. The Hook

Personal-story slide — needs the founder's own confirmed facts, not invented ones.

> "I've watched more than [10+] people move to Germany for work — and never claim a single euro of it back."
> "Relocation alone is worth up to €964, plus €643 per family member. Nobody told them it was theirs to ask for. I almost didn't ask either."

**Status**: skeleton written, needs a defensible real number (see `log.md` "still outstanding").

## 3. Problem

**Headline**: "Nothing pays you automatically."

1. Every entitlement requires an application — silence gets you nothing.
2. Backdating is narrow. Kindergeld: 6 months. Bürgergeld: none. Miss the window, lose the money.
3. The information exists — in Amtsdeutsch, the dense bureaucratic German even natives struggle with.

Closing line: *"If you don't know the term for what you're owed, you can't search for it."*

## 4. Market Size

**Headline**: "A blind spot the size of a country's workforce."

| Figure | Value |
|---|---|
| Foreign workers in Germany | 6.53M (16.7% of the workforce, end of 2025) |
| Average first-year tax refund for newcomers | €800–1,500 |
| Relocation cost flat-rate deduction | €964 (+€643 per family member) |
| Max. annual Homeoffice-Pauschale | €1,260 |

Plus a "pattern evidence" bar: Grundsicherung im Alter non-uptake (60% never claim, ≈€2bn/year unpaid) — used as systemic evidence that Germany fails to pay out what it owes, not as Anspruch's own segment data.

Sources: see `sources.json`.

## 5. Why Now

1. German administration is digitizing (the Once-Only principle).
2. LLMs can now reliably parse dense German government forms and payslips.
3. Rules keep shifting (2026's Bürgergeld → Grundsicherung reform) — more churn than one person can track alone.

## 6. Solution

**Headline**: "One input. Every entitlement, scanned."

1. **Upload** — a payslip, a lease, or a few plain-language questions answered.
2. **Scan** — matched against tax, labor-law, and subsidy rules, all at once.
3. **Claim** — a drafted application, in plain language, ready to submit.

*(This is where the broader Consumer Journey from the whiteboard — job offer check, visa, accommodation, insurance, tax, refund — would extend the "one input" story from "tax + labor rights" to "your entire move to Germany." Not yet reflected in the deck.)*

## 7. Product Demo (live)

The actual Anspruch Scan prototype: answer a few questions (or upload a document) → live "you may be able to claim €X" estimate with a per-category breakdown.

## 8. Competition, Honestly

**Headline**: "Everyone covers one slice. No one covers the person."

| | Taxfix | Sozialplattform / LeistungsLotse | Gov. calculators | **Anspruch** |
|---|---|---|---|---|
| Tax refund guidance | ✓ | — | calc only | ✓ |
| Bildungsurlaub / Bildungszeit discovery | — | — | — | ✓ |
| Relocation cost deduction | buried in filing | — | — | ✓ |
| Homeoffice-Pauschale awareness | buried in filing | — | — | ✓ |
| Aimed at working professionals | ✓ | — (low-income) | — | ✓ |
| One scan, all of the above, together | — | — | — | ✓ |

Closing line: *"Tax refund guidance is the one row Taxfix already does well — it's the proven hook that gets people in the door. We don't out-build them there. Everything below that row is white space nobody has bundled with it."*

Impact figure: **≈€260M/year** stays unclaimed from just one category (Homeoffice-Pauschale) among Germany's foreign workers — an illustrative back-of-envelope calculation, math shown, not a verified market study.

## 9. Business Model

- **B2C** — free, always. The scan is the acquisition channel and trust layer, not the revenue line.
- **B2B** — paid. Corporate HR (onboarding benefit for international hires, plus an efficiency pitch: fewer scattered ad-hoc requests for HR to process manually). Relocation providers (bundled add-on).

## 10. Go-to-Market

Foreign-worker communities in Hessen, Frankfurt & **Hamburg** (the hackathon's own network is the earliest-believer pool) → word-of-mouth referral → corporate HR partnerships. A narrow entry point, not a small market.

## 11. Financial Model

| | Year 1 — Pilot | Year 3 — National | Year 5 — Category |
|---|---|---|---|
| Free scan users | 3,000 | 60,000 | 250,000 |
| Paying B2B accounts | 3 | 45 | 190 |
| ARR | ≈€12K | ≈€240K | ≈€1.6M |

Assumptions (state on the slide): B2C 5→10% convert to a €10–15 paid filing-assist action; B2B €20–25/employee/year (avg. ~150 employees/account) plus flat relocation-partner bundle fees.

## 12. Why Me

- 10 years in FMCG commercial planning — reading regulation and margin at the same time.
- Background in data scraping and analysis — building the evidence, not just claiming it.
- The target user herself — the foreigner working in Hessen who almost let paid days expire without knowing they existed.

## 13. Ask

Three pre-drafted options, pick on the day depending on team/room:
- **If solo**: a technical teammate for 48 hours + a warm intro to a Hessen-based corporate HR contact.
- **If team forms**: two working demo screens by 6pm Day 1 + commitment to run interview validation before building further.
- **If pitching judges**: feedback on whether corporate HR is the right first payer + an intro to a relocation firm or IHK contact.

---

## Content still needed before the next deck revision

- A defensible real number for the Hook slide (§2).
- A decision on whether the Consumer Journey expansion (§6 note) belongs in this pitch or is a "later roadmap" slide.
- Product naming decision: Anspruch vs. RelocAIte vs. both.
