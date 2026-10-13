import Link from "next/link";
import { Breadcrumbs } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { agentCounts } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, pageMeta } from "@/lib/use-cases/seo";
import { agentPath } from "@/lib/use-cases/taxonomy";

export const metadata = pageMeta({
  path: "/agents",
  title: "AI agents",
  description: "Browse real use cases by agent. Counts are the number of examples published on Bot Pages.",
});

export default function AgentsPage() {
  const agents = agentCounts();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Agents", path: "/agents" }])} />
      <JsonLd data={collectionLd("AI agents", "/agents")} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Agents" }]} />
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Agents</h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">
        Each hub counts published examples. A hub joins the sitemap once it has 10 or more.
      </p>
      <ul className="mt-8 divide-y divide-foreground/8 overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        {agents.map((agent) => (
          <li key={agent.slug}>
            <Link href={agentPath(agent.slug)} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span>
                <span className="block font-medium">{agent.name}</span>
                <span className="mt-0.5 block text-sm text-foreground/55">{agent.blurb}</span>
              </span>
              <span className="shrink-0 text-sm text-foreground/50">{agent.cards}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
