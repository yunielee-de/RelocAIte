# RelocAIte — Scraping & Source Pipeline Guide

Two different things need to be kept separate:

1. **Scraping legal/regulatory content** — collecting rules like "Bildungsurlaub in Hessen is 5 days, 6-month waiting period." This is what this document covers. It's static public information, so there's no legal issue at all (RDG/StBerG regulate *giving advice*, not *collecting public legal information*).
2. **Parsing user-uploaded documents** — reading an uploaded payslip. This isn't scraping — it's an OCR/Document AI problem (commercial APIs like Mindee, Affinda). Completely different stack, out of scope for this document.

This document only covers #1.

> **Proposed next step:** See [`firecrawl-source-monitor-proposal.md`](./firecrawl-source-monitor-proposal.md) for the reviewable Firecrawl implementation plan. It is a proposal only; the current pipeline and `sources.json` do not depend on Firecrawl.

---

## ⚠️ Correction (2026-09-12): what was actually used vs. what an earlier version of this doc claimed

An earlier version of this doc said the `firecrawl` skill was "already installed, nothing to set up" and implied `sources.json` was built with it. **That was wrong** — it was written from seeing the skill's name in a menu, without checking whether the underlying tool actually runs. Checked directly (2026-09-12):

| Tool | Actually available in this environment? | Was it used to build the current `sources.json`? |
|---|---|---|
| **`firecrawl` CLI** | ❌ No — the skill's instructions load, but the `firecrawl` command itself is not installed (no npm package, no pip package, `command not found`). It needs `firecrawl setup` + an API key (it's a metered/credit-based service — see `firecrawl --status` and `firecrawl credit-usage` once installed) before it can run at all. | No |
| **`scrapling` CLI** | ✅ Yes — confirmed installed (`pip show scrapling`, v0.4.9) and confirmed working with a live test fetch (`scrapling extract get <url> <output>` successfully returned a 200 and clean markdown). Also has `stealthy-fetch` (anti-bot-detection fetching) and a browser-based `fetch` mode. | No — available, but not used yet |
| **Playwright (browser automation)** | ✅ Yes, and this is what actually got used | Yes — for the two competitor live-verifications (Taxfix.de, Sozialplattform.de), navigating and reading the real page like a human would, confirmed in `sources.json`'s `competitor-taxfix` and `competitor-sozialplattform` entries |
| **WebSearch / WebFetch** (built-in) | ✅ Yes | Yes — this is what actually produced the bulk of `sources.json`'s legal/market facts (Bildungsurlaub rules, tax figures, market size, the RDG/StBerG/Smartlaw legal research) |

**So, accurately**: `sources.json`'s 12 entries were built with WebSearch/WebFetch for most facts, plus Playwright for the two live competitor checks. Not firecrawl. `scrapling` was available the whole time and simply wasn't tried.

The rest of this document is corrected to reflect this.

## 1. Why the current setup is technical debt

Earlier prototype code (kept privately in `../reference/`, not part of this repo's build) hardcoded per-state Bildungsurlaub rules directly inside each HTML file as a `BL_INFO` object, duplicated across files. That pattern doesn't scale — if a law changes, or a new state is added, every copy needs a manual edit.

**Goal**: whatever gets built during the event should read state/category rules from `../product-strategy/sources.json` directly, never re-hardcode them.

## 2. Tools to use — verified status, not assumed

| Tool | Status | Best for |
|---|---|---|
| **`scrapling`** | ✅ Installed, tested working, no setup needed | The default choice right now. `scrapling extract get <url> <file>` for a plain static page; `scrapling extract stealthy-fetch <url> <file>` when a site pushes back on automated requests (bot detection); `scrapling extract fetch` for JS-rendered pages needing a real browser. Run `scrapling --help` / `scrapling extract --help` for the full command set. |
| **Playwright (browser automation, MCP)** | ✅ Available and already proven this session | Anything needing real interaction — filling in a questionnaire (like Sozialplattform's Sozialleistungsfinder), clicking through a multi-step flow, or visually confirming what a competitor's product actually shows. This is the "open a window and act like a human" approach, and it's what should keep being used for competitor product walkthroughs specifically. |
| **WebSearch / WebFetch** (built-in) | ✅ Available, no setup | Fast fact-finding when you don't yet know the exact URL, or want a synthesized answer with sources — this is what most of the current legal/market research used. |
| **`firecrawl` CLI** | ❌ Not installed/configured in this environment | Only worth setting up if the team wants its specific strengths — `map` (site-wide URL discovery), `agent` (schema-driven structured extraction across many pages in one call), and `monitor` (scheduled change-detection with webhook/email alerts). None of these are things `scrapling`/Playwright/WebSearch can't do manually — `firecrawl` mainly saves steps at scale. If the team decides it's worth the setup + credit cost, install it and update this doc with real, verified usage — don't assume it works from the skill menu again. |

## 3. Source list structure

`sources.json` — an array where each entry is one verified fact. Schema:

```json
{
  "id": "bildungsurlaub-hessen",
  "category": "Bildungsurlaub",
  "region": "Hessen",
  "law_short": "HBUG",
  "facts": {
    "days_per_period": 5,
    "period": "calendar_year",
    "waiting_period_months": 6,
    "application_deadline_weeks": 6,
    "expiry_rule": "31.12 (annual, no rollover without employer consent)"
  },
  "source_primary": "official law text URL (gesetze-im-internet.de / Landesrecht portal)",
  "source_secondary": ["explainer site URLs used to cross-check"],
  "method": "websearch | webfetch | scrapling | playwright | firecrawl",
  "confidence": "high | medium | low",
  "last_verified": "2026-09-10",
  "next_check_due": "2027-01-01",
  "notes": "anything a human should know before trusting this blindly"
}
```

(`method` is a new field — added so it's never ambiguous again which tool actually produced an entry. The 12 existing entries in `sources.json` predate this field; see the correction note above for what actually built them.)

**Why this shape:**
- `source_primary` should always be a **primary source** (the statute text, official government statistics). `source_secondary` is for cross-checking.
- `confidence` should be honest. Bildungsurlaub **usage-rate** statistics couldn't be found anywhere, so that gap is marked `confidence: "low"` + a note — so a future teammate doesn't mistake a gap for a verified fact.
- `next_check_due`: rates and caps change yearly. This field schedules re-verification at year-end/year-start.

## 4. The actual pipeline (as the team scales)

```
1. Discover   → WebSearch (fastest) or scrapling's fetch mode against a known portal, to collect candidate URLs
2. Extract    → scrapling extract (get / stealthy-fetch / fetch as needed) for static content;
                Playwright for anything requiring interaction (forms, multi-step flows, JS-heavy pages)
3. Verify     → cross-check at least 2 sources (primary + secondary); if they disagree, mark confidence: "low" and flag for human review
4. Store      → merge into sources.json (update existing id, or add new), filling in the `method` field honestly
5. Monitor    → no automated tool for this yet (would need firecrawl-monitor, or a scheduled re-check) — for now, `next_check_due` is manual
```

This can largely be run by telling Claude Code "add these 3 new states to sources.json, following the existing schema, and verify with scrapling/WebSearch" — a human only needs to review anything that comes back `confidence: low`.

## 5. What's already done

`sources.json` holds 12 already-verified entries (Hessen/Berlin/Hamburg Bildungsurlaub, Homeoffice-Pauschale, Umzugskostenpauschale, average tax refund, foreign-worker population, competitor facts) — see `../product-strategy/sources.json`. They predate the `method` field (see the correction note). Build the event's code to read from this file directly rather than hardcoding facts again.
