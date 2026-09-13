import { createHash } from "node:crypto";
import type {
  EvidenceCheck,
  MonitoredSourceSummary,
  SourceCheckResult,
} from "./source-monitor-types";

const FIRECRAWL_SCRAPE_URL = "https://api.firecrawl.dev/v2/scrape";

type MonitoredSource = MonitoredSourceSummary & {
  evidenceGroups: Array<{ label: string; terms: string[] }>;
};

const monitoredSources: readonly MonitoredSource[] = [
  {
    id: "eu-blue-card",
    label: "EU Blue Card",
    url: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card",
    scope: "Federal eligibility and salary guidance",
    evidenceGroups: [
      { label: "Blue Card topic", terms: ["eu blue card", "blue card eu"] },
      { label: "Employment requirement", terms: ["employment contract", "job offer", "employment"] },
      { label: "Qualification requirement", terms: ["academic degree", "university degree", "qualification"] },
    ],
  },
  {
    id: "berlin-bildungszeit",
    label: "Berlin educational leave",
    url: "https://www.berlin.de/sen/arbeit/weiterbildung/bildungszeit/",
    scope: "Berlin educational leave guidance",
    evidenceGroups: [
      { label: "Educational leave topic", terms: ["bildungszeit", "bildungsurlaub"] },
      { label: "Employment context", terms: ["arbeitnehmer", "beschäftigte", "employees"] },
    ],
  },
  {
    id: "registration-deadline",
    label: "German residence registration",
    url: "https://www.gesetze-im-internet.de/bmg/__17.html",
    scope: "Federal registration duty under BMG §17",
    evidenceGroups: [
      { label: "Registration provision", terms: ["§ 17", "anmeldung", "meldepflicht"] },
      { label: "Two-week deadline", terms: ["zwei wochen", "two weeks"] },
    ],
  },
] as const;

type FirecrawlPayload = {
  success?: boolean;
  error?: string;
  data?: {
    markdown?: string;
    metadata?: { title?: string };
    changeTracking?: {
      changeStatus?: string;
      visibility?: string;
      diff?: string;
      json?: unknown;
    };
  };
};

export class SourceMonitorError extends Error {
  constructor(
    message: string,
    readonly code: "unknown_source" | "provider_error" | "invalid_response",
    readonly providerStatus?: number,
  ) {
    super(message);
    this.name = "SourceMonitorError";
  }
}

export function listMonitoredSources(): MonitoredSourceSummary[] {
  return monitoredSources.map(({ id, label, url, scope }) => ({ id, label, url, scope }));
}

export function getMonitoredSource(sourceId: string): MonitoredSource {
  const source = monitoredSources.find((item) => item.id === sourceId);
  if (!source) throw new SourceMonitorError("Unknown source ID.", "unknown_source");
  return source;
}

function normalizeMarkdown(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

function checkEvidence(markdown: string, source: MonitoredSource): EvidenceCheck[] {
  const normalized = markdown.toLocaleLowerCase("de-DE");
  return source.evidenceGroups.map((group) => {
    const matchedTerm = group.terms.find((term) => normalized.includes(term.toLocaleLowerCase("de-DE"))) ?? null;
    return { label: group.label, matched: matchedTerm !== null, matchedTerm };
  });
}

function safeProviderMessage(payload: FirecrawlPayload, status: number): string {
  const message = typeof payload.error === "string" ? payload.error.slice(0, 240) : "Firecrawl could not retrieve this source.";
  return `Firecrawl request failed (${status}): ${message}`;
}

export async function checkSourceWithFirecrawl(
  sourceId: string,
  options: { apiKey?: string; fetchImpl?: typeof fetch; now?: Date } = {},
): Promise<SourceCheckResult> {
  const source = getMonitoredSource(sourceId);
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;

  let response: Response;
  try {
    response = await fetchImpl(FIRECRAWL_SCRAPE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        url: source.url,
        formats: ["markdown", { type: "changeTracking", modes: ["git-diff"] }],
        onlyMainContent: true,
        timeout: 45_000,
      }),
      cache: "no-store",
    });
  } catch {
    throw new SourceMonitorError("Firecrawl could not be reached. Try again later.", "provider_error");
  }

  let payload: FirecrawlPayload;
  try {
    payload = (await response.json()) as FirecrawlPayload;
  } catch {
    throw new SourceMonitorError("Firecrawl returned an unreadable response.", "invalid_response", response.status);
  }

  if (!response.ok || payload.success === false) {
    throw new SourceMonitorError(safeProviderMessage(payload, response.status), "provider_error", response.status);
  }

  const markdown = normalizeMarkdown(payload.data?.markdown ?? "");
  if (!markdown) throw new SourceMonitorError("Firecrawl returned no readable page content.", "invalid_response", response.status);

  const evidence = checkEvidence(markdown, source);
  const missingEvidence = evidence.some((item) => !item.matched);
  const changeStatus = payload.data?.changeTracking?.changeStatus ?? null;
  const reportedChange = changeStatus === "changed";
  const status = reportedChange || missingEvidence ? "verification_required" : "current";
  const statusReason = reportedChange
    ? "Firecrawl detected a page change. Review the official source before updating a rule."
    : missingEvidence
      ? "Expected evidence is missing from the retrieved page. Manual verification is required."
      : changeStatus === "new"
        ? "First monitored snapshot captured; expected evidence is present."
        : "No material source warning was detected and expected evidence is present.";
  const rawDiff = payload.data?.changeTracking?.diff;

  return {
    source: { id: source.id, label: source.label, url: source.url, scope: source.scope },
    provider: "Firecrawl",
    checkedAt: (options.now ?? new Date()).toISOString(),
    status,
    statusReason,
    title: payload.data?.metadata?.title ?? null,
    contentHash: createHash("sha256").update(markdown).digest("hex"),
    excerpt: markdown.replace(/[#*_`>\[\]]/g, "").slice(0, 420),
    evidence,
    change: {
      status: changeStatus,
      visibility: payload.data?.changeTracking?.visibility ?? null,
      diff: typeof rawDiff === "string" ? rawDiff.slice(0, 2_000) : null,
    },
  };
}
