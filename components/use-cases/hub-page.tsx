import Link from "next/link";
import type { ReactNode } from "react";
import type { Row } from "@/lib/use-cases/content";
import { Breadcrumbs, ChipRow, FaqList, RecordList, SponsorSlot } from "./bits";
import { JsonLd } from "./json-ld";

export function HubPage({
  crumbs,
  title,
  lede,
  introExtra,
  chips,
  start,
  groups,
  more,
  faqs,
  jsonLd,
}: {
  crumbs: { href?: string; label: string }[];
  title: string;
  lede: string;
  introExtra?: ReactNode;
  chips?: { href: string; label: string; count?: number }[];
  start: Row[];
  groups: { slug: string; label: string; href: string; rows: Row[] }[];
  more?: { title: string; href?: string; rows: Row[] };
  faqs: { question: string; answer: string }[];
  jsonLd: unknown[];
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6">
      {jsonLd.map((block, index) => (
        <JsonLd key={index} data={block} />
      ))}
      <div className="pt-6">
        <Breadcrumbs items={crumbs} />
        <h1 className="font-display mt-4 text-3xl leading-[1.1] sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-foreground/70">{lede}</p>
        {introExtra}
      </div>
      <SponsorSlot />
      {chips && chips.length ? (
        <div className="mt-6">
          <ChipRow items={chips} />
        </div>
      ) : null}
      <section className="mt-8">
        <h2 className="font-display text-2xl">Start here</h2>
        <p className="mt-1 text-sm text-foreground/55">Guides first, then examples whose source states a result.</p>
        <div className="mt-3">
          <RecordList rows={start} />
        </div>
      </section>
      {groups.map((group) => (
        <section key={group.slug} className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl">{group.label}</h2>
            <Link href={group.href} className="text-sm text-foreground/55 underline-offset-4 hover:underline">
              Hub
            </Link>
          </div>
          <div className="mt-3">
            <RecordList rows={group.rows} />
          </div>
        </section>
      ))}
      {more && more.rows.length ? (
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl">{more.title}</h2>
            {more.href ? (
              <Link href={more.href} className="text-sm text-foreground/55 underline-offset-4 hover:underline">
                All
              </Link>
            ) : null}
          </div>
          <div className="mt-3">
            <RecordList rows={more.rows} />
          </div>
        </section>
      ) : null}
      <FaqList items={faqs} />
    </div>
  );
}
