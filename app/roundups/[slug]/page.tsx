import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, Related, SponsorSlot, StatusBadge } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { getRoundup, roundupRows } from "@/lib/use-cases/content";
import { breadcrumbLd, clip, itemListLd, pageMeta } from "@/lib/use-cases/seo";
import { BRAND, STATUS_LABEL } from "@/lib/use-cases/taxonomy";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const roundup = getRoundup(slug);
  if (!roundup) return {};
  return pageMeta({
    path: `/roundups/${roundup.slug}`,
    absoluteTitle: true,
    title: `${roundup.title}: ${roundup.entries.length} Real Setups | ${BRAND}`,
    description: clip(roundup.intro),
  });
}

export default async function RoundupPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const roundup = getRoundup(slug);
  if (!roundup) notFound();
  const rows = roundupRows(roundup);
  const path = `/roundups/${roundup.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Roundups", path: "/roundups" },
    { name: roundup.title, path },
  ];
  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: roundup.title,
          description: roundup.intro,
          author: { "@type": "Organization", name: BRAND },
        }}
      />
      <JsonLd data={itemListLd(roundup.title, path, rows.map((item) => item.row))} />
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { href: "/roundups", label: "Roundups" }, { label: roundup.title }]}
      />
      <h1 className="font-display mt-4 text-3xl sm:text-5xl">{roundup.title}</h1>
      <p className="mt-3 text-base leading-7 text-foreground/75">{roundup.intro}</p>
      <SponsorSlot />
      {rows.map(({ record, row }) => (
        <section key={row.href} className="mt-8 border-t border-foreground/10 pt-6">
          <h2 className="font-display text-2xl">
            <Link href={row.href} className="underline-offset-4 hover:underline">
              {record.title}
            </Link>
          </h2>
          <p className="mt-2 text-sm text-foreground/55">
            {record.creator ? `@${record.creator.handle}` : "Creator not named"} · <StatusBadge status={record.status} />
          </p>
          <p className="mt-3 text-base leading-7 text-foreground/80">
            {record.kind === "use-case" ? record.whatTheyDid : record.whatItDoes}
          </p>
          <p className="mt-2 text-base leading-7 text-foreground/80">
            {record.kind === "use-case" ? record.howItWent : record.howItWent}
          </p>
          {record.sourceUrl ? (
            <p className="mt-2 text-sm">
              <a href={record.sourceUrl} className="underline underline-offset-4" rel="noreferrer noopener">
                {record.sourceLabel}
              </a>
            </p>
          ) : null}
          <p className="mt-2 text-sm">
            <Link href={row.href} className="underline underline-offset-4">
              {record.kind === "template" ? "Template page" : "Full card"}
            </Link>
          </p>
        </section>
      ))}
      <section className="mt-10 overflow-x-auto">
        <h2 className="font-display text-2xl">Compare</h2>
        <table className="mt-3 w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-foreground/15 text-foreground/50">
              <th className="py-2 pr-3 font-medium">Setup</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Install</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ record, row }) => (
              <tr key={row.href} className="border-b border-foreground/8">
                <td className="py-2 pr-3">
                  <Link href={row.href} className="underline underline-offset-4">
                    {record.title}
                  </Link>
                </td>
                <td className="py-2 pr-3">{STATUS_LABEL[record.status]}</td>
                <td className="py-2 pr-3">{record.kind === "template" && record.installUrl ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">How to pick one</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">
          Open a card whose status is Worked or Partly worked and whose source still loads. If the status is
          Unconfirmed, the listing did not state a result. This page does not rank them beyond that.
        </p>
      </section>
      <Related
        links={[
          { href: "/agents/grok-bot", label: "Grok Bot", note: "Agent hub" },
          { href: "/jobs/money", label: "Money, bills and benefits", note: "Job hub" },
          { href: "/outcomes/save-money", label: "Save money", note: "Outcome" },
          { href: "/outcomes/make-money", label: "Make money", note: "Outcome" },
          { href: "/guides", label: "Guides", note: "Guides" },
          { href: "/use-cases", label: "All use cases", note: "Cards" },
        ]}
      />
    </article>
  );
}
