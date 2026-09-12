# Relocaite full-stack prototype

This is the current hackathon product prototype: a guided flow that turns a foreign professional's profile and optional payslip into a prioritized, source-backed action plan.

Live demo: [relocaite-ai-woman.mary986373.chatgpt.site](https://relocaite-ai-woman.mary986373.chatgpt.site/)

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Current journey

1. Arrive on a public landing page before any profile exists.
2. Start a new journey or open Priya's populated demo dashboard.
3. Enter relocation, employment, residence, and tax-related facts.
4. Upload a payslip or continue without one.
5. Confirm the extracted fields.
6. Receive prioritized findings with trigger facts, official sources, and next actions.
7. Copy an HR request draft when the finding supports one.

The demo covers education leave for Berlin, Hessen, and Hamburg; residence-permit planning; job-related relocation expenses; remote-work documentation; tax-return preparation; and expert escalation for cross-border income.

## What is real and what is simulated

- The interface, assessment API, typed rules, prioritization, and source links are implemented.
- Payslip extraction returns synthetic demo data. Files are not uploaded to or stored by a document service.
- The rule set is intentionally small and does not represent complete Germany-wide coverage.
- The app does not calculate a guaranteed refund, submit a claim, or provide legal or tax advice.

## Designer handoff

The UI and copy are ready to be refined. Please preserve these trust requirements while changing the visual language or wording:

- Lead with plain English; introduce a German term only when it helps users recognize an official process.
- Keep each finding's explanation, trigger facts, official source, and next action together.
- Keep document upload optional and retain confirmation before assessment.
- Clearly distinguish an opportunity, a deadline, and an expert-review case.
- Avoid guaranteed eligibility, savings, or outcome claims.

The current palette and layout are a starting point, not a locked design system.

## Prototype architecture

The prototype uses a React/Next.js front end with two server routes:

- `app/api/extract-document/route.ts` — synthetic extraction response for the demo.
- `app/api/assessment/route.ts` — accepts a typed profile and returns findings.
- `lib/assessment.ts` — deterministic rules and finding generation.

For production, keep the decision layer deterministic and versioned. Use an LLM only to explain verified results in user-friendly language. Official data should be collected in a separate reviewed ingestion pipeline—API/XML/RSS first, allowlisted scraping only when necessary—and never scraped live during a user assessment.

```text
Questionnaire + optional document
              |
              v
Validated profile + confirmed extracted fields
              |
              v
Versioned deterministic rules ---- reviewed source registry
              |
              v
Risk gate: explain / ask for context / escalate
              |
              v
Prioritized actions + citations + editable drafts
```

### Responsibilities

- **Web client:** onboarding, dashboard, document confirmation, results, citations, and user-edited action drafts.
- **Assessment API:** validates the request and invokes the rules engine. It must not invent eligibility.
- **Rules engine:** evaluates structured facts against versioned rules with jurisdiction, effective dates, source IDs, and required evidence.
- **Source registry:** stores reviewed official URLs, retrieval dates, effective dates, and review status.
- **Ingestion worker:** refreshes the registry outside the request path. Prefer official APIs, XML, RSS, and downloadable structured data; use allowlisted scraping only when no stable feed exists.
- **Document service:** in production, performs OCR/extraction with per-field confidence. The user confirms every consequential field before assessment.
- **LLM layer:** optional and downstream of the rules engine; translates verified findings into plain language, drafts editable messages, and never acts as the source of truth.
- **Risk gate:** suppresses unsupported conclusions and routes cross-border, ambiguous, or high-impact cases to an authorized professional.

### Suggested production data models

- `UserProfile`: jurisdiction, employment, relocation, residence, household, and tax-context facts.
- `DocumentField`: value, document type, confidence, confirmation state, and extraction provenance.
- `Rule`: rule ID, category, jurisdiction, effective dates, predicates, required facts, source IDs, and review version.
- `Source`: official URL, publisher, retrieved date, effective date, checksum, and review status.
- `Finding`: matched rule/version, trigger facts, priority, explanation, next action, source citations, and escalation state.

### API and scraping boundary

The browser should call product APIs only. It should never scrape government pages directly. A scheduled ingestion job fetches official material, detects changes, and places updates into a review queue; only approved source/rule versions become active. The assessment endpoint reads the approved snapshot, so a slow or changed external page cannot alter a live result.

Recommended API shape:

- `POST /api/extract-document` — extract candidate fields; production response includes confidence and provenance.
- `POST /api/assessment` — return findings from confirmed structured facts and the active ruleset version.
- `GET /api/sources/:id` — optional normalized source metadata and freshness status.
- `POST /api/feedback` — optional report for a confusing, stale, or incorrect result.

### Viability

The concept is viable as an educational decision-support product if the initial scope stays narrow. The strongest hackathon proof is not nationwide coverage; it is a trustworthy end-to-end path for a few reviewed cases. Production viability depends on versioned rules, source review, privacy controls, document retention/deletion policy, and clear escalation. Do not position the product as an automatic legal, tax, or benefits-eligibility authority.

## Design system

The interface uses exactly four text-size roles:

- `type-display` — landing and results hero titles.
- `type-heading` — page titles, section headings, and key metrics.
- `type-body` — paragraphs, controls, and primary card copy.
- `type-label` — navigation, metadata, helper text, statuses, and captions.

The tokens live in `app/globals.css`. Do not introduce one-off font sizes. Prefer spacing, weight, color, and hierarchy before adding a new size.

The visual direction uses blue, white, and restrained green accents; a clean transparent logo; a fictional generated profile portrait; and a public-domain Berlin photograph. The Berlin image is by Schlaier and is available from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Berlin_Reichstag_Bundestag_von_der_Spree_aus_gesehen.JPG).

## Recommended next engineering work

1. Replace synthetic extraction with privacy-conscious OCR and field-level provenance.
2. Move the current rules into the versioned data model above.
3. Add a reviewed source-ingestion job and change-detection queue.
4. Expand one category and jurisdiction at a time from official sources.
5. Add consent, retention, deletion, encryption, and audit controls before storing documents.
6. Add tests for false positives, missing context, stale sources, effective-date boundaries, and escalation behavior.

## Disclaimer

Relocaite is an educational prototype. Important decisions should be confirmed with the responsible authority or an authorized professional.
