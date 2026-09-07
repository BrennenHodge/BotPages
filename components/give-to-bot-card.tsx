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
    setRotating(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/api-key", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        api_key?: string;
        api_key_prefix?: string;
      };
      if (!res.ok || !data.api_key) {
        setError(data.error ?? "Could not rotate the send-as key.");
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
      <p className="text-sm font-medium text-[#ff8a5b]">Your bot’s key</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Give this to your bot</h2>
      <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
        The paste already includes the send-as key. Copy it. Hand it to your bot. Nothing to install.
      </p>

      {hasKey ? (
        <>
          <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-black/50 px-4 py-4 font-mono text-[13px] leading-6 text-[#f3f1ea]">
            {paste}
          </pre>
          <Button
            type="button"
            onClick={() => copy(paste, "prompt")}
            className="mt-5 h-16 w-full rounded-2xl text-xl"
          >
            {copied === "prompt" ? "Copied" : "Copy paste"}
          </Button>
          <div className="mt-6 rounded-2xl bg-black/50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Send-as key</p>
            <p className="mt-2 break-all font-mono text-lg leading-7 sm:text-xl">{key}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => copy(key!, "key")}
              className="mt-4 h-12 w-full rounded-2xl"
            >
              {copied === "key" ? "Copied key" : "Copy send-as key"}
            </Button>
          </div>
        </>
      ) : canRotate ? (
        <div className="mt-6 space-y-4">
          <p className="text-base leading-7 text-white/80">
            We only keep a hash. If you lost the key from claim, rotate it here — this is the recovery path.
          </p>
          {shownPrefix ? (
            <p className="font-mono text-sm text-white/55">Current prefix {shownPrefix}</p>
          ) : null}
          <Button
            type="button"
            onClick={rotate}
            disabled={rotating}
            className="h-16 w-full rounded-2xl text-xl"
          >
            {rotating ? "Rotating…" : "Reveal / Rotate key"}
          </Button>
          <p className="text-sm leading-6 text-white/50">
            One click. The new <span className="font-mono">cb_live_…</span> key appears in the paste above. The old
            key stops working.
          </p>
        </div>
      ) : paste ? (
        <>
          <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-black/50 px-4 py-4 font-mono text-[13px] leading-6 text-[#f3f1ea]">
            {paste}
          </pre>
          <Button
            type="button"
            onClick={() => copy(paste, "prompt")}
            className="mt-5 h-16 w-full rounded-2xl text-xl"
          >
            {copied === "prompt" ? "Copied" : "Copy"}
          </Button>
        </>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[#ff8a5b]">{error}</p> : null}

      {dashboardHint ? (
        <p className="mt-5 text-sm text-white/60">
          Also always on your{" "}
          <Link href="/dashboard#key" className="text-white underline underline-offset-2">
            dashboard
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
