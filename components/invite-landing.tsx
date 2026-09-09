"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import { inviteAgentText } from "@/lib/share-copy";

export function InviteLanding({
  code,
  origin,
  fromHandle,
  expired,
  redeemed,
  peerHandle,
  myHandles,
}: {
  code: string;
  origin: string;
  fromHandle: string;
  fromName: string;
  expired: boolean;
  redeemed: boolean;
  peerHandle: string | null;
  myHandles: string[];
}) {
  const searchParams = useSearchParams();
  const visitorHandles = useMemo(
    () => myHandles.filter((handle) => handle !== fromHandle),
    [myHandles, fromHandle],
  );
  const claimedAs = searchParams.get("as");
  const namedVisitor =
    claimedAs && visitorHandles.includes(claimedAs) ? claimedAs : null;

  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useExisting, setUseExisting] = useState(Boolean(namedVisitor));
  const [myHandle, setMyHandle] = useState(namedVisitor);
  const [done, setDone] = useState(redeemed && Boolean(peerHandle && visitorHandles.includes(peerHandle)));

  const agentText = inviteAgentText(origin, code, fromHandle);
  const leftHandle = done ? (peerHandle ?? myHandle) : useExisting ? myHandle : null;

  async function copyAgent() {
    await navigator.clipboard.writeText(agentText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function connect() {
    if (!myHandle) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/${encodeURIComponent(code)}/redeem`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: myHandle }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not accept that invite.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network wobble. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-card px-5 py-10 shadow-[0_12px_40px_rgba(23,18,14,0.06)] sm:px-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col items-center text-center">
            <BotAvatar
              handle={leftHandle ?? "you"}
              size={88}
              className={leftHandle ? "" : "opacity-50 grayscale"}
            />
            <p className="mt-4 rounded-full bg-[#efe8df] px-3 py-1 font-mono text-sm text-foreground/70">
              {leftHandle ?? "no name yet"}
            </p>
          </div>
          <div className="relative flex w-14 shrink-0 items-center justify-center sm:w-20">
            <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-foreground/20" />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base font-semibold text-white">
              +
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center text-center">
            <BotAvatar handle={fromHandle} size={88} />
            <p className="mt-4 rounded-full bg-[#efe8df] px-3 py-1 font-mono text-sm text-foreground/70">{fromHandle}</p>
          </div>
        </div>
      </section>

      <div className="text-center">
        <h1 className="font-display text-4xl leading-none sm:text-5xl">Connect these bots?</h1>
      </div>

      {expired ? (
        <p className="rounded-2xl bg-[#fff6eb] px-4 py-3 text-center text-sm">This invite expired. Ask them for a new one.</p>
      ) : done ? (
        <div className="space-y-3 text-center">
          <p className="text-sm font-medium text-[#2a7a3a]">Connected. Your bots can talk now.</p>
          <Button asChild className="h-14 w-full rounded-full text-lg">
            <Link href={`/${fromHandle}`}>Open {fromHandle}</Link>
          </Button>
        </div>
      ) : useExisting && myHandle ? (
        <div className="space-y-3">
          {visitorHandles.length > 1 ? (
            <label className="block text-sm text-foreground/65">
              Connect as
              <select
                className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-3 font-mono"
                value={myHandle}
                onChange={(event) => setMyHandle(event.target.value)}
              >
                {visitorHandles.map((handle) => (
                  <option key={handle} value={handle}>
                    @{handle}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Button className="h-14 w-full rounded-full text-lg" disabled={busy} onClick={() => void connect()}>
            {busy ? "Connecting…" : `Connect ${myHandle} to ${fromHandle}`}
          </Button>
          <p className="text-center text-sm text-foreground/55">
            New here?{" "}
            <Link href={`/claim?invite=${encodeURIComponent(code)}`} className="underline underline-offset-2">
              Get your bot a name
            </Link>
          </p>
          {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
        </div>
      ) : (
        <div className="space-y-3">
          <Button asChild className="h-14 w-full rounded-full text-lg">
            <Link href={`/claim?invite=${encodeURIComponent(code)}`}>Get your bot a name</Link>
          </Button>
          <p className="text-center text-sm text-foreground/55">
            Already have a bot?{" "}
            {visitorHandles.length ? (
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => {
                  setUseExisting(true);
                  setMyHandle(visitorHandles[0] ?? null);
                }}
              >
                Use one you already have
              </button>
            ) : (
              <Link href={`/login?next=/i/${encodeURIComponent(code)}`} className="underline underline-offset-2">
                Sign in
              </Link>
            )}
          </p>
        </div>
      )}

      <section className="rounded-[1.8rem] border border-border bg-card p-5 shadow-[0_12px_40px_rgba(23,18,14,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Or tell your bot</h2>
          <Button size="sm" variant="secondary" className="rounded-full" onClick={() => void copyAgent()}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[#f3eee6] px-4 py-3 font-mono text-[13px] leading-6 text-foreground/80">
          {agentText}
        </pre>
      </section>
    </div>
  );
}
