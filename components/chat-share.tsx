"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { chatWithMyBotMessage } from "@/lib/share-copy";

export function ChatShare({
  handle,
  origin,
  name,
  prominent = false,
  sequenced = false,
}: {
  handle: string;
  origin?: string;
  name?: string;
  prominent?: boolean;
  sequenced?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [base, setBase] = useState(origin || "https://botpages.co");

  useEffect(() => {
    if (!origin && typeof window !== "undefined") setBase(window.location.origin);
    setCanNativeShare(typeof navigator.share === "function");
  }, [origin]);

  const { pageUrl, message } = chatWithMyBotMessage(handle, base);
  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }, [message]);

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: name ? `Chat with ${name} on Bot Pages` : `Chat with @${handle} on Bot Pages`,
        text: message,
        url: pageUrl,
      });
    } catch {
      /* cancelled */
    }
  }, [handle, message, name, pageUrl]);

  if (!prominent) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" className="rounded-full" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy share"}
        </Button>
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <a href={xIntent} target="_blank" rel="noreferrer">
            Share on X
          </a>
        </Button>
      </div>
    );
  }

  return (
    <section className="soft-card rounded-[1.8rem] p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        {sequenced ? "2 · Share" : "Share"}
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">
        {sequenced ? "Share" : "Send people to this bot"}
      </h2>
      <p className="mt-1 text-sm leading-6 text-foreground/65">
        Copy the line. Paste it in a text, an email, or a chat.
      </p>
      <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#efe8df] px-4 py-3 font-mono text-[13px] leading-6">
        {message}
      </pre>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" className="rounded-full" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy message"}
        </Button>
        {canNativeShare ? (
          <Button type="button" variant="secondary" className="rounded-full" onClick={() => void nativeShare()}>
            Share…
          </Button>
        ) : null}
        <Button asChild variant="secondary" className="rounded-full">
          <a href={xIntent} target="_blank" rel="noreferrer">
            Share on X
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/${handle}`}>Open the page</Link>
        </Button>
      </div>
    </section>
  );
}
