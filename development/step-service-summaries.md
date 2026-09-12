# RelocAIte — Per-Step Service Summaries

One-line summary + service list for each of the 5 Consumer Journey steps (see `consumer-journey.md`). Written as ready-to-use UI copy for the bottom of each step's screen — plain English, no guaranteed-outcome language, matching the app's existing trust requirements (`development/relocaite-app`'s README "Designer handoff" section).

Status markers show what's actually built (in `relocaite-app` / `sources.json`) vs. researched-but-not-built vs. not yet started. Full backing detail for 🟡 items is in `relocation-reference-data.md`.

---

## Step 1 — Job Offer Validity Check

**Summary**: Make sure your offer sets you up right before you sign — and know what to raise with HR while you still can.

**What we check:**
- 🆕 Employment contract review — does it cover relocation support, probation terms, working hours, annual leave?
- 🆕 Whether the contract reflects German labor law correctly
- 🆕 A quick visa-type check based on the offer, with suggested adjustments if something looks off
- 🆕 Entitlements you'll start accruing on day one (e.g. Bildungsurlaub/Bildungszeit days, by state)
- 🆕 Whether your employer owes you a "Faire Integration" notice — a free labor-law counseling service employers hiring from abroad are legally required to tell you about by your first day (AufenthG §45c)

## Step 2 — Visa Application

**Summary**: Know exactly which visa you need and what to submit — before you're standing in line at the Ausländerbehörde.

**What we check:** 🟡 *(now backed by a real document checklist and process map — `relocation-reference-data.md` §1)*
- 🟡 A required-documents checklist tailored to your visa route (Arbeitsvertrag, Employment Declaration, degree certificate, anabin screenshot, passport photo, combined health-insurance confirmation, Declaration of Intention, Fast-Track declaration, short-term accommodation proof)
- 🟡 Where you are in the D-Visa's 4-stage process (online submission → embassy review → in-person appointment → visa issued) and what's needed at each stage
- 🟡 Guidance into the Blue Card application once you've arrived, including which submission pattern your local Ausländerbehörde uses
- 🟡 A running countdown on what needs to happen before your D-Visa expires, and what bridges the gap (Fiktionsbescheinigung)
- 🟡 A reminder of which HR-facing documents are time-sensitive and what happens if you miss the deadline (Tax ID before first payroll, above all)

## Step 3 — Accommodation

**Summary**: Navigate German renting and registration — without needing a Schufa history you don't have yet.

**What we check:** 🟡 *(now backed by real platform/criteria data — `relocation-reference-data.md` §2)*
- 🟡 Interactive chat: while you're evaluating a listing, we check it against what a smooth relocation actually needs (Anmeldung support confirmed, commute, backup transit, safety, deposit terms)
- 🟡 A landlord-ready message template to confirm Anmeldung support before you book
- 🟡 A scam checklist before you send any money
- 🟡 Anmeldung timing and requirements once you've signed (the 14-day rule, what a Wohnungsgeberbestätigung is, what happens if you miss it)
- 🆕 Church-tax (Kirchensteuer) registration awareness at the same time, so you don't opt in by accident

## Step 4 — Insurance

**Summary**: Pick the right insurance the first time — not just the one that's easiest to sell you.

**What we check:** 🟡 *(now a fully specified 6-insurance stack — `relocation-reference-data.md` §3)*
- 🟡 Whether your mandatory public health insurance is set up correctly and on time
- 🟡 Whether personal liability insurance (Haftpflicht) is in place — not legally required, but treated as essential
- 🟡 Whether legal insurance (Rechtsschutz) is worth adding once you're settled, especially for labor disputes
- 🟡 Household contents insurance once you move into long-term housing
- 🟡 Optional add-ons (dental, income protection) with realistic cost/timing so you're not oversold something week one

## Step 5 — Tax

**Summary**: Find every entitlement tied to your move and your job, get a ready draft for what you can act on yourself, and get pointed to the right expert or app for what we shouldn't decide for you.

**What we check:** ✅ *(this step is where prior research and the current app build are concentrated)*
- ✅ Bildungsurlaub/Bildungszeit days remaining, by state (Hessen, Berlin, Hamburg live; more states planned) — with a ready-to-copy HR request draft
- ✅ Relocation cost deduction check (up to €964 + €643 per family member)
- ✅ Homeoffice-Pauschale eligibility and estimate (up to €1,260/year)
- ✅ Cross-border income flagged for expert review — we don't decide this, we route you to a licensed tax adviser with what to bring (confirmed as the right call — see `relocation-reference-data.md` §4 for why this case is genuinely too complex to auto-decide)
- ✅ A tax-filing readiness check (have you filed yet, what's missing) — the actual filing happens in a dedicated tax-refund app (e.g. Taxfix) or with an adviser, not in RelocAIte
- 🟡 A Tax-ID countdown: flags the month-4 deadline before you get auto-switched to the punitive withholding class, with fast-track steps to get your Tax ID sooner
- 🟡 A heads-up on the Rundfunkbeitrag (public broadcasting fee) registration that arrives automatically after Anmeldung

---

## Notes for whoever turns this into UI copy

- Keep the ✅/🟡/🆕 status internal — don't show "not built yet" language to end users. Show 🟡 items as real features (the underlying facts are solid); for 🆕 items, either hide the feature until it's built or label it "coming soon."
- Step 5's list should stay in sync with `sources.json`; Steps 2–4 should get their own `sources.json`-equivalent entries once `relocation-reference-data.md`'s content is verified against primary sources.
- Match the app's own trust rules: never say "you qualify" — say "may qualify," "worth checking," "flagged for review."
