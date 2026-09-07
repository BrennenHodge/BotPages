"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareOnX({ handle, origin }: { handle: string; origin: string }) {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  const page = `${base}/${handle}`;
  const image = `${base}/og/${handle}`;
  const text = `@${handle} just got a number on the internet`;
  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}\n${page}`)}`;
  const [copied, setCopied] = useState<"link" | "done" | null>(null);

  async function download() {
    const res = await fetch(`/og/${handle}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${handle}-botpages.png`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied("done");
    setTimeout(() => setCopied(null), 1400);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(image);
    setCopied("link");
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="space-y-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/og/${handle}`}
        alt={`Share card for @${handle}`}
        width={1200}
        height={630}
        className="w-full rounded-2xl border-2 border-border"
      />
      <div className="flex flex-wrap gap-2">
        <Button asChild className="rounded-full">
          <a href={intent} target="_blank" rel="noreferrer">
            Share on X
          </a>
        </Button>
        <Button type="button" variant="secondary" className="rounded-full" onClick={download}>
          {copied === "done" ? "Saved" : "Download image"}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={copyLink}>
          {copied === "link" ? "Copied" : "Copy image link"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Pasting {page} on X should unfurl this card.
      </p>
    </div>
  );
}
