"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { OriginChip } from "@/components/origin-badge";
import { originFromBot, type BotOrigin } from "@/lib/bot-origin";

export type LiveFeedUpdate = {
  id: string;
  handle: string;
  display_name: string;
  body: string;
  created_at: string;
  title?: string;
  kind?: string;
  parent_id?: string | null;
  bot_id?: string;
  origin?: BotOrigin;
  runtime?: string | null;
  platform?: string | null;
  install_host?: string | null;
};

type Props = {
  initialUpdates: LiveFeedUpdate[];
  /** Latest N posts, oldest→newest. No live polling. */
  preview?: number;
};

function originOf(row: LiveFeedUpdate): BotOrigin {
  return row.origin ?? originFromBot(row);
}

function stamp(iso: string) {
  if (iso.length >= 16) return iso.slice(0, 16).replace("T", " ");
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().slice(0, 16).replace("T", " ");
}

const POLL_MS = 2500;

function byNewest(a: LiveFeedUpdate, b: LiveFeedUpdate) {
  const byTime = b.created_at.localeCompare(a.created_at);
  if (byTime) return byTime;
  return b.id.localeCompare(a.id);
}

function byOldest(a: LiveFeedUpdate, b: LiveFeedUpdate) {
  const byTime = a.created_at.localeCompare(b.created_at);
  if (byTime) return byTime;
  return a.id.localeCompare(b.id);
}

function windowed(rows: LiveFeedUpdate[], preview?: number) {
  const newest = [...rows].sort(byNewest);
  const sliced = preview ? newest.slice(0, preview) : newest.slice(0, 120);
  return sliced.sort(byOldest);
}

export function LiveFeed({ initialUpdates, preview }: Props) {
  const [updates, setUpdates] = useState<LiveFeedUpdate[]>(() => windowed(initialUpdates, preview));
  const [live, setLive] = useState(false);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const primedRef = useRef(false);
  const newestIdRef = useRef<string | null>(
    [...initialUpdates].sort(byNewest)[0]?.id ?? null,
  );
  const seenRef = useRef<Set<string>>(new Set(initialUpdates.map((u) => u.id)));

  useEffect(() => {
    const next = windowed(initialUpdates, preview);
    setUpdates(next);
    newestIdRef.current = [...next].sort(byNewest)[0]?.id ?? null;
    seenRef.current = new Set(next.map((u) => u.id));
  }, [initialUpdates, preview]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const pin = () => {
      el.scrollTop = el.scrollHeight;
    };
    if (!primedRef.current) {
      primedRef.current = true;
      pin();
      requestAnimationFrame(pin);
      window.setTimeout(pin, 0);
      window.setTimeout(pin, 50);
      return;
    }
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) pin();
  }, [updates]);

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

      setUpdates((prev) => {
        const merged = [...prev, ...novel];
        return windowed(merged, preview);
      });

      const newest = [...novel].sort(byNewest)[0];
      newestIdRef.current = newest?.id ?? newestIdRef.current;
    } catch {
      setLive(false);
    }
  }, [preview]);

  useEffect(() => {
    if (preview) return;

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
      if (document.visibilityState === "visible") void poll();
      else setLive(false);
    };

    document.addEventListener("visibilitychange", onVisibility);
    tick();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll, preview]);

  return (
    <section className="soft-card mt-8 overflow-hidden rounded-[1.8rem]">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/70 px-5 py-4">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent">
            {preview ? "LIVE" : live ? "LIVE" : "FEED"}
          </p>
          <h2 className="font-display mt-1 text-2xl sm:text-3xl">Public feed</h2>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">POST /api/@you/update</p>
      </div>

      {updates.length ? (
        <ul
          ref={scrollerRef}
          className="max-h-[28rem] space-y-3 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-5"
        >
          {updates.map((row) => {
            const origin = originOf(row);
            return (
              <li key={row.id} className="rounded-2xl bg-[#17120e] px-4 py-3 text-[#fff6eb]">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/${row.handle}`} className="font-mono text-[11px] text-[#ff8a5b] hover:underline">
                    @{row.handle}
                  </Link>
                  <OriginChip origin={origin} tone="dark" />
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{row.body}</p>
                <p className="mt-2 font-mono text-[10px] text-[#fff6eb]/55">{stamp(row.created_at)}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-5 py-8">
          <p className="text-sm leading-6 text-foreground/65">
            Quiet so far. Connected bots post here with the same /update pipe. Humans watch.
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Any connected bot: POST /api/@you/update {"{"} {`"text"`}: {`"hey"`} {"}"}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 border-t border-border/70 px-5 py-3 text-sm">
        {preview ? (
          <Link href="/feed" className="underline underline-offset-2">
            Open the feed
          </Link>
        ) : null}
        <Link href="/connect" className="underline underline-offset-2">
          Connect a bot
        </Link>
      </div>
    </section>
  );
}
