# RelocAIte hackathon prototype

One Journey Profile, five stages, and a shared Document Vault.

## Run locally (PowerShell)

With Node.js 22.13 or newer installed:

```powershell
cd "C:\Users\roya_\Desktop\RelocAIte\development\relocaite-app"
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000. No API key, database or account is required.

This machine also has a portable Node runtime already used for validation. With the existing dependencies:

```powershell
cd "C:\Users\roya_\Desktop\RelocAIte\development\relocaite-app"
$env:PATH = "$env:TEMP\relocaite-tools\node-v22.16.0-win-x64;$env:PATH"
npm.cmd run dev
```

Install Node normally if this temporary runtime directory is later cleared.

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

`npm.cmd start` requires a successful build and an available port 3000.

## Demo

1. Home → **Start with your contract** → **Use demo contract**.
2. Select a highlighted demo excerpt or a finding to review its fields. Correct anything needed, then **Confirm and see summary**.
3. Review annual salary, contract terms and **Recommendations & Insights**.
4. **Continue to Visa Application**. Employment contract shows **Already provided**.
5. **Use example background** → **Show my potential route**. Recognition is deliberately unknown, giving a concrete next action.
6. Review the checklist. Confirm requirements using the responsible mission's instructions. Fast-track appears only if selected; accommodation evidence only if requested.
7. Add a document record, or report availability with **I have this document**. **Open Document Vault** shows the same records across stages.
8. Refresh to demonstrate persistence. Edit a profile fact: route review must be repeated, while documents remain.
9. Explore Accommodation & Registration, Compliance & Setup, and Tax Refund & Benefits. Mark explicit preparation reviews to update progress.
10. Stage 5 → **Open financial preview** opens the preserved `/financial-preview`.

For a standard-case example, explicitly report recognition as confirmed. This is not official verification. EU/EEA or Swiss nationalities give distinct checklists and omit the D-visa timeline.

## Implemented and limits

- Original logo, blue/white sidebar, five horizontal cards, real progress, current stage, next action and responsive mobile navigation.
- Two-column contract preview and findings, with linked demo excerpts, manual editing, confirmation, salary annualisation, insights and a copyable HR request.
- **No arbitrary PDF extraction or OCR.** Personal files can be previewed locally during the current visit; only metadata persists. The fictional sample uses prepared fields matched to the sample PDF.
- Shared Vault: stable ID, document type, filename, added/updated dates, status and stages using the record. Replacement keeps the record ID and other documents.
- **File bytes are not uploaded or persisted.** Keep originals. “Already provided” means metadata exists; “Reported ready” means user-reported availability without selecting a file. Neither verifies evidence; samples are not application documents.
- Summaries and the AI Assistant preview use templates, not a live model.
- Visa rules support EU/EEA/Swiss, standard academic Blue Card and formally qualified skilled-worker preparation. Conditional checklist, sources, next action, export and D-visa timeline.
- Lightweight housing, Anmeldung, insurance/tax setup and opportunity guides. No booking, government submission, insurance purchase or tax filing.
- No auth, cloud storage, database or cross-device sync.

## Persistence and progress

The profile schema is version 2. The existing `relocaite.journey.v1` storage key is retained to find old profiles. Version 1 migrates automatically in memory and saves on the next change. Existing contract names and reported document availability survive; missing legacy filenames/dates remain unknown. Malformed or unsupported saved profiles are not overwritten without an explicit reset.

Stage 1 counts confirmation, even if some facts remain unknown. Stage 2 requires a reviewed potential route with no unresolved initial checks and all relevant items ready. Stages 3–5 count explicit preparation reviews. These statuses do not represent official approval or completed real-world registration. Later stages are accessible at any time; the next action points to the first incomplete stage.

## Rules and official sources

`lib/mvp-visa-rules.ts` contains the local official-source snapshot reviewed on 2026-09-13. It does not modify the shared `product-strategy/sources.json`.

The 2026 references are EUR 50,700 general and EUR 45,934.20 for qualifying reduced Blue Card cases, subject to additional conditions. Salary alone does not establish eligibility. The engine evaluates the standard academic case; reduced thresholds, experience-only cases, existing permits, family routes and age-45+ skilled-worker cases need separate review. Non-EUR pay is not converted. Rules and employment start years outside 2026 trigger verification.

The responsible mission or authority determines the full document requirements. Berlin-specific Swiss and education-leave guidance is labeled as a local example.

## Main files

- `app/page.tsx`: shared state, persistence, navigation and assessment API coordination.
- `components/journey-shell.tsx`, `journey-dashboard.tsx`: branding and dashboard.
- `components/contract-stage.tsx`, `contract-insights.tsx`, `visa-stage.tsx`: core journey.
- `components/document-vault.tsx`, `later-stage.tsx`: shared records and later guides.
- `lib/journey-profile.ts`, `journey-storage.ts`: validation, migration and persistence.
- `lib/document-vault.ts`, `journey-stages.ts`: document records and progress.
- `lib/demo-contract.ts`, `mvp-visa-rules.ts`, `visa-assessment.ts`: fixtures, sources and rules.
- `tests/journey.test.ts`: rule boundaries, migration, reuse, progress and API failures.

## Five-stage upgrade inventory

Created (5):

- `components/contract-insights.tsx`
- `components/document-vault.tsx`
- `components/later-stage.tsx`
- `lib/document-vault.ts`
- `lib/journey-stages.ts`

Updated (13):

- `app/page.tsx`, `app/globals.css`
- `components/contract-stage.tsx`, `components/visa-stage.tsx`
- `components/journey-dashboard.tsx`, `components/journey-shell.tsx`
- `lib/journey-profile.ts`, `lib/demo-contract.ts`
- `lib/mvp-visa-rules.ts`, `lib/visa-assessment.ts`
- `tests/journey.test.ts`, this app's `README.md`
- `next-env.d.ts` (regenerated by Next.js production build)

No dependencies were added. The original logo, financial page/engine/APIs, repository-root README and shared source registry remain unchanged.

## Reference layout refinement

The supplied screenshots and HTML mockup inform layout and interactions only. The original blue logo, five-stage progress and reviewed rules are retained. The mockup's employer, salary, findings and legal assertions are not imported.

- The dashboard uses a shared progress/heading layout, horizontal cards, status chips and a public-domain Reichstag photograph by Schlaier. Progress and greeting come from the actual profile. Full image attribution is recorded in `public/ASSET-ATTRIBUTION.md`.
- Step 1 places document preview on the left and findings on the right. Demo highlights and numbered findings link in both directions using keyboard-accessible buttons.
- **Confirmed** means the user reviewed all facts in that finding; it is not a legal finding. **Worth checking** covers unconfirmed or unclear information. **Missing** covers absent, not-found or unknown fields. Counts are computed from the profile.
- Edited values update findings and the shared profile. Linked demo excerpts retain the original source values; corrections are explicitly marked.
- Personal PDF/image previews use temporary object URLs. File contents are never added to the saved profile or sent to the extraction endpoint. On navigation/reload, select the recorded file again to preview it without clearing existing facts. Interactive highlights are available for the prepared demo excerpts only.
- The persistent confirmation/continue bar provides the path to Stage 2. Detailed working-benefit and threshold explanations remain available in expandable sections.

Created: `components/contract-preview.tsx`, `components/journey-overview.tsx`, `lib/contract-review.ts`, `tests/contract-review.test.ts`.

Updated: `app/page.tsx`, `app/globals.css`, `components/contract-stage.tsx`, `components/contract-insights.tsx`, `components/journey-dashboard.tsx`, this app's `README.md`.

## Preserved financial prototype

`app/financial-preview/page.tsx`, `lib/assessment.ts`, `app/api/assessment/route.ts` and `app/api/extract-document/route.ts` retain their existing behavior, including synthetic payslip data and dated financial assumptions. Stage 5 links to this separate preview; it does not yet import the Journey Profile.

## Proposed Firecrawl integration

The team can review the detailed [`Firecrawl source-monitor proposal`](../firecrawl-source-monitor-proposal.md). It specifies the hackathon scope, maintenance approval flow, user warnings and notifications, API boundaries, security requirements, tests, acceptance criteria, and an explicit approval checklist. It is documentation only; Firecrawl has not been added as a runtime dependency.
