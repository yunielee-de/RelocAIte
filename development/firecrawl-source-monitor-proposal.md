# Proposal: Firecrawl source monitoring for RelocAIte

**Status:** Proposed — awaiting team approval  
**Owner after approval:** Platform/backend maintainer  
**Decision deadline:** Before implementing source monitoring  
**Current state:** Firecrawl is not installed or configured in this repository. No existing RelocAIte result depends on it.

## Decision requested

Approve a narrow Firecrawl integration that monitors allowlisted official sources, detects meaningful changes, places affected rules under verification, and notifies users only when a result they previously received is materially affected.

Firecrawl supplies source content and change signals. It does **not** determine eligibility, activate rules, or send user-facing legal conclusions.

## Why this belongs in RelocAIte

RelocAIte's recommendations can become stale when an authority changes a deadline, amount, eligibility condition, or procedure. Firecrawl can convert known pages into Markdown or schema-shaped JSON and can return change-tracking data. This complements the deterministic rules engine already proposed for RelocAIte.

Relevant Firecrawl documentation:

- [Introduction and supported capabilities](https://docs.firecrawl.dev/introduction)
- [Scrape API and JSON/change-tracking formats](https://docs.firecrawl.dev/api-reference/endpoint/scrape)
- [Batch scrape API](https://docs.firecrawl.dev/api-reference/endpoint/batch-scrape)
- [Parse API for public and uploaded documents](https://docs.firecrawl.dev/features/parse)
- [Webhook security](https://docs.firecrawl.dev/webhooks/security)

## Scope

### Hackathon scope

1. Monitor one to three allowlisted official pages already referenced by `product-strategy/sources.json`.
2. Run a server-side Firecrawl check from an internal Source Monitor screen.
3. Compare the returned content/hash with the stored baseline.
4. Show `Current`, `Changed — verification required`, or `Check failed`.
5. Demonstrate an affected result warning and a before/after notification preview.
6. Require a platform maintainer to approve or reject a material rule update.

The hackathon version does not need scheduled execution, email delivery, automatic rule generation, or production-grade persistence. Those can be represented by typed fixtures while the Firecrawl fetch and comparison are real.

### Production scope

- Scheduled batch checks.
- Durable source snapshots and rule versions.
- Authenticated maintenance review queue.
- Impact analysis against stored assessment snapshots.
- In-app notifications and optional email delivery.
- Audit trail for every approval, rejection, and published rule version.

### Explicit non-goals

- No Firecrawl call during `POST /api/assessment`.
- No automatic publication of a changed legal or tax rule from one extraction.
- No scraping of authenticated government portals.
- No sending payslips, residence documents, or other user uploads to Firecrawl.
- No LLM-generated eligibility decisions.

## Proposed architecture

```text
Allowlisted official URLs
          |
          v
Firecrawl scrape/batch scrape + change tracking
          |
          v
Normalized source snapshot + checksum
          |
          v
Deterministic validation and material-change classifier
          |
          +---- no material change ---> refresh lastCheckedAt
          |
          +---- material change ------> rule marked UNDER_VERIFICATION
                                             |
                                             v
                                  maintainer review + official source
                                             |
                                  approve / reject / retire rule
                                             |
                                             v
                               recompute impacted saved assessments
                                             |
                                  notify only affected users
```

The end user confirms only their personal facts. A platform maintainer verifies source/rule changes.

## Firecrawl features selected

### MVP: `/v2/scrape`

Use the single-page scrape endpoint for known official URLs. Request:

- `markdown` for reviewable evidence.
- `json` with a strict schema for candidate facts.
- `changeTracking` for comparison metadata where available.
- `onlyMainContent: true` to remove navigation and common boilerplate.

Use direct server-side `fetch` initially instead of adding an SDK dependency. This keeps the integration small and makes the exact HTTP contract visible.

### Next: `/v2/batch/scrape`

Use batch scraping when the monitored registry grows. If webhooks are enabled, verify the `X-Firecrawl-Signature` HMAC before accepting any event and deduplicate by webhook ID.

### Later: Map, Crawl, and Parse

- `map` may discover candidate pages, but discovered URLs remain inactive until allowlisted.
- `crawl` may refresh a carefully bounded official subdirectory.
- `parse` may process public government PDFs. It must not process personal user documents without a separate privacy and data-processing decision.

`agent` and browser interaction are not required for the MVP because RelocAIte already knows the official URLs it needs to monitor.

## Data model additions

### `SourceSnapshot`

```ts
type SourceSnapshot = {
  id: string;
  sourceId: string;
  url: string;
  fetchedAt: string;
  contentHash: string;
  markdown: string;
  extractedFacts: Record<string, unknown>;
  firecrawlScrapeId?: string;
  status: "current" | "changed" | "failed";
};
```

### `SourceChange`

```ts
type SourceChange = {
  id: string;
  sourceId: string;
  previousSnapshotId: string;
  candidateSnapshotId: string;
  materialFields: string[];
  status: "pending_review" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
};
```

### Required rule and assessment provenance

- Every rule stores `ruleVersion`, `sourceIds`, `effectiveFrom`, and `effectiveTo`.
- Every result stores the `ruleVersion` and `sourceSnapshotIds` used to produce it.
- Saved assessments store enough structured input to recompute affected results without retaining uploaded documents.

## Source lifecycle

```text
CURRENT -> CHANGED -> UNDER_VERIFICATION -> APPROVED -> CURRENT
                                      \-> REJECTED -> previous version remains current
                                      \-> RETIRED  -> affected recommendation disabled
```

When a source is `UNDER_VERIFICATION`, RelocAIte must not silently use the candidate facts. The last approved rule may remain active only when its effective period is still valid; otherwise the affected result becomes unavailable until verification is complete.

## User warnings and notifications

### Pending verification

Display this only on affected results:

> The official information behind this result changed on {date}. We are verifying whether your recommendation is affected. Check the official source before acting.

### Verified material change

Create an in-app notification containing:

- Previous result.
- Updated result.
- Plain-language reason for the change.
- Effective date.
- Official source.
- Required action and urgency.

Email is opt-in. Do not notify users for formatting, navigation, or other non-material page changes. A material change alters at least one of: eligibility, amount, duration, deadline, required evidence, application procedure, or escalation requirement.

## Proposed repository changes after approval

```text
development/relocaite-app/
  app/api/admin/source-monitor/run/route.ts
  app/api/admin/source-monitor/changes/route.ts
  app/api/admin/source-monitor/changes/[id]/route.ts
  app/admin/sources/page.tsx
  lib/source-monitor/firecrawl.ts
  lib/source-monitor/normalize.ts
  lib/source-monitor/validate.ts
  lib/source-monitor/impact.ts
  lib/source-monitor/types.ts
  lib/source-monitor/__tests__/
```

Production persistence may use the project's selected database. The hackathon demo may use committed baseline fixtures and an in-memory candidate result, clearly labelled as demo behavior.

## API contracts

- `POST /api/admin/source-monitor/run` — checks allowlisted source IDs; never accepts an arbitrary client-supplied URL.
- `GET /api/admin/source-monitor/changes` — lists pending and historical changes.
- `PATCH /api/admin/source-monitor/changes/:id` — approves or rejects a candidate after authentication and authorization.
- `GET /api/sources/:id/status` — exposes only safe freshness/status metadata to the user interface.
- Internal `assessment.recompute` job — recalculates saved assessments that reference an approved changed rule.

The API key is read only from `FIRECRAWL_API_KEY` on the server. It must never use a `NEXT_PUBLIC_` name or be returned to the browser.

## Verification rules

A change enters the review queue only when:

1. The URL and redirects remain within the allowlisted official domain.
2. Retrieval succeeds with an expected content type.
3. Required schema fields are present and parse correctly.
4. The new snapshot differs from the last accepted checksum.
5. The material-change classifier identifies a relevant field or sentence change.

Approval still requires a maintainer to inspect the official source. Automated checks reduce noise; they do not replace accountability for activating legal or tax rules.

## Security and privacy requirements

- Protect every maintenance endpoint with role-based authorization.
- Keep a strict server-side URL allowlist to reduce SSRF and misuse risk.
- Apply rate limits, request timeouts, and bounded retries.
- Verify webhook signatures before processing events.
- Do not include personal data in Firecrawl requests, webhook metadata, logs, or source snapshots.
- Store only public-source content and provenance in the source-monitor subsystem.
- Record who approved a change and which rule version was published.

## Testing plan

- Unit test normalization, checksums, material-field detection, and lifecycle transitions.
- Contract test Firecrawl success, timeout, malformed JSON, redirect, and rate-limit responses.
- Test that an arbitrary URL cannot be submitted.
- Test that a changed source cannot update an active rule without approval.
- Test impact analysis against assessments created with older rule versions.
- Test that non-material changes do not notify users.
- Test pending, approved, rejected, and retired user-interface states.

## Hackathon acceptance criteria

- A real server-side Firecrawl request succeeds for at least one allowlisted official URL.
- The Source Monitor displays its URL, retrieval time, status, and extracted evidence.
- A controlled changed-source fixture produces `Under verification`.
- An affected result displays the warning and source link.
- Approval produces a versioned candidate result and notification preview.
- No Firecrawl secret reaches client code or committed files.
- Existing assessment tests and build continue to pass.

## Team approval checklist

Before implementation, the developers should record agreement on:

- [ ] Use Firecrawl for public official-source monitoring.
- [ ] Keep Firecrawl outside the live assessment request path.
- [ ] Require maintainer approval for material rule changes.
- [ ] Store rule/source versions with every saved assessment.
- [ ] Notify only users whose saved result materially changed.
- [ ] Exclude personal user documents from Firecrawl.
- [ ] Approve the hackathon scope and defer the production items listed above.

Approval can be recorded in a GitHub issue, pull-request discussion, or by replacing the status at the top of this document with `Approved` and linking the decision.

