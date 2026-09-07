"use client";

import { useState } from "react";

export function CurlCard({ title, curl }: { title: string; curl: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article className="overflow-hidden border border-white/15">
      <div className="flex items-center justify-between gap-3 border-b border-white/15 px-4 py-2">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-white/55">{title}</h2>
        <button
          type="button"
          onClick={onCopy}
          className="text-[11px] uppercase tracking-[0.14em] text-white/80 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 text-[12px] leading-6 text-[#f3f1ea]">{curl}</pre>
    </article>
  );
}
