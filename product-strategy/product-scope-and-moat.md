# Anspruch — Product Scope, Differentiation & Feasibility Analysis (2026-09-10)

Questions: (1) what exactly does the product include (2) how does it differentiate from copycats (3) why hasn't an existing service touched this (4) is it feasible for the founder to build (5) can the receiving institutions also become customers.

## 0. The conclusion, up front

**The real answer to "why hasn't anyone done this" is not a segment difference — it's legal structure.** Germany has a clear, court-settled boundary between "automated document drafting (Formularsammlung)" and "legal/tax advice on an individual case (Rechtsdienstleistung)," and this boundary determines **exactly how far Anspruch can be built.** Within that boundary, the "upload → classify A/B/C → where to submit XYZ → document draft" flow the user asked for is **legally buildable, no issue.** What crosses the line is definitive language like "we'll submit on your behalf" or "you are confirmed eligible."

## 1. The core legal basis (the real reason nobody has done this)

### 1-1. Two different laws apply differently

| Law | Applies to | Threshold |
|---|---|---|
| **RDG** (Rechtsdienstleistungsgesetz) | Non-tax areas like Bildungsurlaub, relocation costs | Regulated only if there's "individualized legal review of a specific case." Free otherwise. |
| **StBerG** (Steuerberatungsgesetz) | Everything tax-related | **Regardless of whether it's automated, "any activity assisting in the fulfillment of a tax obligation"** is regulated — much broader and stricter. A Hamburg higher regional court (2016) ruled that even **automated** preparation of a VAT filing falls under the tax advisor's monopoly. |

→ The tax side is far stricter than the labor-law/subsidy side. This is exactly why Taxfix structures its "Expert" tier around a partnership with separately licensed tax advisors.
— [Rechtsberatung durch Steuerberater](https://www.smartsteuer.de/online/lexikon/r/rechtsberatung-durch-den-steuerberater/), [Taxfix joint-responsibility notice](https://taxfix.de/informationen-zur-gemeinsamen-verantwortlichkeit-steuerberater/)

### 1-2. The decisive precedent — BGH Smartlaw ruling (Sept 9, 2021, I ZR 113/20)

Wolters Kluwer's automated contract generator "Smartlaw" (answer multiple-choice questions, get a legal document generated) was **ruled "legal" by the Federal Court of Justice.** Reasoning: it's not an individual legal-case judgment by a lawyer, but closer to a **"standardized form collection" (Formularhandbuch).**
— [LTO: BGH Vertragsgenerator Smartlaw ist zulässig](https://www.lto.de/recht/juristen/b/bgh-izr11320-vertragsgenerator-smartlaw-legal-tech-keine-unzulaessige-rechtsdienstleistung-rdg-rechtsberatung), [Legal Tech Verband](https://www.legaltechverband.de/aktivitaeten/bgh-vertragsgenerator-smartlaw-verstoesst-nicht-gegen-das-rechtsdienstleistungsgesetz/)

**What this means for Anspruch**: auto-generating a document draft (a Bildungsurlaub application, a Steuererklärung line-item checklist) from user-entered information = the same structure as Smartlaw = **legal.** But making a definitive determination on an individual case ("you are confirmed eligible for this benefit"), or submitting on the person's behalf for a tax matter = crossing the line.

### 1-3. The honest "why has nobody done this" — 3 real reasons

1. **Destinations are completely different per category**: Bildungsurlaub → internal HR (no government API), tax deductions → Finanzamt ELSTER (has an official API), relocation costs → effectively just a line in the tax return. There's no common interface for building one "auto-submission engine." That's why everyone sells exactly one category (Taxfix = ELSTER only, Sozialplattform = municipal online applications only).
2. **Tax-side regulation is overwhelmingly heavy**: because StBerG applies "regardless of automation," doing the tax category properly eventually requires a licensed tax advisor / Lohnsteuerhilfeverein partnership, just like Taxfix — a startup can't do this alone. Nobody takes on that cost just for Bildungsurlaub.
3. **No single category has enough economics on its own**: Bildungsurlaub is a once-a-year, 5–10 day event — a service built for that alone doesn't work as a business. It only works "stacked on top of" the already-proven high-value funnel of tax refunds. **This is Anspruch's real strategic insight**: every category alone is too small, but bundled together the economics work for the first time.

## 2. So what exactly should the product include

**In scope (legal, buildable):**
- Document/info upload → structured information extraction (OCR + LLM)
- Rule-based + LLM-based classification: "categories worth looking into for your situation are A, B, C" (orientation framing, not a determination)
- Per-category "where/how to apply" guidance: internal HR / Finanzamt (ELSTER) / other — where, in what format
- Auto-generated document drafts (Smartlaw-style — filling a template from user input)
- Annual re-scan ("last year it was Hessen, this year you have a kid — here's what's new to check")

**Out of scope (StBerG/RDG risk, or out of scope):**
- Definitive-determination language like "you are confirmed eligible" — keep everything in "possibility screening" tone (the same, already-proven defensive framing Sozialplattform and LeistungsLotse use)
- Submitting a tax filing on the person's behalf — not possible without a licensed partner, just like Taxfix Expert. **In phase 1, the tax category goes only as far as "draft + checklist" — actual submission stays with the user via ELSTER/a tax advisor.**
- Bildungsurlaub and similar items were never a government submission to begin with — they're "a draft letter to your company" — so this restriction barely applies. This is actually the category that's safest and fastest to bring to full polish.

## 3. Differentiation — what a copycat can't catch up on

The technology itself (OCR+LLM document parsing, template generation) **isn't patented or even hard** — the Smartlaw precedent itself confirms "this is a form collection, not a legal service," which is exactly how low the technical bar is as a weapon. The real weapons are:

1. **Cumulative cost of expanding categories**: every new category requires fresh legal research + templates + "where to submit" logic. Like tonight's research into Hessen/Berlin/Hamburg Bildungsurlaub rules — this accumulation is a cost a fresh copycat has to repeat from zero.
2. **Outcome-data feedback loop**: tracking whether HR actually approved it, whether the Finanzamt actually accepted the deduction, builds proprietary data on "this phrasing/format actually works" — a copycat has none of this real-world validation data.
3. **B2B relationships**: corporate HR/IHK/relocation-firm contracts have a 12–18 month sales cycle (already stated in the original doc) — a relationship locked in early can't be taken by a later entrant in the short term.
4. **Annual retention loop**: if last year's profile (state, employer, family situation) is retained, this year's scan is much faster and more accurate — a continuity a competitor starting fresh every year can't match.
5. **Trust-good brand**: because this category handles sensitive information like payslips and residence status, trust only builds slowly — the switching cost is emotional, not just functional.

**Honestly**: on day one, none of these are a real moat. They're all moats that "widen the gap as time passes," not moats that make copying impossible from the start. Saying this honestly to investors actually builds more credibility.

## 4. Is this feasible for me to build

**Document parsing**: already a commercialized space. Payslip-specific OCR APIs (Mindee, Affinda, Klippa, Parseur) already offer **95–99%+ accuracy** commercially — no need to build an OCR model from scratch. Prompt-based extraction via Claude/GPT's document/image input is also an option (this would just mean changing the rule-based scanner already built tonight from "answer questions directly" to "upload a document → auto-fill fields").
— [Mindee Payslip OCR](https://www.mindee.com/product/payslip-ocr-api), [Affinda](https://www.affinda.com/documents/payslip/)

**Conclusion**: this isn't a "build AI/ML from scratch" problem, it's a **"combine existing APIs + research and accurately populate per-category legal/form content"** problem. The latter overlaps exactly with the founder's own data-scraping/analysis strength (this is literally what was done tonight). That said:
- Production-grade backend, payments, and GDPR-sensitive-data infrastructure need a technical co-founder/engineer — this matches the existing ask on the Ask slide, not a new problem.
- Compliance framing (keeping an orientation tone, not a determination one) is a product-copy/UX design problem, which is squarely within the founder's own control.

## 5. "The receiving institution can also become a customer" — checked

The idea is directionally right, but **not every receiving party is the same**:

| Receiver | Is there a yearly incentive to pay? |
|---|---|
| **Corporate HR** | 🟢 Yes — already a B2B channel. New angle: beyond "providing a benefit," it can also sell the efficiency value of "HR doesn't have to manually process messy Bildungsurlaub requests." Worth adding to Slide 9 |
| **IHK / relocation firms** | 🟢 Yes — already a channel. Recurring demand since they onboard new foreign hires every year — the "annual settlement" logic the user raised genuinely applies here |
| **Finanzamt / government benefit-paying bodies** | 🔴 No — government bodies don't welcome more applicants from a budget standpoint (it only increases processing burden). The "we bring you customers" logic doesn't work on government bodies. This is also part of why Sozialplattform itself is government-owned free infrastructure |

→ **Conclusion: the accurate framing for this idea isn't "widen the channels" — it's "add a second value axis of 'efficiency' to the B2B (HR) channel that already exists."** Government-side monetization doesn't work through this logic (the original doc's "B2G sales cycle is 12–18 months" is still valid, but for a different reason — the value proposition for government has to be "reduced municipal administrative cost," not "we bring you customers").

## 6. Proposed next step

The current "answer questions directly" approach in Slide 7 / the interview tool **is justified as a phase-1 MVP** (the same logic can be validated without document upload/OCR) — but it must not look like "the final product" when pitching. Proposed restructure for the prototype:

1. **Upload** — upload a payslip/contract (at the prototype stage, honest even as a transparent simulation where the user confirms "here's what we extracted" instead of real OCR — not "pretending we read it," but "here's what we'll read in production, please confirm for now")
2. **Classify** — "categories worth looking into for you: A) Bildungsurlaub B) Homeoffice-Pauschale C) relocation cost deduction D) tax refund" (the current calculator logic can be reused as-is)
3. **Route** — per-category "where, how" (a letter draft for HR / an ELSTER checklist for the Finanzamt)
4. **Draft** — actually generate the document/letter draft (Smartlaw-style template)
5. **Retain** — a "we'll tell you again next year" hook (an email reminder, or a return-visit nudge)

Confirm whether to rebuild it in this structure and I'll get started right away.

---

## 7. Follow-up: "Isn't it illegal for me to prepare the tax filing on someone's behalf too?" + itemized breakdown (2026-09-10, follow-up)

### "Isn't it illegal for me to prepare the tax filing on someone's behalf?"

**It splits into two.**

- **"Anspruch reviews, finalizes, and submits on the user's behalf"** → this is illegal. The Steuerberatungsgesetz (StBerG) regulates "any commercial activity assisting in the fulfillment of a tax obligation," regardless of automation. Doing this without a license (tax advisor / Lohnsteuerhilfeverein) is unlawful.
- **"Anspruch only provides the tool/draft, and the user reviews and submits it themselves"** → this is fully legal. This is exactly what Taxfix Basic, WISO Steuer, and Smartsteuer are doing right now — the software asks questions, the user answers, and the user submits directly via ELSTER. The standard is *who is the declarant (Erklärender) submitting it*.

→ Anspruch's tax portion should go only as far as a "self-service draft + checklist" — actual submission stays the user's own responsibility. Later, if "we'll submit it for you too" is wanted, a partnership with a licensed tax advisor/Lohnsteuerhilfeverein is needed, like Taxfix Expert — this is a later-phase option, not something blocked right now.

### Service breakdown by item

| Item | Legal status | What's needed to build it | What the customer gets | Genuinely missing from the market? |
|---|---|---|---|---|
| **① Unified scan** (matching tax + labor rights + subsidies in one pass) | ✅ Legal. Same structure as Sozialplattform's "possibility screening" framing | The rule engine already built + per-category legal content (research) | Five scattered sources in one place, tailored to my situation | ✅ Confirmed — re-verified via live testing that Taxfix (tax only) and Sozialplattform (low-income welfare only) don't do this |
| **② Document upload auto-extraction** | ✅ Legal (the extraction itself isn't tax advice; only GDPR handling obligations apply) | OCR API (Mindee etc.) + LLM structuring + encryption/deletion policy | Upload one document instead of answering 8 questions | 🟡 Partial — Taxfix also does payslip upload, but only extracts tax fields. Nobody infers non-tax categories from the same document |
| **③ Auto-generated non-tax document drafts** (e.g. Bildungsurlaub) | ✅ The safest area — the BGH Smartlaw precedent rules exactly this structure legal | Per-state template library (content work, light engineering) | Turns "I should ask HR someday" into "here's the email to send right now" — closes the intention-action gap | ✅ Confirmed — nobody auto-generates a personalized Bildungsurlaub application draft |
| **④ Tax-filing draft/checklist (self-service)** | ✅ Legal, as long as the user reviews and submits it themselves | Map extracted data to Steuererklärung line items. ELSTER integration isn't needed for v1 (a checklist is enough) | Solves the #1 reason for not filing a first return ("didn't know") — average refund €800–1,500 | ❌ This already exists — Taxfix, Wundertax, Smartsteuer already do this well and cheaply. This item alone isn't a differentiator — it's the bundle's hook/proof, nothing more |
| **⑤ Annual re-scan** ("we'll tell you again next year") | ✅ No issue — a normal product feature, not a regulated activity | Account/profile storage (GDPR) + reminder system — standard SaaS engineering | Removes the burden of having to remember to check every year yourself | ✅ Confirmed — even Taxfix requires the user to restart from scratch every year; nobody proactively re-checks across multiple categories |
| **⑥ B2B** (corporate HR benefit / relocation-firm bundle) | ✅ No issue — standard commercial contracting | Multi-tenant accounts, HR-facing dashboard | HR: a cheap, high-perceived-value benefit + less overhead processing scattered requests | ✅ Confirmed — no packaged "finds everything your foreign employees are missing" product found |

### Summary

Differentiation comes from ①③⑤⑥, and ④ (tax filing) is not a differentiator — it's an already-proven, high-value hook. In other words, Anspruch's real logic is:

> Pull people in with "tax refund" (④) — a hook the market has already proven works — then stack the rest that nobody else does (①③⑤) on the same spot, and turn it into a relationship that repeats every year (⑤ → B2B ⑥).

Trying to out-build Taxfix at ④ is a losing fight; the core claim is that the combination of ①③⑤⑥ is what's currently missing from the market.

---

## 8. "This is just because it's a prototype, right? The real product will handle the full paperwork?" — v1/v2 roadmap (2026-09-10, follow-up)

Two different things were mixed together in why the prototype only shows a "draft" — one is a pure UX choice, the other is a real legal limit. **The automation ceiling is different per category.**

| Item | How far can the real product automate it? |
|---|---|
| **Bildungsurlaub/Bildungszeit** (a request sent to HR) | **All the way.** It's not a government submission — it's an internal email — so RDG/StBerG doesn't apply at all. With the user's consent, the app can legally draft *and actually send* the email automatically. Showing only a "draft" is a trust/UX choice ("is it OK for the app to send an email to my boss on its own?"), not a legal one |
| **Homeoffice-Pauschale / relocation deduction** (a line item in the Steuererklärung) | **Filling in the data can be fully automated.** ELSTER has an official API (Taxfix already integrates with it), so the real product can go beyond a checklist to actually pre-filling the real ELSTER form fields. However, the final "submit" button must be pressed by the user themselves — this isn't a technical limitation, it's the legal boundary of "who is the declarant" |
| **Handling the entire tax filing on the client's behalf** ("we'll take care of your whole tax return") | **Not possible in v1 — this is a real legal ceiling, not a prototype limitation.** Because StBerG applies regardless of automation, Anspruch would need a license to review, finalize, and submit on the client's behalf. Taxfix couldn't avoid this either, which is why its "Expert" tier partners with a separate licensed tax advisor — Anspruch can lift this ceiling later the same way (forming its own Lohnsteuerhilfeverein, or partnering with an existing tax advisor/Lohi). Not "never possible," just the limit of "v1, starting without a license" |

### Roadmap

- **v1 (no license, current scope)**: auto-generated drafts + ELSTER field pre-fill + full send-automation for Bildungsurlaub. Tax stays at "checklist/pre-fill only, the user submits."
- **v2 (after a licensed partnership)**: fully handle the entire tax filing — "we'll submit/file it for you" — the same structure as Taxfix Expert.

To demonstrate this in the prototype, a "draft → review → send" flow was added only to the Bildungsurlaub item (other categories still stop at "copy the draft" — because that's the real v1 limit in the actual product too).
