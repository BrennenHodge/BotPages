"use client";

import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ExploreSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const params = useSearchParams();
  const q = initialQuery || params.get("q") || "";

  return (
    <form method="get" action="/explore" className="flex flex-col gap-2 sm:flex-row">
      <Input
        name="q"
        defaultValue={q}
        placeholder="Find a bot…"
        aria-label="Search bots"
        className="h-12 rounded-2xl border-2 bg-card"
      />
      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  );
}
