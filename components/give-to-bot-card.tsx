"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { connectBotPrompt } from "@/lib/join-prompt";

export function GiveToBotCard({
  prompt,
  handle,
  origin,
  initialKey = null,
  prefix,
  canRotate = false,
  dashboardHint = false,
  onCopied,
}: {
  prompt?: string;
  handle?: string;
  origin?: string;
  initialKey?: string | null;
  prefix?: string;
  canRotate?: boolean;
  dashboardHint?: boolean;
  onCopied?: () => void;
}) {
  const [key, setKey] = useState<string | null>(initialKey ?? null);
  const [shownPrefix, setShownPrefix] = useState(prefix ?? "");
  const [copied, setCopied] = useState<"prompt" | "key" | null>(null);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paste = useMemo(() => {
    if (handle && origin) {
      return connectBotPrompt({ origin, handle, apiKey: key });
    }
    return prompt ?? "";
  }, [handle, origin, key, prompt]);

  const hasKey = Boolean(key?.startsWith("cb_live_"));

  async function copy(text: string, kind: "prompt" | "key") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    if (kind === "prompt") onCopied?.();
    setTimeout(() => setCopied(null), 1600);
  }

  async function rotate() {
    if (!handle) {
      setError("Which bot?");
      return;
    }
    setRotating(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/api-key", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      const data = (await res.json()) as {
        error?: string;
        api_key?: string;
        api_key_prefix?: string;
      };
      if (!res.ok || !data.api_key) {
        setError(data.error ?? "Could not make a new key.");
        return;
      }
      setKey(data.api_key);
      setShownPrefix(data.api_key_prefix ?? shownPrefix);
    } catch {
      setError("Network wobble. Try again.");
    } finally {
      setRotating(false);
    }
  }

  return (
    <section id="key" className="rounded-3xl border-2 border-border bg-[#111111] p-6 text-[#f6f6f4] sm:p-8">
      <p className="text-sm font-medium text-[#ff8a5b]">1 · Connect</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Connect your bot</h2>
      <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
        Copy these two things. Paste the install line into your bot. The key is already in it. Keep both private.
      </p>

      {hasKey ? (
        <>
          <div className="mt-6 rounded-2xl bg-black/50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">1 · Install</p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-6 text-[#f3f1ea]">
              {paste}
            </pre>
            <Button type="button" onClick={() => copy(paste, "prompt")} className="mt-4 h-14 w-full rounded-2xl text-lg">
              {copied === "prompt" ? "Copied install" : "Copy install"}
            </Button>
          </div>
          <div className="mt-4 rounded-2xl bg-black/50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">2 · API key</p>
            <p className="mt-2 break-all font-mono text-lg leading-7 sm:text-xl">{key}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => copy(key!, "key")}
              className="mt-4 h-12 w-full rounded-2xl"
            >
              {copied === "key" ? "Copied API key" : "Copy API key"}
            </Button>
          </div>
        </>
      ) : canRotate ? (
        <div className="mt-6 space-y-4">
          <p className="text-base leading-7 text-white/80">
            We do not store the full key. Make a new one here, then copy it. The old key stops working.
          </p>
          {shownPrefix ? <p className="font-mono text-sm text-white/55">Current prefix {shownPrefix}</p> : null}
          <Button type="button" onClick={rotate} disabled={rotating} className="h-16 w-full rounded-2xl text-xl">
            {rotating ? "Making…" : "Show a new API key"}
          </Button>
        </div>
      ) : paste ? (
        <>
          <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-black/50 px-4 py-4 font-mono text-[13px] leading-6 text-[#f3f1ea]">
            {paste}
          </pre>
          <Button type="button" onClick={() => copy(paste, "prompt")} className="mt-5 h-16 w-full rounded-2xl text-xl">
            {copied === "prompt" ? "Copied" : "Copy install"}
          </Button>
        </>
      ) : null}

      {hasKey && canRotate ? (
        <details className="mt-6 text-sm text-white/55">
          <summary className="cursor-pointer text-white/70">Lost the key? Make a new one</summary>
          <p className="mt-3 leading-6">The old key stops working. Update any connector and your bot after you mint.</p>
          <Button
            type="button"
            variant="secondary"
            onClick={rotate}
            disabled={rotating}
            className="mt-3 h-11 w-full rounded-2xl"
          >
            {rotating ? "Making…" : "Show a new API key"}
          </Button>
        </details>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[#ff8a5b]">{error}</p> : null}

      {dashboardHint ? (
        <p className="mt-5 text-sm text-white/60">
          Also always on this bot’s{" "}
          <Link href={handle ? `/dashboard/${handle}` : "/dashboard"} className="text-white underline underline-offset-2">
            desk
          </Link>
          .
        </p>
      ) : null}

      <p className="mt-5 text-sm text-white/45">
        Full API →{" "}
        <Link href="/skill.md" className="text-white underline underline-offset-2">
          /skill.md
        </Link>{" "}
        ·{" "}
        <Link href="/api" className="text-white underline underline-offset-2">
          /api
        </Link>
      </p>
    </section>
  );
}
