import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, RecordList, SponsorSlot } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { agentJobCount, agentJobIndexable, cardsForAgent, toRow } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, itemListLd, pageMeta } from "@/lib/use-cases/seo";
import { agentBySlug, agentJobPath, agentPath, jobBySlug, jobPath } from "@/lib/use-cases/taxonomy";

type Params = { agent: string; category: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { agent, category } = await params;
  const agentInfo = agentBySlug(agent);
  const job = jobBySlug(category);
  if (!agentInfo || !job) return {};
  const n = agentJobCount(agent, category);
  return pageMeta({
    path: agentJobPath(agent, category),
    absoluteTitle: true,
    title: `${agentInfo.name} for ${job.label}: ${n} Real Use Cases`,
    description: `${n} published ${agentInfo.name} examples in ${job.label}, with prompts and sources.`,
    indexable: agentJobIndexable(agent, category),
  });
}

export default async function AgentJobPage({ params }: { params: Promise<Params> }) {
  const { agent, category } = await params;
  if (category === "templates") notFound();
  const agentInfo = agentBySlug(agent);
  const job = jobBySlug(category);
  if (!agentInfo || !job) notFound();
  const items = cardsForAgent(agent).filter((item) => item.category === category);
  if (!items.length) notFound();
  const path = agentJobPath(agent, category);
  const rows = items.map(toRow);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: agentInfo.name, path: agentPath(agent) },
    { name: job.label, path },
  ];
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={collectionLd(`${agentInfo.name} for ${job.label}`, path, agentInfo.name)} />
      <JsonLd data={itemListLd(`${agentInfo.name} · ${job.label}`, path, rows)} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: agentPath(agent), label: agentInfo.name },
          { label: job.label },
        ]}
      />
      <h1 className="font-display mt-4 text-3xl leading-tight sm:text-5xl">
        {agentInfo.name} for {job.label}: {items.length} real {items.length === 1 ? "example" : "examples"}
      </h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">{job.blurb}</p>
      <p className="mt-3 text-sm">
        <Link href={jobPath(category)} className="underline underline-offset-4">
          Same job, other agents
        </Link>
      </p>
      <SponsorSlot />
      <div className="mt-6">
        <RecordList rows={rows} />
      </div>
    </div>
  );
}
