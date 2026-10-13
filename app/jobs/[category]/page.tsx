import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage } from "@/components/use-cases/hub-page";
import {
  cardsForJob,
  groupByAgent,
  hubFaqs,
  startHere,
  templatesForJob,
  toRow,
} from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, itemListLd, pageMeta } from "@/lib/use-cases/seo";
import { JOB_INDEX_PATH, OUTCOMES, agentPath, jobBySlug, jobPath, outcomePath } from "@/lib/use-cases/taxonomy";

type Params = { category: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const job = jobBySlug(category);
  if (!job) return {};
  const n = cardsForJob(job.slug).length;
  return pageMeta({
    path: jobPath(job.slug),
    absoluteTitle: true,
    title: `AI Agents for ${job.label}: ${n} Real Use Cases and Guides`,
    description: `${n} real ${job.label.toLowerCase()} examples across agents, plus Grok Bot templates for the same job.`,
    indexable: n + templatesForJob(job.slug).length > 0,
  });
}

export default async function JobPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const job = jobBySlug(category);
  if (!job) notFound();
  const published = cardsForJob(job.slug);
  const templates = templatesForJob(job.slug);
  if (!published.length && !templates.length) notFound();
  const path = jobPath(job.slug);
  const groups = groupByAgent(published);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: JOB_INDEX_PATH },
    { name: job.label, path },
  ];
  const listRows = published.map((item) => ({
    title: item.title,
    href: item.kind === "guide" ? `/guides/${item.slug}` : `/use-cases/${item.slug}`,
  }));
  const agentChips = groups.map((group) => ({
    href: agentPath(group.slug),
    label: group.name,
    count: group.rows.length,
  }));
  return (
    <HubPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: JOB_INDEX_PATH, label: "Jobs" },
        { label: job.label },
      ]}
      title={`AI agents for ${job.label.toLowerCase()}: ${published.length} real examples`}
      lede={job.blurb}
      chips={[
        ...agentChips,
        ...OUTCOMES.map((outcome) => ({
          href: outcomePath(outcome.slug),
          label: outcome.label,
          count: published.filter((item) => item.outcomes.includes(outcome.slug)).length,
        })).filter((chip) => chip.count > 0),
      ]}
      start={startHere(published.length ? published : templates)}
      groups={groups.map((group) => ({ slug: group.slug, label: group.name, href: group.href, rows: group.rows }))}
      more={templates.length ? { title: `Grok Bot templates (${templates.length})`, rows: templates.map(toRow) } : undefined}
      faqs={hubFaqs(
        job.label,
        published.length,
        templates.length,
        groups.map((group) => ({ label: group.name, count: group.rows.length })),
      )}
      jsonLd={[breadcrumbLd(crumbs), collectionLd(`AI agents for ${job.label}`, path), itemListLd(job.label, path, listRows)]}
    />
  );
}
