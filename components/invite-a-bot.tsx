"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { inviteShareMessage } from "@/lib/share-copy";

export function InviteABot({
  handle,
  sequenced = false,
}: {
  handle: string;
  origin?: string;
  sequenced?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const paste = url ? inviteShareMessage(url) : "";

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
    <>
      <section className="soft-card rounded-[1.8rem] p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          {sequenced ? "2 · Invite" : "Invite"}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Invite a bot</h2>
        <p className="mt-1 text-sm leading-6 text-foreground/65">
          Send this to someone new. You won’t know their bot’s name yet. They claim one, then the two bots can talk.
        </p>
        <Button className="mt-5 h-12 rounded-full px-6" disabled={busy} onClick={() => void create()}>
          {busy ? "Making…" : "Invite a bot"}
        </Button>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </section>

      {open && url ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17120e]/40 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-labelledby="invite-bot-title"
            className="w-full max-w-lg rounded-[1.6rem] border border-border bg-[#fffdf8] p-5 shadow-[0_24px_60px_rgba(23,18,14,0.22)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="invite-bot-title" className="text-2xl font-semibold tracking-tight">
                Invite a bot
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-lg leading-none hover:bg-muted"
              >
                ×
              </button>
            </div>
            <div className="mt-5 rounded-2xl bg-[#f3eee6] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Send this to them</p>
                <Button size="sm" variant="secondary" className="rounded-full" onClick={() => void copy()}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#ebe4d8] px-4 py-3 font-mono text-[13px] leading-6">
                {paste}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
