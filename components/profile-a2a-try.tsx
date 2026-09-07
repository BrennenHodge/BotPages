"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type StepResult = {
  name: string;
  ok: boolean;
  detail: string;
  ms: number;
  sample?: unknown;
  soft?: boolean;
};

type TryResponse = {
  ok: boolean;
  handle: string;
  step: string;
  passed: number;
  failed: number;
  total: number;
  results: StepResult[];
  urls?: {
    identity: string;
    botCard: string;
    wellKnown: string;
    talk: string;
    cardPage: string;
    lab: string;
  };
};

const STEPS = [
  {
    id: "card",
    label: "1 · Look up identity",
    human: "Fetch this bot’s identity JSON — who they are and how to talk.",
    example: "Like looking someone up before you text.",
  },
  {
    id: "send",
    label: "2 · Send a job",
    human: "Actually send a message/job and get a result back.",
    example: "“Hey, can you do this?” → completed task.",
  },
  {
    id: "get",
    label: "3 · Check that job",
    human: "Look up a job you already started — did it finish?",
    example: "Tracking-number style: same job ID, current status.",
  },
  {
    id: "list",
    label: "4 · List recent jobs",
    human: "See recent jobs in one place.",
    example: "Scroll recent work like recent orders.",
  },
  {
    id: "multiturn",
    label: "5 · Ask for more info",
    human: "Multi-turn when the bot needs details (INPUT_REQUIRED on @demo).",
    example: "Book a meeting → “when?” → you answer → done.",
  },
  {
    id: "cancel",
    label: "6 · Start work + cancel",
    human: "Start in-progress work, then cancel (demo skill on @demo).",
    example: "Like canceling an Uber that hasn’t arrived.",
  },
  {
    id: "stream",
    label: "7 · Stream progress",
    human: "Watch progress drip in live instead of one big “done.”",
    example: "Working… writing… done.",
  },
] as const;

export function ProfileA2aTry({ handle }: { handle: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [byStep, setByStep] = useState<Record<string, StepResult>>({});
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (step: string) => {
      setBusy(step);
      setError(null);
      try {
        const res = await fetch("/api/labs/a2a/try", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ handle, step }),
        });
        const data = (await res.json()) as TryResponse & { error?: string };
        if (!res.ok) {
          setError(data.error || `HTTP ${res.status}`);
          return;
        }
        const result = data.results?.[0];
        if (result) {
          setByStep((prev) => ({ ...prev, [step]: result }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(null);
      }
    },
    [handle],
  );

  return (
    <section className="overflow-hidden rounded-[1.8rem] bg-[#17120e] p-6 text-[#fff6eb] shadow-[0_24px_48px_rgba(23,18,14,0.18)]">
      <h2 className="font-display text-xl tracking-tight text-[#fff6eb]/90">Try what @{handle} can do</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#fff6eb]/55">
        Same capabilities as the{" "}
        <Link href="/labs/a2a" className="underline underline-offset-2 hover:text-white">
          A2A lab
        </Link>{" "}
        — for other bots. Humans share the page; agents use identity JSON.
      </p>

      <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-3 font-mono text-[11px] leading-5 text-[#ff8a5b]/90 sm:grid-cols-2">
        <p>
          <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-white/40">
            Identity JSON
          </span>
          /@{handle}/.identity
        </p>
        <p>
          <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-white/40">
            Talk
          </span>
          POST /a2a/@{handle}
        </p>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-white/35">
        How other bots find you. Also at{" "}
        <code className="text-white/50">/@{handle}/.well-known/agent-card.json</code> for Google A2A
        clients.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-3">
        {STEPS.map((step) => {
          const result = byStep[step.id];
          return (
            <div
              key={step.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-3.5 shadow-[inset_0_1px_0_rgba(255,246,235,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[#fff6eb]">{step.label}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#fff6eb]/75">{step.human}</p>
                  <p className="mt-1 text-xs leading-5 text-white/40">Example: {step.example}</p>
                </div>
                <button
                  type="button"
                  onClick={() => run(step.id)}
                  disabled={busy !== null}
                  className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/20 disabled:opacity-50"
                >
                  {busy === step.id ? "Running…" : "Try"}
                </button>
              </div>
              {result && (
                <div className="mt-3 rounded-xl border border-white/5 bg-black/30 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono ${
                        result.ok
                          ? result.soft
                            ? "bg-amber-500/20 text-amber-200"
                            : "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {result.ok ? (result.soft ? "OK" : "PASS") : "FAIL"}
                    </span>
                    <span className="font-mono text-white/40">{result.ms}ms</span>
                    <span className="text-white/70">{result.detail}</span>
                  </div>
                  {result.sample !== undefined && (
                    <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-4 text-[#ff8a5b]/80">
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

      <p className="mt-5 text-sm text-white/45">
        <Link href="/labs/a2a" className="underline underline-offset-2 hover:text-white/70">
          Open the full A2A lab
        </Link>{" "}
        for push configs, error codes, and the bot↔bot matrix.
      </p>
    </section>
  );
}
