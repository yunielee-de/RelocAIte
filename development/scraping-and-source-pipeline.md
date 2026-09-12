# Anspruch — Scraping & Source Pipeline Guide

Two different things need to be kept separate:

1. **Scraping legal/regulatory content** — collecting rules like "Bildungsurlaub in Hessen is 5 days, 6-month waiting period." This is what this document covers. It's static public information, so there's no legal issue at all (RDG/StBerG regulate *giving advice*, not *collecting public legal information*).
2. **Parsing user-uploaded documents** — reading an uploaded payslip. This isn't scraping — it's an OCR/Document AI problem (commercial APIs like Mindee, Affinda). Completely different stack, out of scope for this document.

This document only covers #1.

---

## 1. Why the current setup is technical debt

Right now, the Hessen/Berlin/Hamburg Bildungsurlaub rules are **hardcoded in three separate files** (`anspruch-pitch-deck.html`, `anspruch-scan.html`, `anspruch-field-interview.html` — each has its own `BL_INFO` object). If a law changes, or we add a new state, all three need to be edited by hand. This is the first thing that breaks once the team grows.

**Goal**: pull the legal content out into a single source (`sources.json`), and have all three prototypes — and the eventual real product — read from that one file.

## 2. Skills to use

This environment already has the **`firecrawl`** skill family installed (`/firecrawl-search`, `/firecrawl-scrape`, `/firecrawl-map`, `/firecrawl-agent`, `/firecrawl-monitor`) — nothing new to install. Each has a different job:

| Skill | When to use it |
|---|---|
| `firecrawl-map` | Map a site's structure — e.g. find every "Bildungsurlaubsgesetz" URL on gesetze-im-internet.de or a state's Landesrecht portal |
| `firecrawl-scrape` | You already know the exact URL — pulls that one page as clean markdown |
| `firecrawl-agent` | **The important one** — crawls multiple pages and extracts structured data matching a schema you define. Exactly right for "pull days/waiting-period/deadline from all 16 states' Bildungsurlaubsgesetz pages into this JSON shape" |
| `firecrawl-monitor` | Alerts when a law changes — register the source URLs and get notified on page changes. Good fit for figures that change yearly (Umzugskostenpauschale, Homeoffice-Pauschale cap) |

(The `insane-search` skill installed earlier this session is for *blocked* public pages — most government sites aren't blocked, so `firecrawl` is the better fit here.)

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
  "confidence": "high | medium | low",
  "last_verified": "2026-09-10",
  "next_check_due": "2027-01-01",
  "notes": "anything a human should know before trusting this blindly"
}
```

**Why this shape:**
- `source_primary` should always be a **primary source** (the statute text, official government statistics). `source_secondary` is for cross-checking (the way we cross-checked bildungsurlaub.de's summaries against the actual statute tonight).
- `confidence` should be honest. Tonight, Bildungsurlaub **usage-rate** statistics couldn't be found, so that was explicitly marked "use as circumstantial evidence only" — gaps like this belong in `confidence: "low"` + a note, so a future teammate doesn't mistake a gap for a verified fact.
- `next_check_due`: rates and caps change yearly. This field schedules re-verification at year-end/year-start.

## 4. The actual pipeline (as the team scales)

```
1. Discover   → firecrawl-map to collect every relevant URL on the target site
2. Extract    → firecrawl-agent, given the schema above, extracts structured data across pages
3. Verify     → cross-check at least 2 sources (primary + secondary); if they disagree, mark confidence: "low" and flag for human review
4. Store      → merge into sources.json (update existing id, or add new)
5. Monitor    → register source_primary URLs with firecrawl-monitor → any detected change forces re-verification regardless of next_check_due
```

This pipeline can largely be run by telling Claude Code "add these 3 new states to sources.json, following the existing schema" — `firecrawl-agent` handles most of it automatically, and a human only needs to review anything that comes back `confidence: low`.

## 5. What's already done

`sources.json` now holds tonight's already-verified data (Hessen/Berlin/Hamburg Bildungsurlaub, Homeoffice-Pauschale, Umzugskostenpauschale, average tax refund, foreign-worker population, competitor facts) in this schema — see `sources.json`. The next engineering task is swapping the three HTML files' hardcoded `BL_INFO` objects for a read from this file.
