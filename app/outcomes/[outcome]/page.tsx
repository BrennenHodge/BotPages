import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage } from "@/components/use-cases/hub-page";
import {
  cardsForOutcome,
  groupByAgent,
  hubFaqs,
  startHere,
  templatesForOutcome,
  toRow,
} from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, itemListLd, pageMeta } from "@/lib/use-cases/seo";
import { JOBS, jobPath, outcomeBySlug, outcomePath } from "@/lib/use-cases/taxonomy";

type Params = { outcome: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { outcome: slug } = await params;
  const outcome = outcomeBySlug(slug);
  if (!outcome) return {};
  const n = cardsForOutcome(outcome.slug).length;
  return pageMeta({
    path: outcomePath(outcome.slug),
    absoluteTitle: true,
    title: `${outcome.label} with AI Agents: ${n} Real Use Cases and Guides`,
    description: `${n} published examples where the outcome is ${outcome.label.toLowerCase()}. Prompts, sources, and guides.`,
  });
}

export default async function OutcomePage({ params }: { params: Promise<Params> }) {
  const { outcome: slug } = await params;
  const outcome = outcomeBySlug(slug);
  if (!outcome) notFound();
  const published = cardsForOutcome(outcome.slug);
  const templates = templatesForOutcome(outcome.slug);
  if (!published.length && !templates.length) notFound();
  const path = outcomePath(outcome.slug);
  const groups = groupByAgent(published);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Outcomes", path: "/outcomes" },
    { name: outcome.label, path },
  ];
  return (
    <HubPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/outcomes", label: "Outcomes" },
        { label: outcome.label },
      ]}
      title={`${outcome.label} with AI agents: ${published.length} real examples`}
      lede={outcome.blurb}
      chips={JOBS.map((job) => ({
        href: jobPath(job.slug),
        label: job.label,
        count: published.filter((item) => item.category === job.slug).length,
      })).filter((chip) => chip.count > 0)}
      start={startHere(published.length ? published : templates)}
      groups={groups.map((group) => ({ slug: group.slug, label: group.name, href: group.href, rows: group.rows }))}
      more={templates.length ? { title: `Grok Bot templates (${templates.length})`, rows: templates.map(toRow) } : undefined}
      faqs={hubFaqs(
        outcome.label,
        published.length,
        templates.length,
        groups.map((group) => ({ label: group.name, count: group.rows.length })),
      )}
      jsonLd={[
        breadcrumbLd(crumbs),
        collectionLd(outcome.label, path),
        itemListLd(
          outcome.label,
          path,
          published.map((item) => ({
            title: item.title,
            href: item.kind === "guide" ? `/guides/${item.slug}` : `/use-cases/${item.slug}`,
          })),
        ),
      ]}
    />
  );
}
