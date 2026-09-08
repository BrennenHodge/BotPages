"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { IntegrationMark } from "@/components/integration-mark";
import {
  CATEGORY_LABEL,
  CATEGORY_PILL,
  INTEGRATION_LABEL,
  WILD_CATEGORIES,
  xProfileUrl,
  type IntegrationId,
  type WildCategory,
  type WildRow,
} from "@/lib/wild-data";
import { Input } from "@/components/ui/input";

export function WildDirectory({ rows }: { rows: WildRow[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<WildCategory | "all">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((row) => {
      if (category !== "all" && row.category !== category) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.handle.includes(needle) ||
        row.blurb.toLowerCase().includes(needle) ||
        row.xHandle.toLowerCase().includes(needle) ||
        row.tags.some((tag) => tag.includes(needle)) ||
        CATEGORY_LABEL[row.category].toLowerCase().includes(needle)
      );
    });
  }, [rows, q, category]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search name, handle, or X…"
          aria-label="Search shareable Grok bots"
          className="h-12 rounded-2xl border-0 bg-card shadow-[0_1px_2px_rgba(23,18,14,0.06)] sm:max-w-sm"
        />
        <p className="text-sm text-muted-foreground sm:ml-auto">
          {filtered.length} of {rows.length}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CategoryChip active={category === "all"} onClick={() => setCategory("all")} count={rows.length}>
          All
        </CategoryChip>
        {WILD_CATEGORIES.map((key) => {
          const count = rows.filter((row) => row.category === key).length;
          if (!count) return null;
          return (
            <CategoryChip key={key} active={category === key} onClick={() => setCategory(key)} count={count}>
              {CATEGORY_LABEL[key]}
            </CategoryChip>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.6rem] bg-card">
        <div className="hidden grid-cols-[minmax(0,1.5fr)_7.5rem_minmax(9rem,1.5fr)_8rem] gap-3 border-b border-[#17120e]/8 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/40 md:grid">
          <span>Bot</span>
          <span>Category</span>
          <span>Integrations</span>
          <span>Source</span>
        </div>
        <ul className="divide-y divide-[#17120e]/8">
          {filtered.map((row) => (
            <li key={row.handle} className="px-5 py-4 transition-colors hover:bg-[#fff6eb]/70">
              <div className="grid gap-2 md:grid-cols-[minmax(0,1.5fr)_7.5rem_minmax(9rem,1.5fr)_8rem] md:items-center">
                <Link href={`/${row.handle}`} className="min-w-0">
                  <p className="font-medium tracking-tight">{row.name}</p>
                  <p className="mt-0.5 font-mono text-[13px] text-foreground/50">@{row.handle}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground/60 md:hidden">{row.blurb}</p>
                </Link>
                <span
                  className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${CATEGORY_PILL[row.category]}`}
                >
                  {CATEGORY_LABEL[row.category]}
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {visibleIntegrations(row.integrations).map((id) => (
                    <span key={id} className="inline-flex items-center gap-1.5 text-[13px] text-foreground/70">
                      <IntegrationMark id={id} />
                      <span className="hidden sm:inline">{INTEGRATION_LABEL[id]}</span>
                    </span>
                  ))}
                </div>
                <a
                  href={row.sourceUrl || xProfileUrl(row.xHandle)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[13px] text-foreground/55 hover:text-foreground"
                >
                  @{row.xHandle}
                </a>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Nobody by that name yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function visibleIntegrations(ids: IntegrationId[]) {
  const preferred: IntegrationId[] = ["x", "hackernews", "github", "reddit", "gmail", "calendar", "slack", "grok"];
  return preferred.filter((id) => ids.includes(id)).slice(0, 4);
}

function CategoryChip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-foreground text-background" : "bg-card text-foreground/70 hover:text-foreground"
      }`}
    >
      {children}
      <span className={`ml-1.5 font-mono text-[11px] ${active ? "text-background/70" : "text-foreground/40"}`}>
        {count}
      </span>
    </button>
  );
}
