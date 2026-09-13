"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";
import type { MonitoredSourceSummary, SourceCheckResult, SourceMonitorIndex } from "@/lib/source-monitor-types";

export default function SourceMonitorPage() {
  const [index, setIndex] = useState<SourceMonitorIndex | null>(null);
  const [results, setResults] = useState<Record<string, SourceCheckResult>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/source-monitor", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load source monitor.");
        return response.json() as Promise<SourceMonitorIndex>;
      })
      .then(setIndex)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load source monitor."));
  }, []);

  async function runCheck(source: MonitoredSourceSummary) {
    setRunning(source.id);
    setError(null);
    try {
      const response = await fetch("/api/source-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: source.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Source check failed.");
      setResults((current) => ({ ...current, [source.id]: body as SourceCheckResult }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Source check failed.");
    } finally {
      setRunning(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fc] px-5 py-10 text-[#172337] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-[#617086] hover:text-[#2674ed]">
          <ArrowLeft size={16} /> Back to RelocAIte
        </Link>

        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#6085b8]">Maintenance workspace · Powered by Firecrawl</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Official source monitor</h1>
          <p className="mt-4 text-base leading-7 text-[#617086]">
            Check approved public sources without sending personal profile data. A detected change is held for verification and never updates a RelocAIte rule automatically.
          </p>
        </header>

        {index && !index.configured && (
          <section className="mb-6 flex gap-3 rounded-xl border border-[#ecd9b7] bg-[#fff8eb] p-4 text-sm text-[#775a27]" role="status">
            <ShieldAlert className="mt-0.5 shrink-0" size={19} />
            <div><strong>Live checks need configuration.</strong> Add <code className="font-mono text-xs">FIRECRAWL_API_KEY</code> to the server environment. The key is never sent to the browser.</div>
          </section>
        )}
        {error && <div className="mb-6 rounded-xl border border-[#f1d7d5] bg-[#fff3f2] p-4 text-sm text-[#a34742]" role="alert">{error}</div>}

        <section className="grid gap-5 lg:grid-cols-3">
          {(index?.sources ?? []).map((source) => {
            const result = results[source.id];
            const warning = result?.status === "verification_required";
            return (
              <article key={source.id} className="flex flex-col rounded-2xl border border-[#e4e9f2] bg-white p-6 shadow-[0_5px_24px_rgba(34,59,95,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6085b8]">{source.scope}</p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em]">{source.label}</h2>
                <a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 break-all text-sm text-[#3476d2] hover:underline">
                  Official source <ExternalLink size={14} />
                </a>

                {result ? (
                  <div className="mt-6 space-y-4 border-t border-[#edf1f6] pt-5 text-sm">
                    <div className={`flex gap-2 rounded-lg p-3 ${warning ? "bg-[#fff8eb] text-[#775a27]" : "bg-[#edf8f4] text-[#27735f]"}`}>
                      {warning ? <ShieldAlert className="mt-0.5 shrink-0" size={18} /> : <CheckCircle2 className="mt-0.5 shrink-0" size={18} />}
                      <div><strong>{warning ? "Verification required" : "Current"}</strong><p className="mt-1 leading-5 text-inherit">{result.statusReason}</p></div>
                    </div>
                    <dl className="grid gap-2 text-xs text-[#617086]">
                      <div className="flex justify-between gap-3"><dt>Checked</dt><dd>{new Date(result.checkedAt).toLocaleString()}</dd></div>
                      <div className="flex justify-between gap-3"><dt>Change signal</dt><dd>{result.change.status ?? "not reported"}</dd></div>
                      <div className="flex justify-between gap-3"><dt>Content hash</dt><dd className="font-mono">{result.contentHash.slice(0, 12)}…</dd></div>
                    </dl>
                    <div>
                      <h3 className="mb-2 font-semibold">Evidence checks</h3>
                      <ul className="space-y-1.5 text-xs text-[#617086]">
                        {result.evidence.map((item) => <li key={item.label}>• {item.matched ? "Found" : "Missing"}: {item.label}</li>)}
                      </ul>
                    </div>
                    {warning && <p className="rounded-lg bg-[#f5f7fc] p-3 text-xs leading-5 text-[#617086]">Users relying on this source should see: “Official information changed. We are verifying whether your result is affected. Check the official source before acting.”</p>}
                  </div>
                ) : (
                  <p className="mt-6 border-t border-[#edf1f6] pt-5 text-sm leading-6 text-[#617086]">No check has run in this browser session.</p>
                )}

                <button
                  type="button"
                  disabled={!index?.configured || running !== null}
                  onClick={() => runCheck(source)}
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#2674ed] px-4 text-sm font-semibold text-white transition hover:bg-[#2165c9] disabled:cursor-not-allowed disabled:bg-[#aebdd2]"
                >
                  <RefreshCw size={16} className={running === source.id ? "animate-spin" : ""} />
                  {running === source.id ? "Checking…" : "Check with Firecrawl"}
                </button>
              </article>
            );
          })}
        </section>

        <footer className="mt-8 border-t border-[#e4e9f2] pt-6 text-xs leading-5 text-[#718199]">
          Prototype limitation: checks are manual and results are held in this browser session. Production needs scheduled checks, persistent snapshots, maintainer authentication and affected-user notifications.
        </footer>
      </div>
    </main>
  );
}
