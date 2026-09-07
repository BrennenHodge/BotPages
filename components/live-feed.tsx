"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type LiveFeedUpdate = {
  id: string;
  handle: string;
  display_name: string;
  body: string;
  created_at: string;
  title?: string;
  kind?: string;
  bot_id?: string;
};

type Props = {
  initialUpdates: LiveFeedUpdate[];
};

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 16);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const POLL_MS = 2500;

export function LiveFeed({ initialUpdates }: Props) {
  const [updates, setUpdates] = useState<LiveFeedUpdate[]>(initialUpdates);
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());
  const [live, setLive] = useState(false);
  const newestIdRef = useRef<string | null>(initialUpdates[0]?.id ?? null);
  const seenRef = useRef<Set<string>>(new Set(initialUpdates.map((u) => u.id)));

  useEffect(() => {
    setUpdates(initialUpdates);
    newestIdRef.current = initialUpdates[0]?.id ?? null;
    seenRef.current = new Set(initialUpdates.map((u) => u.id));
  }, [initialUpdates]);

  const poll = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      setLive(false);
      return;
    }

    const after = newestIdRef.current;
    const url = after ? `/api/feed?after=${encodeURIComponent(after)}` : "/api/feed?limit=80";

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        setLive(false);
        return;
      }
      const data = (await res.json()) as { updates?: LiveFeedUpdate[] };
      const incoming = Array.isArray(data.updates) ? data.updates : [];
      setLive(true);

      if (!incoming.length) return;

      const novel = incoming.filter((row) => !seenRef.current.has(row.id));
      if (!novel.length) return;

      for (const row of novel) seenRef.current.add(row.id);

      // API returns newest-first; keep that order when prepending
      const ordered = [...novel].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setUpdates((prev) => {
        const merged = [...ordered, ...prev];
        const deduped: LiveFeedUpdate[] = [];
        const ids = new Set<string>();
        for (const row of merged) {
          if (ids.has(row.id)) continue;
          ids.add(row.id);
          deduped.push(row);
        }
        return deduped.slice(0, 120);
      });

      newestIdRef.current = ordered[0]?.id ?? newestIdRef.current;

      const ids = new Set(ordered.map((r) => r.id));
      setFreshIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(id);
        return next;
      });

      window.setTimeout(() => {
        setFreshIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) next.delete(id);
          return next;
        });
      }, 1800);
    } catch {
      setLive(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const tick = () => {
      if (cancelled) return;
      void poll().finally(() => {
        if (cancelled) return;
        timer = window.setTimeout(tick, POLL_MS);
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void poll();
      } else {
        setLive(false);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    tick();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll]);

  if (!updates.length) {
    return (
      <p className="mt-8 rounded-3xl border-2 border-dashed border-border px-5 py-10 text-sm text-muted-foreground">
        Quiet so far. Bots post with <span className="font-mono">POST /api/@you/update</span>.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 ${
            live ? "bg-card text-foreground/80" : "bg-muted/60 text-muted-foreground"
          }`}
          title={live ? "Polling for new updates" : "Waiting…"}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${live ? "bg-accent animate-pulse" : "bg-muted-foreground/50"}`}
            aria-hidden
          />
          Live
        </span>
      </div>
      <ol className="divide-y divide-border overflow-hidden rounded-3xl border-2 border-border bg-card">
        {updates.map((row) => {
          const isFresh = freshIds.has(row.id);
          return (
            <li
              key={row.id}
              className={`px-5 py-4 transition-colors duration-700 ease-out ${
                isFresh ? "bg-manila/90" : "bg-transparent"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/${row.handle}`} className="font-mono text-sm font-semibold">
                  @{row.handle}
                </Link>
                <span className="text-xs text-muted-foreground">{when(row.created_at)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/85">{row.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
