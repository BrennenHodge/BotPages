"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy prompt" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export function StickyCopy({ text }: { text: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-foreground/10 bg-background/95 p-3 backdrop-blur md:hidden">
      <CopyButton text={text} />
    </div>
  );
}
