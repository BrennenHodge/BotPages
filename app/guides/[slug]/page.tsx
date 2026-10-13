import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, FaqList, PromptBlock, Related, SourceLine, SponsorSlot, StatusBadge } from "@/components/use-cases/bits";
import { StickyCopy } from "@/components/use-cases/copy-button";
import { JsonLd } from "@/components/use-cases/json-ld";
import { getGuide, relatedLinks } from "@/lib/use-cases/content";
import { breadcrumbLd, pageMeta } from "@/lib/use-cases/seo";
import { agentBySlug, agentPath, jobBySlug, jobPath } from "@/lib/use-cases/taxonomy";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return pageMeta({
    path: `/guides/${guide.slug}`,
    absoluteTitle: true,
    title: guide.seoTitle,
    description: guide.seoDescription,
  });
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const agent = agentBySlug(guide.agents[0] ?? "");
  const job = jobBySlug(guide.category);
  const path = `/guides/${guide.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: agent?.name ?? "Agent", path: agent ? agentPath(agent.slug) : "/agents" },
    { name: job?.label ?? guide.category, path: jobPath(guide.category) },
    { name: guide.title, path },
  ];
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.summary,
    tool: { "@type": "HowToTool", name: guide.toolName },
    step: guide.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={howTo} />
      <JsonLd data={faqLd} />
      <Breadcrumbs
        items={crumbs.map((crumb, index) => ({
          href: index < crumbs.length - 1 ? crumb.path : undefined,
          label: crumb.name,
        }))}
      />
      <p className="mt-4 text-sm text-foreground/55">
        {agent?.name ?? "Agent"} guide · Shared by {guide.creatorName} (
        <a href={guide.creator.url} className="underline underline-offset-4" rel="noreferrer noopener">
          @{guide.creator.handle}
        </a>
        )
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {agent ? (
          <Link href={agentPath(agent.slug)} className="rounded-full bg-foreground px-2.5 py-1 text-xs text-background">
            {agent.name}
          </Link>
        ) : null}
        <StatusBadge status={guide.status} label={guide.statusNote} />
      </div>
      <h1 className="font-display mt-3 text-3xl leading-tight sm:text-5xl">{guide.title}</h1>

      <section className="mt-8">
        <h2 className="font-display text-2xl">The result</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">{guide.result}</p>
        <blockquote className="mt-4 border-l-2 border-accent pl-4 text-base leading-7">{guide.quote}</blockquote>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Who and the problem</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">{guide.who}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">The setup</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7 text-foreground/80">
          {guide.setup.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Copy this</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-7 text-foreground/80">
          {guide.steps.map((step) => (
            <li key={step.name}>
              <span className="font-medium text-foreground">{step.name}.</span> {step.text}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-6 text-foreground/55">
          Screenshot slots: the template install page and the team plan, from Damo with permission or from our own
          reproduction, labeled as such. None are published on this page yet.
        </p>
      </section>
      <PromptBlock text={guide.prompt} credit={guide.promptCredit} />
      <section className="mt-8">
        <h2 className="font-display text-2xl">Real results</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">{guide.results}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Watch out</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7 text-foreground/80">
          {guide.watchOut.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      {guide.installUrl ? (
        <section className="mt-8">
          <h2 className="font-display text-2xl">Install</h2>
          <p className="mt-3">
            <a
              href={guide.installUrl}
              className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
              rel="noreferrer noopener"
            >
              {guide.installLabel}
            </a>
          </p>
          <p className="mt-2 text-sm text-foreground/55">{guide.installNote}</p>
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="font-display text-2xl">Credit</h2>
        <p className="mt-2 text-base leading-7">
          {guide.credit}{" "}
          <a href={guide.sourceUrl} className="underline underline-offset-4" rel="noreferrer noopener">
            Original post
          </a>
          .
        </p>
        <SourceLine href={guide.sourceUrl} label={guide.sourceLabel} />
      </section>
      <SponsorSlot />
      <FaqList items={guide.faq} />
      <Related links={relatedLinks(guide, 6, 8)} />
      <StickyCopy text={guide.prompt} />
    </article>
  );
}
