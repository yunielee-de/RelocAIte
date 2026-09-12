# Development

Working prototypes and the technical content pipeline.

- **`anspruch-scan.html`** — the product prototype: Upload → Confirm → Classify (animated scan) → Route + Draft (per-category, with a working "review & send" flow for Bildungsurlaub specifically, demonstrating the real automation boundary described in `../product-strategy/product-scope-and-moat.md` §8) → Retain. Self-contained, rule-based (no backend, no real OCR yet) — open directly in a browser.
- **`anspruch-field-interview.html`** — a 20-second tap-through tool for collecting validation interviews face-to-face at the hackathon. Stores locally (localStorage) on whichever device it's run from; exports as CSV.
- **`scraping-and-source-pipeline.md`** — how the legal/regulatory content that powers both tools above is (and should keep being) sourced: which skill to use (`firecrawl`), and the schema for `../product-strategy/sources.json`, the single source of truth for state-by-state rules. Read this before hardcoding a new fact anywhere.

## Known technical debt

Per-state Bildungsurlaub rules are currently hardcoded as a `BL_INFO` object, duplicated in `anspruch-scan.html`, `anspruch-field-interview.html`, and `../product-strategy/anspruch-pitch-deck.html`. The next real engineering task is having all three read from `../product-strategy/sources.json` instead.

## Not yet built

Real document parsing (OCR/Document AI on an uploaded payslip) — see `../product-strategy/product-scope-and-moat.md` §4 for the recommended approach (commercial OCR APIs, not a custom model) — and the earlier stages of the consumer journey (job offer check, visa application, accommodation, insurance) mapped in `../product-strategy/consumer-journey.md`.
