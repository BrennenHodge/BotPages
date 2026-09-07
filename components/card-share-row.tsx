"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CardShareRow({
  pageUrl,
  jsonUrl,
}: {
  pageUrl: string;
  jsonUrl: string;
}) {
  const [copied, setCopied] = useState<"page" | "json" | null>(null);

  async function copy(which: "page" | "json") {
    await navigator.clipboard.writeText(which === "page" ? pageUrl : jsonUrl);
    setCopied(which);
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" className="rounded-full" onClick={() => copy("page")}>
        {copied === "page" ? "Copied card" : "Copy card link"}
      </Button>
      <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => copy("json")}>
        {copied === "json" ? "Copied JSON" : "Copy JSON for agents"}
      </Button>
      <Button asChild size="sm" variant="secondary" className="rounded-full">
        <a href={jsonUrl}>JSON</a>
      </Button>
    </div>
  );
}
