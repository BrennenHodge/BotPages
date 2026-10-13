import Link from "next/link";
import { STATUS_LABEL, type Status } from "@/lib/use-cases/taxonomy";
import type { RelatedLink } from "@/lib/use-cases/types";
import type { Row } from "@/lib/use-cases/content";
import { CopyButton } from "./copy-button";

const STATUS_CLASS: Record<Status, string> = {
  worked: "bg-[#e7f3ea] text-[#1f6b32]",
  "partly-worked": "bg-[#fff0d6] text-[#8a5a12]",
  "didnt-work": "bg-[#ffe0d6] text-[#a32015]",
  unconfirmed: "bg-muted text-foreground/70",
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}>
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-foreground/55">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={index === items.length - 1 ? "text-foreground/80" : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ChipRow({ items }: { items: { href: string; label: string; count?: number }[] }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-full border border-foreground/10 bg-card px-3 py-1.5 text-sm text-foreground/80 hover:border-foreground/25"
        >
          {item.label}
          {item.count !== undefined ? <span className="ml-1.5 text-foreground/45">{item.count}</span> : null}
        </Link>
      ))}
    </div>
  );
}

export function RecordList({ rows }: { rows: Row[] }) {
  if (!rows.length) {
    return <p className="text-sm text-foreground/60">Nothing published here yet.</p>;
  }
  return (
    <ul className="divide-y divide-foreground/8 overflow-hidden rounded-2xl border border-foreground/10 bg-card">
      {rows.map((row) => (
        <li key={row.href}>
          <Link href={row.href} className="block px-4 py-3.5 hover:bg-foreground/[0.03] sm:px-5">
            <span className="flex flex-wrap items-center gap-2">
              <StatusBadge status={row.status} />
              <span className="text-xs text-foreground/45">{row.agent}</span>
            </span>
            <span className="mt-1.5 block font-medium leading-snug">{row.title}</span>
            <span className="mt-1 block text-sm leading-6 text-foreground/60">{row.summary}</span>
            <span className="mt-1 block text-xs text-foreground/45">{row.meta}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PromptBlock({ text, credit }: { text: string; credit: string }) {
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Prompt</h2>
        <CopyButton text={text} />
      </div>
      <p className="mt-2 text-sm text-foreground/55">{credit}</p>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-foreground p-4 font-mono text-[13px] leading-6 text-background">
        {text}
      </pre>
    </section>
  );
}

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">FAQ</h2>
      <dl className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-medium">{item.question}</dt>
            <dd className="mt-1 text-sm leading-6 text-foreground/70">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Related({ links }: { links: RelatedLink[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">Related</h2>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-foreground underline decoration-foreground/20 underline-offset-4">
              {link.label}
            </Link>
            <span className="ml-2 text-sm text-foreground/45">{link.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SponsorSlot() {
  return (
    <aside className="mt-8 rounded-2xl border border-dashed border-foreground/15 px-4 py-3 text-sm text-foreground/60">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/40">Sponsor</p>
      <p className="mt-1">
        No sponsor on this page.{" "}
        <Link href="/sponsor" className="underline underline-offset-4">
          How a sponsor slot works
        </Link>
      </p>
    </aside>
  );
}

export function SourceLine({ href, label }: { href: string; label: string }) {
  return (
    <p className="mt-4 text-sm leading-6">
      <span className="text-foreground/50">Source: </span>
      <a href={href} className="underline underline-offset-4" target="_blank" rel="noreferrer noopener">
        {label}
      </a>
    </p>
  );
}
