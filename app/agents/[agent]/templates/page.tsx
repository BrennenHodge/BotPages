import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, ChipRow, RecordList } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { groupByJob, templatesForAgent } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, pageMeta } from "@/lib/use-cases/seo";
import { agentBySlug, agentPath, jobPath } from "@/lib/use-cases/taxonomy";

type Params = { agent: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { agent } = await params;
  if (agent !== "grok-bot") return {};
  const n = templatesForAgent(agent).length;
  return pageMeta({
    path: "/agents/grok-bot/templates",
    absoluteTitle: true,
    title: `Grok Bot Templates: ${n} Install Listings | Bot Pages`,
    description: `${n} public Grok Bot templates, deduped by install link, each with a setup and a starter prompt.`,
  });
}

export default async function TemplatesPage({ params }: { params: Promise<Params> }) {
  const { agent } = await params;
  if (agent !== "grok-bot") notFound();
  const info = agentBySlug(agent);
  if (!info) notFound();
  const templates = templatesForAgent(agent);
  const groups = groupByJob(templates);
  const path = "/agents/grok-bot/templates";
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: info.name, path: agentPath(agent) },
          { name: "Templates", path },
        ])}
      />
      <JsonLd data={collectionLd("Grok Bot templates", path, info.name)} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: agentPath(agent), label: info.name },
          { label: "Templates" },
        ]}
      />
      <h1 className="font-display mt-4 text-3xl sm:text-5xl">Grok Bot templates: {templates.length} listings</h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">
        Public templates from grokbot.money and Bot Pages, deduped by install URL. A listing that does not state a
        result stays Unconfirmed.
      </p>
      <div className="mt-5">
        <ChipRow items={groups.map((group) => ({ href: jobPath(group.slug), label: group.label, count: group.rows.length }))} />
      </div>
      {groups.map((group) => (
        <section key={group.slug} className="mt-8">
          <h2 className="font-display text-2xl">{group.label}</h2>
          <div className="mt-3">
            <RecordList rows={group.rows} />
          </div>
        </section>
      ))}
    </div>
  );
}
