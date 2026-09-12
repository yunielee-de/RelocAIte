# Anspruch — Team Overview

*An·spruch, noun (German): a legal claim — an entitlement you hold whether or not you know to ask for it.*

Anspruch finds the money and rights that foreign workers in Germany are entitled to but don't know about — tax refunds, paid education leave (Bildungsurlaub/Bildungszeit), home-office allowances, relocation cost deductions — and turns "you might be owed this" into a submitted claim, in one place, every year.

Built for the AI.WOMEN Hackathon (Hamburg, Sept 12–13, 2026).

---

## 1. The problem

Entitlements in Germany don't arrive automatically. You have to apply, backdating is narrow (Kindergeld: 6 months; Bürgergeld: none), and the information that tells you what you're owed exists only in dense bureaucratic German (Amtsdeutsch) — often scattered across your employer's HR handbook, the Finanzamt's forms, and your own payslip, with no single place that connects them.

If you don't know the term for what you're owed, you can't search for it.

## 2. How we got here (the pivot)

The original concept targeted low-income social welfare (Wohngeld, Grundsicherung) — non-application rates there are extreme (37–80%+ depending on the benefit) and the emotional case is strong. Competitive re-research found this space is already claimed: **Sozialplattform.de** is a government-run federal platform (NRW-led, confirmed via BMAS) specifically for this segment, and **LeistungsLotse** is a funded startup targeting the same low-income users (renters, single parents, pensioners on Grundsicherung). Going there means competing directly with government infrastructure.

The pivot: instead of low-income welfare, target **working foreigners in Germany** — a segment with real money at stake (tax deductions, paid leave, relocation costs) that is not covered by any existing player, and that the founder is personally part of. The founder's own near-miss — almost letting paid education-leave days expire without knowing they existed — is the origin story for the product.

## 3. Market evidence

- **6.53 million foreign workers in Germany** (16.7% of the total workforce, end of 2025) — up more than 2x since 2010. (Bundesagentur für Arbeit / Destatis, via Mediendienst Integration)
- **Average first-year tax refund for newcomers: €800–1,500** — higher than the general average (~€1,095–1,240) because full relocation costs are deductible in the first year. (VLH, Restio, Taxfix live figures)
- **Relocation cost flat-rate deduction (2026): €964** for the employee + **€643 per accompanying family member** — no receipts required. (Lohnsteuer-kompakt)
- **Homeoffice-Pauschale: €6/day, capped at €1,260/year** (210 days). Enforcement of documentation requirements tightened in 2026, which raises the odds people under-claim without dedicated help.
- **Systemic pattern evidence** (not this product's exact segment, but the same country failing to pay out what it owes): for old-age basic security (Grundsicherung im Alter), ~60% of eligible households never apply — about 625,000 households, ≈€2 billion/year staying unpaid. (DIW Berlin 2019, re-confirmed via bpb.de)

## 4. Competitive landscape — and the white space

Live-verified (not just desk research) by walking through each competitor's actual product:

| | Taxfix | Sozialplattform / LeistungsLotse | Government calculators | **Anspruch** |
|---|---|---|---|---|
| Tax refund guidance | ✓ | — | calculator only | ✓ |
| Bildungsurlaub / Bildungszeit discovery | — | — | — | ✓ |
| Relocation cost deduction | buried inside filing | — | — | ✓ |
| Homeoffice-Pauschale awareness | buried inside filing | — | — | ✓ |
| Aimed at working professionals | ✓ | — (low-income only) | — | ✓ |
| One scan, all of the above, together | — | — | — | ✓ |

- **Taxfix**: 10M+ tax returns filed, €5.1bn+ refunded, €1,240 avg. refund (live figures from taxfix.de). Has a dedicated Expats page. Covers Homeoffice-Pauschale and moving costs — but only once you're already inside a tax return, and only if you already know to look for them. Zero coverage of non-tax rights like Bildungsurlaub.
- **Sozialplattform.de**: confirmed live — its Sozialleistungsfinder questionnaire opens with birthdate, citizenship, and "living situation" (couple / single parent / single). Its entire model is Sozialleistungen (Wohngeld, Grundsicherung, family benefits). No tax or labor-law questions anywhere in scope.
- **LeistungsLotse**: same low-income segment — 95% of its senior users apply for Grundsicherung. Confirmed different segment.

**Tax refund guidance is the one row Taxfix already does well — it's the proven hook that gets people in the door. Anspruch doesn't try to out-build Taxfix there.** Everything below that row is white space nobody has bundled together.

## 5. Legal framework — what's actually buildable

This is the part that explains *why* nobody has built this yet, and it sets the real boundary of the product (not a hackathon simplification — a permanent structural fact of the German market).

Two different laws apply, and they behave very differently:

- **RDG (Rechtsdienstleistungsgesetz)** — governs everything *except* tax. A regulated "legal service" requires an **individualized legal review of a specific case**. Generic, self-service tooling does not cross this line.
- **StBerG (Steuerberatungsgesetz)** — governs tax matters specifically, and is much stricter: it covers **any supporting activity in fulfilling a tax obligation, regardless of whether it's automated**. A Hamburg court ruled in 2016 that even automated preparation of a VAT filing falls under the tax advisor's monopoly.

The key precedent: **BGH "Smartlaw" ruling (Sept 2021, I ZR 113/20)** — the German Federal Court of Justice ruled that a Q&A-driven contract generator is *not* a regulated legal service; it's comparable to a form template collection ("Formularhandbuch"), because it doesn't perform an individualized legal review of one person's specific case. This is the precedent that makes Anspruch's "answer some questions → get a drafted document" flow legal.

**What this means in practice:**

- Anspruch can legally scan, classify, and **auto-draft** documents (a Bildungsurlaub request letter, a Steuererklärung checklist) — this is squarely inside the Smartlaw precedent, as long as the product is framed as orientation/self-service, not a binding determination of eligibility ("you may qualify," never "you are confirmed eligible").
- Anspruch **cannot** review, finalize, and submit a tax filing *on the client's behalf as a paid service* without a license (a Steuerberater on staff, or a Lohnsteuerhilfeverein structure) — this is exactly why Taxfix partners with licensed tax advisors for its "Expert" tier while its cheaper "Basic" tier stays strictly self-service.
- For non-tax items — most notably Bildungsurlaub — there is **no submission restriction at all**, because the destination is an internal email to your own employer's HR, not a government filing. Anspruch can legally draft **and send** that email on the user's behalf with their consent. This is a real, demonstrable automation ceiling difference between categories, not a hackathon shortcut.

## 6. Product scope

| Feature | Legal status | What it needs to build | What the user gets | Confirmed missing from the market? |
|---|---|---|---|---|
| Unified scan (tax + labor rights + subsidies in one intake) | Legal — same "orientation, not determination" framing Sozialplattform already uses | Rule engine + ongoing per-category legal research | One place instead of five | Yes — confirmed via live competitor walkthroughs |
| Document upload + auto-extraction | Legal (GDPR governs handling, not StBerG/RDG) | Off-the-shelf payslip OCR APIs (95–99%+ accuracy already commercially available — Mindee, Affinda, Klippa) + LLM structuring | Upload one document instead of answering 8 questions | Partially — Taxfix extracts tax fields only, not cross-category |
| Auto-drafted non-tax documents (e.g. Bildungsurlaub letter) | Legal — Smartlaw precedent directly on point; the safest part of the product | Per-state template library (content work, not deep engineering) | Turns "I should ask HR" into "here's the email, just send it" | Yes — nobody auto-generates this |
| Auto-drafted tax checklist (self-service) | Legal, if the user reviews/submits it themselves | Map extracted data to Steuererklärung line items; ELSTER field pre-fill is a further, optional step (Taxfix already has an ELSTER API integration to reference) | Removes the #1 reason newcomers don't file: not knowing they should | No — this exact piece is already well served by Taxfix/Wundertax/Smartsteuer. **This is the proven hook, not the differentiator.** |
| Annual re-scan / retention ("we got you, see you next year") | No regulatory issue — standard product feature | Accounts, saved profile (GDPR-compliant), reminder system | Removes the burden of remembering to check every year | Yes — no competitor proactively re-engages a returning user across multiple entitlement types |
| B2B (corporate HR benefit / relocation-firm bundle) | No regulatory issue — standard commercial contracting | Multi-tenant accounts, HR-facing usage dashboard | HR: cheap, high-perceived-value benefit *and* fewer scattered ad-hoc requests to process manually | Yes — no packaged "we surface everything your foreign hires are missing" product found |

**Roadmap:**
- **v1 (no license required)**: full scan, auto-draft for all categories, ELSTER field pre-fill, and full send-automation for non-tax items (Bildungsurlaub). Tax items stop at "checklist/pre-filled, you submit it."
- **v2 (after a licensed-partner structure — own Lohnsteuerhilfeverein, or partnership with one, mirroring Taxfix's Expert tier)**: full end-to-end tax filing on the client's behalf.

## 7. Business model

- **B2C — free, always.** The scan costs nothing. It's the acquisition channel and the trust layer, not the revenue line — the target user (a newly-arrived professional) can't be relied on to pay upfront for something they don't yet know they need.
- **B2B — paid.**
  - **Corporate HR**: sold as an onboarding benefit for international hires, priced per employee/year (~€20–25). Secondary pitch to the same buyer: it reduces HR's own overhead from handling scattered, incomplete Bildungsurlaub requests manually.
  - **Relocation providers**: bundled add-on to services they already charge for, flat annual fee.
  - **IHK (chambers of commerce)**: aligned with their policy mandate to attract and retain foreign skilled workers.
- **Who will *not* pay**: government bodies that receive the applications (Finanzamt etc.) have no budget incentive to pay for more filings — more applicants means more processing burden for them, not less. The "the receiving org becomes a customer" logic holds for HR/relocation firms/IHK (who benefit operationally or strategically from repeat volume) but not for tax authorities.

## 8. Financial model (illustrative — assumptions shown, not verified financials)

| | Year 1 — Pilot | Year 3 — National | Year 5 — Category |
|---|---|---|---|
| Free scan users | 3,000 | 60,000 | 250,000 |
| Paying B2B accounts | 3 | 45 | 190 |
| ARR | ≈€12K | ≈€240K | ≈€1.6M |
| Focus | Hessen, Frankfurt & Hamburg — prove the scan finds real money, land 3 corporate HR pilots | IHK and relocation-firm channels live; first renewals prove retention | Category default for onboarding international hires; adjacent markets (Austria, Netherlands) open next |

Assumptions: B2C, 5→10% of free-scan users convert to a €10–15 paid filing-assist action. B2B, €20–25/employee/year via corporate HR (avg. ~150 employees/account), plus flat annual bundle fees from relocation-provider partners.

**Illustrative "size of the problem" figure for the pitch**: even taking just *one* of the five entitlement categories — Homeoffice-Pauschale — if only 10% of Germany's 6.53M foreign workers are missing an average €400/year each, that's **≈€261M/year** left unclaimed. Back-of-envelope, assumptions shown, not a verified market study — and the other four categories aren't even counted in it.

## 9. Go-to-market

Foreign-worker communities in Hessen, Frankfurt & **Hamburg** (the hackathon's own network is the earliest-believer pool) → word-of-mouth referral inside those same networks → corporate HR partnerships bundling the tool into onboarding for international hires. A narrow entry point, not a small market.

## 10. What's been built

Three working artifacts exist:

1. **The pitch deck** — 13 slides covering hook, problem, market size, why-now, solution, live product demo, honest competition matrix + impact figure, business model, go-to-market, financial model, why-me, and ask. Built as an interactive HTML deck, not static slides.

2. **A field-interview tool** — a 20-second tap-through instrument meant to be handed to people face-to-face at the hackathon: "did you ever lose out on money or time in Germany because you didn't know?" → if yes, what/how much/category → an optional "want to see what you might be able to claim?" teaser that runs the same estimator, so interviewees get value back, not just give data. Records locally on the interviewer's own device (not a public survey — the shared-database approach was ruled out because it only works for people signed into the same org, which doesn't fit random hackathon conversations); exports as CSV.

3. **A product prototype** — the actual intended user flow: **Upload → Confirm extracted details → Classify (animated scan across categories) → Route + Draft (tap a category to see exactly where to submit it and a ready-made draft) → Retain ("we got you, see you next year")**. Demonstrates the real automation boundary live: the Bildungsurlaub category has a working "review & send to HR" button (fully automatable — no government submission involved), while tax-related categories stop at "copy the draft" with an explicit note that submission is the user's own step (the StBerG boundary described in section 5). This is a rule-based estimator, not a production OCR/LLM pipeline — but the computation logic, category coverage, and per-state legal rules (Hessen, Berlin, Hamburg all have materially different Bildungsurlaub structures) are real and demo-ready.

All three share one visual system (deep ink-green + brass-gold palette, Fraunces/IBM Plex Sans/IBM Plex Mono, a document/ledger visual language playing on "Anspruch" meaning a legal claim) so they read as one product, not three disconnected demos.

## 11. Validation status — what's confirmed vs. still open

**Confirmed this session:**
- Competitor gap (Taxfix/Sozialplattform/LeistungsLotse) — live-verified by walking their actual products, not just reading about them.
- Market-size figures — sourced from Destatis/Bundesagentur für Arbeit, VLH, Lohnsteuer-kompakt.
- Legal buildability — grounded in the actual RDG/StBerG statutes and the Smartlaw BGH ruling, not assumption.
- Per-state Bildungsurlaub rules for Hessen, Berlin, and Hamburg (materially different: Hamburg pools 10 days over a 2-year cycle rather than 5 days/year).

**Still open — the founder's own validation, not something research can substitute for:**
- Payslip check (Kirchensteuer status) + confirming the Bildungsurlaub procedure with her own employer — this is also literally the origin story for the deck's hook slide.
- 5–8 face-to-face interviews asking "did you lose out on something in Germany because you didn't know?" — **kill condition: if 3+ out of 5 people can't name a specific concrete example, the underlying demand claim doesn't hold and the direction should be dropped.**
- Hands-on test of Taxfix and Sozialplattform as a signed-up user (only their public-facing flows have been verified so far).

## 12. Why the founder

10 years in FMCG commercial planning (reading regulation and margin at the same time) + a data scraping/analysis background (building the evidence, not just claiming it) + being the target user herself — she's the foreigner working in Hessen who almost let paid education-leave days expire without knowing they existed.

## 13. What a new team member should know

- **Don't try to out-build Taxfix on tax filing.** That fight is already lost to a company with 10M+ filings and a licensed-advisor structure. The tax piece is the acquisition hook, not the product's edge.
- **The real moat is not the technology.** Document parsing and auto-drafting are commercially solved problems (OCR vendors exist off the shelf; the Smartlaw precedent means auto-drafting isn't even legally novel). What compounds over time and is genuinely hard to fast-copy: the accumulated per-category legal research, outcome data (did HR actually approve it? did the Finanzamt accept the deduction?), slow-to-build B2B relationships (12–18 month sales cycles), and the annual retention loop. Be honest about this with investors rather than overselling a "moat" that only exists after a few years of operating.
- **Every new entitlement category is a research task before it's an engineering task.** Confirm the actual state law, the actual application channel, and the actual deadline before writing a template — get it wrong once and the trust asset (this is explicitly a "trust good" category) is expensive to rebuild.
- **The StBerG line is the one legal boundary that's easy to cross by accident.** Any copy that says "you qualify" instead of "you may qualify," or any flow that submits a tax-related item without the user's own final action, risks it. When in doubt, default to the safer framing.
- **The kill condition is real, not rhetorical.** If the founder's own interview round comes back without concrete stories, the honest move is to revisit the direction, not to push the deck forward anyway.
