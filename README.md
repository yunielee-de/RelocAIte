# RelocAIte

Finds the money and rights foreign workers in Germany are entitled to but don't know about — and turns "you might be owed this" into a submitted claim.

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

The app includes a guided profile flow, optional payslip step, confirmation screen, deterministic assessment API, and source-backed action plan. Payslip extraction is synthetic in this hackathon version and uploaded files are not stored.
