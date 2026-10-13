import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, FaqList, PromptBlock, Related, SourceLine, SponsorSlot, StatusBadge } from "@/components/use-cases/bits";
import { StickyCopy } from "@/components/use-cases/copy-button";
import { JsonLd } from "@/components/use-cases/json-ld";
import { getTemplate, relatedLinks } from "@/lib/use-cases/content";
import { breadcrumbLd, clip, pageMeta } from "@/lib/use-cases/seo";
import { BRAND, agentBySlug, agentPath, jobBySlug, jobPath, outcomeBySlug, outcomePath } from "@/lib/use-cases/taxonomy";

type Params = { agent: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { agent, slug } = await params;
  if (agent !== "grok-bot") return {};
  const item = getTemplate(slug);
  if (!item) return {};
  const job = jobBySlug(item.category)?.label ?? item.category;
  return pageMeta({
    path: `/agents/grok-bot/templates/${slug}`,
    absoluteTitle: true,
    title: `${item.title}: Grok Bot template for ${job} | ${BRAND}`,
    description: clip(`${item.summary} Unconfirmed unless the listing states a result. Setup steps and a starter prompt.`),
  });
}

export default async function TemplatePage({ params }: { params: Promise<Params> }) {
  const { agent, slug } = await params;
  if (agent !== "grok-bot") notFound();
  const item = getTemplate(slug);
  const info = agentBySlug("grok-bot");
  const job = item ? jobBySlug(item.category) : null;
  if (!item || !info || !job) notFound();
  const path = `/agents/grok-bot/templates/${item.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: info.name, path: agentPath("grok-bot") },
    { name: "Templates", path: "/agents/grok-bot/templates" },
    { name: item.title, path },
  ];
  const related = relatedLinks(item);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.summary,
    dateModified: item.updatedAt ?? undefined,
    datePublished: item.addedAt ?? undefined,
    mainEntityOfPage: path,
    author: { "@type": "Organization", name: BRAND },
    about: { "@type": "SoftwareApplication", name: "Grok Bot" },
    ...(item.creator
      ? { mentions: { "@type": "Person", name: `@${item.creator.handle}`, url: item.creator.url } }
      : {}),
    ...(item.sourceUrl ? { citation: item.sourceUrl } : {}),
  };
  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={article} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: item.faq.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: agentPath("grok-bot"), label: info.name },
          { href: "/agents/grok-bot/templates", label: "Templates" },
          { label: item.title },
        ]}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={agentPath("grok-bot")} className="rounded-full bg-foreground px-2.5 py-1 text-xs text-background">
          Grok Bot
        </Link>
        <StatusBadge status={item.status} />
      </div>
      <h1 className="font-display mt-3 text-3xl leading-tight sm:text-5xl">{item.title}</h1>
      <p className="mt-3 text-base leading-7 text-foreground/75">{item.summary}</p>
      <p className="mt-3 text-sm text-foreground/55">
        <Link href={jobPath(item.category)} className="underline underline-offset-4">
          {job.label}
        </Link>
        {" · "}
        <Link href={outcomePath(item.outcome)} className="underline underline-offset-4">
          {outcomeBySlug(item.outcome)?.label}
        </Link>
      </p>

      <section className="mt-8">
        <h2 className="font-display text-2xl">What it does</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">{item.whatItDoes}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">How it went</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">{item.howItWent}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Setup</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-7 text-foreground/80">
          {item.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <PromptBlock text={item.prompt} credit="Our starter prompt, written from the public listing. Not the creator's prompt." />
      {item.installUrl ? (
        <p className="mt-6">
          <a
            href={item.installUrl}
            className="inline-flex h-12 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
            rel="noreferrer noopener"
          >
            Add {item.title} to Grok Bot
          </a>
        </p>
      ) : item.installNote ? (
        <p className="mt-6 text-sm leading-6 text-foreground/70">{item.installNote}</p>
      ) : null}
      {item.sourceUrl ? <SourceLine href={item.sourceUrl} label={item.sourceLabel} /> : null}
      {item.creator ? (
        <p className="mt-2 text-sm">
          <a href={item.creator.url} className="underline underline-offset-4" rel="noreferrer noopener">
            @{item.creator.handle}
          </a>
        </p>
      ) : null}
      <SponsorSlot />
      <FaqList items={item.faq} />
      <Related links={related} />
      <StickyCopy text={item.prompt} />
    </article>
  );
}
