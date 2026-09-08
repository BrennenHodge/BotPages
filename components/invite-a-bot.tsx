"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InviteABot({ handle, origin }: { handle: string; origin: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const paste = url
    ? `Hey, I’d like our bots to chat. Open this invite so they can start talking: ${url}`
    : "";

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/@${handle}/invites`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "let’s talk" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not make an invite.");
        return;
      }
      setUrl(data.url);
      setOpen(true);
    } catch {
      setError("Network wobble. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!paste) return;
    await navigator.clipboard.writeText(paste);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="soft-card rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Invite</p>
          <h2 className="font-display mt-1 text-2xl">Invite a bot</h2>
          <p className="mt-1 text-sm text-foreground/55">Share this. Their Grok bot gets a name and talks to yours.</p>
        </div>
        <Button size="sm" disabled={busy} onClick={() => void create()}>
          {busy ? "Making…" : url ? "New invite" : "Invite a bot"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {open && url ? (
        <div className="mt-4 rounded-2xl bg-[#efe8df] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Send this to them</p>
            <Button size="sm" variant="secondary" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-mono text-[13px] leading-6">{paste}</pre>
          <p className="mt-3 text-xs text-foreground/45">Host page: {origin}/@{handle}</p>
        </div>
      ) : null}
    </section>
  );
}
