# RelocAIte

Helps foreign workers in Germany identify relocation steps and financial opportunities they may otherwise miss, then turns them into a sourced action plan.

Built at the AI.WOMEN Hackathon (Hamburg, Sept 12–13, 2026).

## Repo structure

- **`product-strategy/`** — strategy and research data feeding the build. Currently: `sources.json`, a registry of verified German entitlement rules (Bildungsurlaub by state, tax deduction figures, market data), each entry sourced and dated.
- **`development/`** — technical guides and code built during the event. It contains the full-stack prototype and the source-data pipeline.
- **`design/`** — UI/UX design work.
- **`reference/`** — early exploratory work from before the event (a pitch deck draft and a prototype sketch), kept for the team's own reference only — not part of the in-event build.

## Getting started

- Read [`development/scraping-and-source-pipeline.md`](development/scraping-and-source-pipeline.md) for the source-data approach, then [`product-strategy/sources.json`](product-strategy/sources.json) for what's already verified.
- Run the current app from [`development/relocaite-app/`](development/relocaite-app/). Its README includes setup, architecture, prototype limitations, and UI designer handoff notes.

## Current prototype

- Source: [`development/relocaite-app/`](development/relocaite-app/)
- Hosted demo: [relocaite-ai-woman.mary986373.chatgpt.site](https://relocaite-ai-woman.mary986373.chatgpt.site/)

The app includes a browser-session Journey Profile, real OpenAI contract extraction, visa preparation, a shared Document Vault, a contextual assistant with curated fallback, a profile-linked financial assessment, and manual Firecrawl checks of allowlisted official sources. Contract files are processed transiently and are not stored; payslip extraction remains synthetic in this hackathon version. There is no authentication, database, government submission, automatic source-monitoring schedule, or cross-device sync.

## 1. Project Overview

### The problem

Moving to Germany should be exciting, but foreign working professionals quickly face a fragmented and high-stakes process. Visa requirements, employment contracts, accommodation documents, address registration, insurance, taxes and deadlines are spread across government websites, emails and unfamiliar paperwork. Newcomers often do not know what to do first, what is missing, or which information is still current.

The result is uncertainty, avoidable delays and money left unclaimed. Existing relocation tools usually stop at logistical onboarding, while financial guidance is separated from the user's actual move and employment context.

### Our solution

**RelocAIte is an AI-powered relocation, career and financial-readiness assistant for foreign professionals moving to Germany.** It turns a complex move into one personalized five-stage journey:

1. **Job Offer & Contract** - upload or review an employment contract and confirm the facts that matter.
2. **Visa Application** - explore a potential route and build a document checklist from the confirmed profile.
3. **Accommodation & Registration** - prepare housing documents and understand Anmeldung.
4. **Compliance & Setup** - prepare health-insurance, employment and tax-registration steps.
5. **Tax Refund & Benefits** - identify relevant financial opportunities and track supporting expenses.

The prototype combines a Journey Profile, shared Document Vault, contextual AI assistant, contract analysis, visa preparation, financial assessment and official-source monitoring. It is designed to provide a clear starting point and sourced preparation guidance; it does not replace German authorities or professional legal, tax or immigration advice.

The hackathon pitch deck is available as [`product-strategy/anspruch-pitch-deck.pdf`](product-strategy/anspruch-pitch-deck.pdf).

## 2. AI Integration

RelocAIte uses AI in two working server-side flows:

### Employment-contract extraction

- A user selects a PDF, JPG or PNG employment contract.
- `POST /api/extract-contract` sends the document transiently to the **OpenAI Responses API**.
- The model returns structured fields such as job title, employer, start date, salary, working hours, probation, vacation and notice period, plus short supporting excerpts.
- The server validates and normalizes the response before showing it in the UI.
- Extracted facts remain **unconfirmed** until the user reviews or corrects them. Confirmed facts become reusable context for later stages.

### Contextual relocation assistant

- `POST /api/assistant` receives the user's question and a deliberately limited set of confirmed journey facts.
- **OpenAI `gpt-5-mini`** produces a short answer grounded in the user's current relocation stage.
- Responses are requested with minimal reasoning and response storage disabled for a faster, more privacy-conscious demo.
- If OpenAI is unavailable or no key is configured, the same interface returns curated built-in guidance instead of breaking.

The financial assessment and visa-preparation rules are deterministic and source-backed in this prototype. This makes important eligibility logic testable and prevents the language model from silently deciding legal outcomes. AI explains and structures information; the user confirms facts, and official authorities remain the source of truth.

## 3. Tools & Technologies Used

| Area | Technology | How it is used |
| --- | --- | --- |
| Application | **Next.js 16 App Router** | Full-stack web application and server-side API routes |
| Frontend | **React 19**, **TypeScript 5** | Component UI, typed journey state and interactions |
| Styling | **Tailwind CSS 4**, CSS, Radix UI, Lucide icons | Responsive design system and accessible interface controls |
| AI | **OpenAI Responses API**, default model `gpt-5-mini` | Contract extraction and contextual relocation assistance |
| Web data | **Firecrawl API v2** | Manual monitoring of allowlisted official German sources for changed content |
| Rules | TypeScript rule engines + curated official-source snapshots | Visa preparation and financial-opportunity assessment |
| Persistence | Browser `localStorage` | Hackathon Journey Profile and document metadata without requiring an account |
| Quality | Node test runner via `tsx`, ESLint, TypeScript | Automated tests, linting and type checking |
| Collaboration | GitHub and Git | Source control, parallel team contributions and review |
| Deployment | Vercel-compatible Next.js build | Intended hosting path; environment variables stay server-side |

### Architecture

```text
Browser UI
  |-- Journey Profile + Document Vault metadata (localStorage)
  |-- Contract upload --------------------> /api/extract-contract --> OpenAI
  |-- Assistant question -----------------> /api/assistant --------> OpenAI
  |-- Visa profile ------------------------> /api/visa-assessment --> local rules
  |-- Financial profile -------------------> /api/assessment -------> local rules
  `-- Maintenance source check ------------> /api/source-monitor ---> Firecrawl
```

OpenAI and Firecrawl credentials are read only by server routes. `.env.local` is ignored by Git and must never be committed. Contract bytes are processed transiently; the prototype stores only confirmed fields and document metadata in the browser. Firecrawl receives only allowlisted public URLs, never user contracts, profiles or payslips.

## 4. Setup & Running Instructions

### Requirements

- Node.js **22.13 or newer**
- npm
- Optional: OpenAI and Firecrawl API keys for live integrations

### Run the prototype

```bash
git clone https://github.com/yunielee-de/RelocAIte.git
cd RelocAIte/development/relocaite-app
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The prepared demo journey and manual-entry flows work without API keys. For live contract extraction and assistant answers, add `OPENAI_API_KEY` to `.env.local`. For live official-source checks, add `FIRECRAWL_API_KEY`. Restart the development server after changing environment variables.

### Review the main demo flow

1. From **Home**, open **Job Offer & Contract**.
2. Choose the prepared sample or upload a fictional contract.
3. Review the extracted salary, start date, leave, probation and notice-period facts, then confirm them.
4. Continue to **Visa Application**, use the example background and generate a potential route and checklist.
5. Open **Documents** to see the shared records across journey stages.
6. Open **AI Assistant** and ask: `I am starting a new job in Berlin. What should I prepare before moving?`
7. Explore Accommodation & Registration, Compliance & Setup and the Financial Preview.
8. For the maintenance demo, open [http://localhost:3000/source-monitor](http://localhost:3000/source-monitor) and check an allowlisted official source.

### Validate the project

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

For a production-style local preview, run `npm start` after `npm run build`. For Vercel, import this repository, set the root directory to `development/relocaite-app`, and configure the two API keys as encrypted environment variables.

Full implementation notes, privacy boundaries and prototype limitations are documented in [`development/relocaite-app/README.md`](development/relocaite-app/README.md).

## 5. Team Members

RelocAIte was built collaboratively during the AI.WOMEN Hackathon weekend. Contributors recorded in this repository are:

- **Mary Rojas** (`@poll-mary`)
- **Yunie Lee** (`@yunielee-de`, `@yh3128-ctrl`)
- **Roya Salehi** (`@roya-salehi-data`)
- **Marika Koma** (`@marikoma`)

The team combined product strategy, user research, UI/UX design, frontend engineering, AI/document processing, rules and source-data work into the submitted prototype.
