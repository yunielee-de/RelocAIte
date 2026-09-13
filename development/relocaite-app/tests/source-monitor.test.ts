import assert from "node:assert/strict";
import { test } from "node:test";
import { checkSourceWithFirecrawl, getMonitoredSource, SourceMonitorError } from "../lib/source-monitor";

const markdown = "# EU Blue Card\nAn employment contract and academic degree or other qualification are required.";

function providerResponse(changeStatus = "same", content = markdown, ok = true) {
  return new Response(JSON.stringify({
    success: ok,
    ...(ok ? { data: { markdown: content, metadata: { title: "EU Blue Card" }, changeTracking: { changeStatus, visibility: "visible", diff: changeStatus === "changed" ? "- old\n+ new" : "" } } } : { error: "rate limited" }),
  }), { status: ok ? 200 : 429, headers: { "Content-Type": "application/json" } });
}

test("checks a fixed allowlisted URL through Firecrawl and keeps the key server-side", async () => {
  let requestUrl = "";
  let init: RequestInit | undefined;
  const result = await checkSourceWithFirecrawl("eu-blue-card", {
    apiKey: "secret-test-key",
    now: new Date("2026-09-13T08:00:00Z"),
    fetchImpl: async (url, options) => { requestUrl = String(url); init = options; return providerResponse(); },
  });
  assert.equal(requestUrl, "https://api.firecrawl.dev/v2/scrape");
  assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer secret-test-key");
  const body = JSON.parse(String(init?.body));
  assert.equal(body.url, getMonitoredSource("eu-blue-card").url);
  assert.equal(result.status, "current");
  assert.equal(result.checkedAt, "2026-09-13T08:00:00.000Z");
  assert.equal(result.evidence.every((item) => item.matched), true);
  assert.equal(result.contentHash.length, 64);
});

test("first snapshots pass when expected evidence is present", async () => {
  const result = await checkSourceWithFirecrawl("eu-blue-card", { fetchImpl: async () => providerResponse("new") });
  assert.equal(result.status, "current");
  assert.match(result.statusReason, /First monitored snapshot/);
});

test("a Firecrawl change signal requires verification", async () => {
  const result = await checkSourceWithFirecrawl("eu-blue-card", { fetchImpl: async () => providerResponse("changed") });
  assert.equal(result.status, "verification_required");
  assert.equal(result.change.diff, "- old\n+ new");
});

test("missing expected evidence requires verification even without a change signal", async () => {
  const result = await checkSourceWithFirecrawl("eu-blue-card", { fetchImpl: async () => providerResponse("same", "A generic page") });
  assert.equal(result.status, "verification_required");
  assert.ok(result.evidence.some((item) => !item.matched));
});

test("unknown IDs and provider errors are rejected safely", async () => {
  await assert.rejects(() => checkSourceWithFirecrawl("https://example.com"), (error: unknown) => error instanceof SourceMonitorError && error.code === "unknown_source");
  await assert.rejects(
    () => checkSourceWithFirecrawl("eu-blue-card", { fetchImpl: async () => providerResponse("same", markdown, false) }),
    (error: unknown) => error instanceof SourceMonitorError && error.code === "provider_error" && error.providerStatus === 429,
  );
});
