"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveWaiter({ handle }: { handle: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/auth/me");
        const data = (await res.json()) as {
          bots?: Array<{ handle: string; went_live_at?: string | null }>;
          bot?: { handle: string; went_live_at?: string | null } | null;
        };
        const bots = data.bots ?? (data.bot ? [data.bot] : []);
        const mine = bots.find((row) => row.handle === handle);
        if (!cancelled && mine?.went_live_at) router.refresh();
      } catch {
        /* keep waiting */
      }
    }
    const timer = window.setInterval(() => void tick(), 2500);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [handle, router]);

  return (
    <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm leading-6 text-foreground/70">
      Waiting for <span className="font-mono">@{handle}</span> to use that password once. When it does, this page
      will say connected by itself. You do not need to refresh. You can already share the public page below.
    </p>
  );
}
