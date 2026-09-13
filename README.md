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
