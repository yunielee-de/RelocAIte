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

1. Enter relocation, employment, residence, and tax-related facts.
2. Upload a payslip or continue without one.
3. Confirm the extracted fields.
4. Receive prioritized findings with trigger facts, official sources, and next actions.
5. Copy an HR request draft when the finding supports one.

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

## Architecture

The prototype uses a React/Next.js front end with two server routes:

- `app/api/extract-document/route.ts` — synthetic extraction response for the demo.
- `app/api/assessment/route.ts` — accepts a typed profile and returns findings.
- `lib/assessment.ts` — deterministic rules and finding generation.

For production, keep the decision layer deterministic and versioned. Use an LLM only to explain verified results in user-friendly language. Official data should be collected in a separate reviewed ingestion pipeline—API/XML/RSS first, allowlisted scraping only when necessary—and never scraped live during a user assessment.

## Recommended next engineering work

1. Add privacy-conscious OCR with field-level confidence and confirmation.
2. Move rules into a versioned data model with jurisdiction and effective dates.
3. Expand federal-state coverage from reviewed official sources.
4. Add consent, retention, deletion, and encryption controls before storing documents.
5. Add test cases for false positives, missing context, stale sources, and escalation behavior.

## Disclaimer

Relocaite is an educational prototype. Important decisions should be confirmed with the responsible authority or an authorized professional.
