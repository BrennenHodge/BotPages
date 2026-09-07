"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Availability = {
  handle?: string;
  available?: boolean;
  reason?: string;
  pricing?: { label?: string; free?: boolean; letters?: number; amount_usd?: number };
};

export function HandleClaimForm({
  initialHandle = "",
  size = "lg",
  cta = "Claim your name",
  preview = false,
  combined = false,
}: {
  initialHandle?: string;
  size?: "lg" | "md";
  cta?: string;
  preview?: boolean;
  combined?: boolean;
}) {
  const router = useRouter();
  const [handle, setHandle] = useState(initialHandle);
  const [check, setCheck] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = handle.trim().toLowerCase();
    if (trimmed.length < 3) {
      setCheck(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/handles/${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        const data = (await res.json()) as Availability & { ok?: boolean; free?: boolean; price_usd?: number };
        setCheck({
          handle: data.handle,
          available: data.available,
          reason: data.reason,
          pricing: {
            free: data.free ?? data.pricing?.free,
            label: data.pricing?.label ?? (data.free ? "Free" : data.price_usd != null ? `$${data.price_usd}/yr` : undefined),
            letters: data.pricing?.letters,
            amount_usd: data.price_usd ?? data.pricing?.amount_usd,
          },
        });
      } catch {
        /* abort */
      }
    }, 180);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [handle]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = handle.trim().toLowerCase();
    if (!trimmed) {
      setError("Pick a name. Any name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/handles/${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as { available?: boolean; reason?: string; handle?: string };
      if (!data.available) {
        setError(data.reason ?? "Somebody already grabbed that one.");
        return;
      }
      router.push(`/claim?handle=${encodeURIComponent(data.handle ?? trimmed)}`);
    } catch {
      setError("Could not check that name. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const big = size === "lg";
  const free = Boolean(check?.available && check.pricing?.free);
  const paid = Boolean(check?.available && check.pricing && !check.pricing.free);

  const field = (
    <Input
      value={handle}
      onChange={(event) => setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
      placeholder="yourname"
      autoComplete="off"
      spellCheck={false}
      aria-label="Handle to claim"
      className={
        combined
          ? "h-12 flex-1 border-0 bg-transparent px-1 font-mono text-lg shadow-none focus-visible:ring-0"
          : `rounded-2xl border-2 bg-card font-mono ${big ? "h-16 pl-12 text-2xl" : "h-12 pl-9 text-lg"}`
      }
    />
  );

  return (
    <form onSubmit={onSubmit} className="w-full">
      {combined ? (
        <div className="soft-card flex flex-col gap-2 rounded-[2rem] p-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center px-3">
            <span className="shrink-0 font-mono text-sm text-muted-foreground sm:text-base">botpages.co/</span>
            <span className="font-mono text-sm text-accent sm:text-base">@</span>
            {field}
          </div>
          <Button type="submit" disabled={loading} className="h-12 rounded-full px-7 text-base">
            {loading ? "Checking…" : cta}
          </Button>
        </div>
      ) : (
        <div className={`flex flex-col gap-3 ${big ? "sm:flex-row sm:items-stretch" : "sm:flex-row sm:items-center"}`}>
          <div className="relative flex-1">
            <span
              className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono font-semibold text-accent ${big ? "text-2xl" : "text-lg"}`}
            >
              @
            </span>
            {field}
          </div>
          <Button
            type="submit"
            size={big ? "lg" : "default"}
            disabled={loading}
            className={big ? "h-16 rounded-2xl px-8 text-lg" : "rounded-2xl"}
          >
            {loading ? "Checking…" : cta}
          </Button>
        </div>
      )}
      {preview ? (
        <p className="mt-4 font-mono text-sm text-muted-foreground">botpages.co/@{handle || "yourname"}</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {!error && check?.available === false ? (
        <p className="mt-3 text-sm text-destructive">{check.reason ?? "Taken. Try another."}</p>
      ) : null}
      {!error && free ? (
        <p className="mt-3 text-sm font-medium text-[#2a7a3a]">
          @{check?.handle} is free. It’s yours if you want it.
        </p>
      ) : null}
      {!error && paid ? (
        <p className="mt-3 text-sm font-medium">
          @{check?.handle} is short and fancy — {check?.pricing?.label}. Or add a couple letters and it’s free.
        </p>
      ) : null}
      {!error && !check && handle.length > 0 && handle.length < 3 ? (
        <p className="mt-3 text-sm text-muted-foreground">A little longer… 3 characters minimum.</p>
      ) : null}
    </form>
  );
}
