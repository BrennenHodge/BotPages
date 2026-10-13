import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage } from "@/components/use-cases/hub-page";
import {
  agentCardCount,
  agentGuideCount,
  agentHubIndexable,
  cardsForAgent,
  groupByJob,
  hubFaqs,
  jobsForAgent,
  startHere,
  templatesForAgent,
  toRow,
} from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, itemListLd, pageMeta } from "@/lib/use-cases/seo";
import { agentBySlug, agentPath } from "@/lib/use-cases/taxonomy";

type Params = { agent: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { agent: slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) return {};
  const n = agentCardCount(slug);
  const g = agentGuideCount(slug);
  return pageMeta({
    path: agentPath(slug),
    absoluteTitle: true,
    title: `${agent.name} Use Cases: ${n} Real ${n === 1 ? "Example" : "Examples"} + Guides (2026)`,
    description: `${n} real things people did with ${agent.name}, including what didn't work. Prompts, sources and ${g} step-by-step guides.`,
    indexable: agentHubIndexable(slug),
  });
}

export default async function AgentHubPage({ params }: { params: Promise<Params> }) {
  const { agent: slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) notFound();
  const published = cardsForAgent(slug);
  const templates = templatesForAgent(slug);
  const n = published.length;
  const g = agentGuideCount(slug);
  const failed = published.filter((item) => item.status === "didnt-work").length;
  const jobs = jobsForAgent(slug);
  const groups = groupByJob(published).map((group) => ({
    ...group,
    href: `/agents/${slug}/${group.slug}`,
  }));
  const topJobs = jobs
    .map((job) => ({ label: job.label, count: job.count }))
    .sort((a, b) => b.count - a.count);
  const path = agentPath(slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Agents", path: "/agents" },
    { name: agent.name, path },
  ];
  const listRows = published.map((item) => ({
    title: item.title,
    href: item.kind === "guide" ? `/guides/${item.slug}` : `/use-cases/${item.slug}`,
  }));

  const lede = n
    ? `${agent.blurb} ${topJobs[0] ? `Most of the published examples are in ${topJobs[0].label}.` : ""} ${
        failed
          ? `${failed} ${failed === 1 ? "card is" : "cards are"} marked Didn't work.`
          : "No published card here is marked Didn't work."
      }`
    : `${agent.blurb} Nothing is published for ${agent.name} yet.`;

  return (
    <HubPage
      crumbs={crumbs.map((crumb, index) => ({
        href: index < crumbs.length - 1 ? crumb.path : undefined,
        label: crumb.name,
      }))}
      title={`${agent.name} use cases: ${n} real ${n === 1 ? "example" : "examples"} and ${g} step-by-step ${g === 1 ? "guide" : "guides"}`}
      lede={lede}
      introExtra={
        agent.officialUrl ? (
          <p className="mt-3 text-sm">
            <a href={agent.officialUrl} className="underline underline-offset-4" rel="noreferrer noopener">
              Official site
            </a>
          </p>
        ) : null
      }
      chips={jobs.map((job) => ({ href: job.href, label: job.label, count: job.count }))}
      start={startHere(published.length ? published : templates)}
      groups={groups}
      more={
        templates.length
          ? {
              title: `Templates (${templates.length})`,
              href: slug === "grok-bot" ? "/agents/grok-bot/templates" : undefined,
              rows: templates.map(toRow),
            }
          : undefined
      }
      faqs={hubFaqs(agent.name, n, templates.length, topJobs)}
      jsonLd={[
        breadcrumbLd(crumbs),
        collectionLd(`${agent.name} use cases`, path, agent.name),
        itemListLd(`${agent.name} use cases`, path, listRows),
      ]}
    />
  );
}
