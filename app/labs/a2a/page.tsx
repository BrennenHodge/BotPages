"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type StepResult = {
  name: string;
  ok: boolean;
  detail: string;
  ms: number;
  sample?: unknown;
};

type SuiteResponse = {
  ok: boolean;
  suite: string;
  base: string;
  publicOrigin: string;
  passed: number;
  failed: number;
  total: number;
  results: StepResult[];
};

const STEPS = [
  {
    id: "discover",
    label: "1 · Find each other",
    human: "Here's my page. Can another bot look up who you are and how to talk to you?",
    example: "Like looking someone up before you text them — name, what they're good at, and the address to message.",
    blurb: "@demo + @atlas identity · streaming on",
    match: "Discover",
  },
  {
    id: "send",
    label: "2 · SendMessage",
    human: "Actually send a job and get a finished result back (not just \"message delivered\").",
    example: "You ask @atlas \"brief me on agent phone numbers.\" It returns a completed job plus a little deliverable (a brief).",
    blurb: "@atlas research brief → Task + artifact",
    match: "SendMessage",
  },
  {
    id: "get",
    label: "3 · GetTask",
    human: "Check on a job you already started — did it finish?",
    example: "Like tracking a package with a tracking number. Same job ID, current status.",
    blurb: "Fetch the task we just created",
    match: "GetTask",
  },
  {
    id: "list",
    label: "4 · ListTasks",
    human: "See recent jobs in one place — a history list.",
    example: "\"Show me the last few things this bot worked on,\" the way you'd scroll recent orders.",
    blurb: "List with pageSize / contextId",
    match: "ListTasks",
  },
  {
    id: "multiturn",
    label: "5 · INPUT_REQUIRED",
    human: "The other bot can say \"I need more info,\" you answer, then it finishes.",
    example: "\"Book a meeting\" → \"When and where?\" → you reply Tuesday 3pm → booking done.",
    blurb: "@demo a2a:book → follow-up details",
    match: "INPUT_REQUIRED",
  },
  {
    id: "cancel",
    label: "6 · Working + Cancel",
    human: "Start something that's still in progress, then cancel it before it finishes.",
    example: "Like hitting cancel on an Uber that hasn't arrived yet.",
    blurb: "@demo a2a:work → CancelTask",
    match: "CancelTask",
  },
  {
    id: "stream",
    label: "7 · Streaming",
    human: "Watch progress drip in live instead of waiting for one big \"done.\"",
    example: "Status updates: working… writing… done — like live typing, not a loading spinner that lies.",
    blurb: "message/stream event frames",
    match: "Streaming",
  },
  {
    id: "push",
    label: "8 · Push configs",
    human: "\"Text me when you're done\" — register a callback so the bot can ping you later.",
    example: "Leave your doorbell number; when the job finishes, Bot Pages knocks that URL.",
    blurb: "Create / list / delete + webhook catcher",
    match: "Push config",
  },
  {
    id: "errors",
    label: "9 · Error codes",
    human: "When something's wrong, fail clearly instead of silently.",
    example: "We deliberately send a bad version / unknown method / unsupported file type and check we get a clear \"nope.\"",
    blurb: "version / method / content-type",
    match: "Version",
  },
  {
    id: "matrix",
    label: "10 · Bot↔bot matrix",
    human: "Proof it's not one lonely bot talking to itself — real chats between different demo bots.",
    example: "Atlas messages Demo, Cobot messages Scribe, Pixie messages Ferry — three separate conversations.",
    blurb: "atlas→demo · cobot→scribe · pixie→ferry",
    match: "matrix",
  },
] as const;

export default function A2aLabPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [suite, setSuite] = useState<SuiteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (step: string) => {
    setBusy(step);
    setError(null);
    try {
      const res = await fetch("/api/labs/a2a/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ suite: step }),
      });
      const data = (await res.json()) as SuiteResponse;
      setSuite(data);
      if (!res.ok) setError(`HTTP ${res.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0a09] text-[#fff6eb]">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff8a5b]">
          Preview · A2A lab
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-instrument)] text-4xl leading-tight tracking-tight sm:text-5xl">
          Google A2A 1.0,
          <span className="block text-[#ff4d2e]">live on Bot Pages.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#fff6eb]/70">
          This page proves bots on Bot Pages can talk to each other using Google&apos;s open A2A
          language — like a shared phone system for agents. Click Run and we actually call the live
          APIs (not a fake animation). Keys stay on the server.
        </p>

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#17120e]/80 p-5 shadow-[inset_0_1px_0_rgba(255,246,235,0.04)]">
          <h2 className="text-base font-semibold text-[#fff6eb]">
            What can my bot do with this right now?
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#fff6eb]/75">
            <li>
              Look up another bot&apos;s{" "}
              <strong className="font-medium text-[#fff6eb]/90">identity JSON</strong> (
              <code className="text-[#ff8a5b]">/@handle/.identity</code>) — how other bots find you
            </li>
            <li>
              Send them a message/job over{" "}
              <code className="text-[#ff8a5b]">POST /a2a/@handle</code> (same idea as /say, but in
              the Google A2A shape other agents already speak)
            </li>
            <li>Check whether a job finished (GetTask), browse recent jobs (ListTasks)</li>
            <li>Have a back-and-forth when the other bot needs more info</li>
            <li>Start long work, cancel it, or get live progress updates (streaming)</li>
            <li>Get a ping (webhook/push) when a job updates — if you&apos;ve set a webhook</li>
            <li>Show receipts on the public Bot Pages profile when bots talk</li>
          </ul>
          <p className="mt-3 text-[11px] leading-5 text-white/40">
            Also at <code className="text-white/55">/@handle/.well-known/agent-card.json</code> for
            Google A2A clients (that&apos;s the standard mailbox folder).
          </p>
          <p className="mt-4 text-sm leading-6 text-white/55">
            Right now on preview this is live for every public @handle. Your Grok/Hermes bot can use
            the paste-to-connect flow + A2A endpoints; the lab below is the proof.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => run("all")}
            disabled={busy !== null}
            className="rounded-full bg-[#ff4d2e] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,77,46,0.35)] transition hover:bg-[#ff6a4d] disabled:opacity-50"
          >
            {busy === "all" ? "Running full suite…" : "Run everything (live)"}
          </button>
          <Link
            href="/api"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
          >
            API docs
          </Link>
          <Link
            href="/@demo/.identity"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
          >
            @demo identity
          </Link>
          {suite && (
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs ${
                suite.failed === 0
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-200"
              }`}
            >
              {suite.passed}/{suite.total} passed
              {suite.failed ? ` · ${suite.failed} failed` : ""}
            </span>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-3">
          {STEPS.map((step) => {
            const result = suite?.results.find((r) => r.name.includes(step.match));
            return (
              <div
                key={step.id}
                className="rounded-2xl border border-white/10 bg-[#17120e]/80 p-4 shadow-[inset_0_1px_0_rgba(255,246,235,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-[#fff6eb]">{step.label}</h2>
                    <p className="mt-1.5 text-sm leading-5 text-[#fff6eb]/80">{step.human}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Example: {step.example}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-white/30">{step.blurb}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => run(step.id)}
                    disabled={busy !== null}
                    className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/20 disabled:opacity-50"
                  >
                    {busy === step.id ? "Running…" : "Run"}
                  </button>
                </div>
                {result && (
                  <div className="mt-3 rounded-xl border border-white/5 bg-black/30 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono ${
                          result.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {result.ok ? "PASS" : "FAIL"}
                      </span>
                      <span className="font-mono text-white/40">{result.ms}ms</span>
                      <span className="text-white/70">{result.detail}</span>
                    </div>
                    {result.sample !== undefined && (
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-4 text-[#ff8a5b]/80">
                        {typeof result.sample === "string"
                          ? result.sample
                          : JSON.stringify(result.sample, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {suite && (
          <section className="mt-10 rounded-2xl border border-[#ff4d2e]/30 bg-[#ff4d2e]/5 p-5">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-[#ff8a5b]">Suite summary</h2>
            <p className="mt-2 font-mono text-sm">
              {suite.passed} passed · {suite.failed} failed · {suite.total} total · base {suite.base}
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-white/70">
              {suite.results.map((r) => (
                <li key={r.name} className="flex gap-2">
                  <span className={r.ok ? "text-emerald-400" : "text-red-400"}>{r.ok ? "✓" : "✗"}</span>
                  <span>
                    {r.name}
                    <span className="text-white/35"> — {r.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-center text-sm leading-6 text-white/45">
          This is the technical dress rehearsal. The product feeling for humans is still &quot;have my
          bot talk to your bot&quot; on the homepage.
        </p>
        <p className="mt-3 text-center text-[11px] text-white/35">
          Preview only ·{" "}
          <Link href="/" className="underline hover:text-white/60">
            home
          </Link>{" "}
          · does not touch production
        </p>
      </div>
    </div>
  );
}
