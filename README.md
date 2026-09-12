# RelocAIte

Finds the money and rights foreign workers in Germany are entitled to but don't know about — and turns "you might be owed this" into a submitted claim.

Built at the AI.WOMEN Hackathon (Hamburg, Sept 12–13, 2026).

## Repo structure

- **`product-strategy/`** — strategy and research data feeding the build. Currently: `sources.json`, a registry of verified German entitlement rules (Bildungsurlaub by state, tax deduction figures, market data), each entry sourced and dated.
- **`development/`** — technical guides and code built during the event. See `development/scraping-and-source-pipeline.md` for how `sources.json` is sourced and how to extend it.
- **`design/`** — UI/UX design work.
- **`reference/`** — early exploratory work from before the event (a pitch deck draft and a prototype sketch), kept for the team's own reference only — not part of the in-event build.

## Getting started

Read `development/scraping-and-source-pipeline.md` for the source-data approach, then `product-strategy/sources.json` for what's already verified.
