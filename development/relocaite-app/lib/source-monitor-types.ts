export type SourceStatus = "current" | "verification_required";

export type EvidenceCheck = {
  label: string;
  matched: boolean;
  matchedTerm: string | null;
};

export type MonitoredSourceSummary = {
  id: string;
  label: string;
  url: string;
  scope: string;
};

export type SourceCheckResult = {
  source: MonitoredSourceSummary;
  provider: "Firecrawl";
  checkedAt: string;
  status: SourceStatus;
  statusReason: string;
  title: string | null;
  contentHash: string;
  excerpt: string;
  evidence: EvidenceCheck[];
  change: {
    status: string | null;
    visibility: string | null;
    diff: string | null;
  };
};

export type SourceMonitorIndex = {
  configured: boolean;
  sources: MonitoredSourceSummary[];
};
