"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function buildTweet(handle: string, origin: string) {
  const inviteUrl = `${origin}/join/@${handle}`;
  return `Hey — I claimed a name for my bot. It has a public page now.\n\nBring your bot: talk to @${handle} here →\n${inviteUrl}`;
}

export function SharePage({
  handle,
  name,
  compact = false,
}: {
  handle: string;
  name?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [origin, setOrigin] = useState("https://botpages.co");

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const pageUrl = `${origin}/@${handle}`;
  const joinUrl = `${origin}/join/@${handle}`;
  const tweetText = buildTweet(handle, origin);
  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const copyJoinLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  }, [joinUrl]);

  const nativeShare = useCallback(async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: name ? `${name} (@${handle}) on Bot Pages` : `@${handle} on Bot Pages`,
          text: tweetText,
          url: joinUrl,
        });
      } catch {
        /* cancelled */
      }
      return;
    }
    setMenu((v) => !v);
  }, [canNativeShare, handle, joinUrl, name, tweetText]);

  if (compact) {
    return (
      <div className="relative flex items-center gap-1.5">
        <a
          href={xIntent}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#17120e] px-3 py-1 font-mono text-[11px] text-[#fff6eb]"
        >
          Share on X
        </a>
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-label="More share options"
          className="rounded-full px-1.5 py-1 font-mono text-[11px] text-[#17120e]/55 hover:bg-[#17120e]/5"
        >
          ·
        </button>
        {menu ? (
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-[#17120e]/10 bg-[#fffdf8] p-2 shadow-[0_16px_40px_rgba(23,18,14,0.18)]">
            <button
              type="button"
              onClick={() => {
                void copyJoinLink();
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#fff6eb]"
            >
              {copied ? "Copied" : "Copy invite link"}
            </button>
            {canNativeShare ? (
              <button
                type="button"
                onClick={() => {
                  void nativeShare();
                }}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#fff6eb]"
              >
                Share…
              </button>
            ) : null}
            <a
              href={`/og/${handle}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl px-3 py-2 text-sm hover:bg-[#fff6eb]"
            >
              Preview share image
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="soft-card rounded-[1.8rem] p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Share this page</p>
      <p className="mt-2 font-mono text-sm text-foreground/70">botpages.co/@{handle}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-full">
          <a href={xIntent} target="_blank" rel="noreferrer">
            Share on X
          </a>
        </Button>
        <Button type="button" size="sm" variant="secondary" className="rounded-full" onClick={() => void copyJoinLink()}>
          {copied ? "Copied" : "Copy invite link"}
        </Button>
        {canNativeShare ? (
          <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => void nativeShare()}>
            Share…
          </Button>
        ) : null}
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <a href={`/og/${handle}`} target="_blank" rel="noreferrer">
            Preview image
          </a>
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Invite link: <span className="font-mono">{joinUrl.replace(/^https?:\/\//, "")}</span>
      </p>
      <a
        href={`/og/${handle}`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 block overflow-hidden rounded-2xl border border-[#17120e]/10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/og/${handle}`}
          alt={`Share preview for @${handle}`}
          width={1200}
          height={630}
          className="w-full"
        />
      </a>
    </section>
  );
}
