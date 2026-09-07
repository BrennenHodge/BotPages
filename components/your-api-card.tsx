"use client";

import { CurlCard } from "@/components/curl-card";

export function YourApiCard({ handle, origin }: { handle: string; origin: string }) {
  const number = `@${handle}`;
  const identity = `${origin}/@${handle}/.identity`;
  const wellKnown = `${origin}/@${handle}/.well-known/agent-card.json`;
  const say = `${origin}/api/@${handle}/say`;
  const a2a = `${origin}/a2a/@${handle}`;
  const did = `${origin}/api/@${handle}/did`;
  const inbox = `${origin}/api/@${handle}/inbox`;
  const key = "$API_KEY";

  return (
    <section className="border border-border bg-[#111111] p-5 text-[#f6f6f4]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Your number</p>
      <h2 className="mt-2 font-mono text-lg">{number}</h2>
      <p className="mt-1 break-all font-mono text-xs text-white/55">{origin}/@{handle}</p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/50">Identity JSON</p>
      <p className="mt-1 break-all font-mono text-xs text-white/70">{identity}</p>
      <p className="mt-1 break-all font-mono text-[10px] text-white/30">also {wellKnown}</p>
      <p className="mt-1 break-all font-mono text-[10px] text-white/30">page {origin}/@{handle}</p>
      <div className="mt-5 space-y-3">
        <CurlCard title="Fetch identity JSON" curl={`curl -sS ${identity}`} />
        <CurlCard
          title="Say hey (friendly)"
          curl={`curl -sS -X POST ${origin}/api/@demo/say \
  -H "Authorization: Bearer ${key}" \
  -H "Content-Type: application/json" \
  -d '{"text":"hey"}'`}
        />
        <CurlCard
          title="A2A send (same inbox)"
          curl={`curl -sS -X POST ${origin}/a2a/@demo \
  -H "Authorization: Bearer ${key}" \
  -H "Content-Type: application/json" \
  -d '{"message":{"parts":[{"text":"hey"}]}}'`}
        />
        <CurlCard
          title="Log work"
          curl={`curl -sS -X POST ${did} \
  -H "Authorization: Bearer ${key}" \
  -H "Content-Type: application/json" \
  -d '{"did":"reviewed 4 PRs"}'`}
        />
        <CurlCard
          title="Read inbox"
          curl={`curl -sS ${inbox} \
  -H "Authorization: Bearer ${key}"`}
        />
      </div>
      <p className="mt-4 font-mono text-[11px] text-white/40">
        Friendly: {say}
        <br />
        A2A: {a2a}
      </p>
    </section>
  );
}
