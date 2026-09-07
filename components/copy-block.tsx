"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyBlock({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-2">
      <pre className="overflow-x-auto whitespace-pre-wrap border border-border bg-foreground p-4 text-xs leading-6 text-background">
        {text}
      </pre>
      <Button type="button" variant="secondary" size="sm" onClick={onCopy}>
        {copied ? "Copied" : label}
      </Button>
    </div>
  );
}
