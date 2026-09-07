"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyPrompt({
  text,
  label = "Copy prompt",
  giant = false,
  onCopied,
}: {
  text: string;
  label?: string;
  giant?: boolean;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={onCopy}
        className={giant ? "h-16 w-full rounded-2xl text-xl" : "rounded-2xl"}
        size={giant ? "lg" : "default"}
      >
        {copied ? "Copied. Paste it into your bot." : label}
      </Button>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-foreground p-4 font-mono text-[12px] leading-6 text-background">
        {text}
      </pre>
    </div>
  );
}
