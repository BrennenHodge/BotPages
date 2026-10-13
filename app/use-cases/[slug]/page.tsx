import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, FaqList, PromptBlock, Related, SourceLine, SponsorSlot, StatusBadge } from "@/components/use-cases/bits";
import { StickyCopy } from "@/components/use-cases/copy-button";
import { JsonLd } from "@/components/use-cases/json-ld";
import { agentLabels, getUseCase, hrefFor, relatedLinks } from "@/lib/use-cases/content";
import { breadcrumbLd, cardTitle, clip, pageMeta, statusText } from "@/lib/use-cases/seo";
import { BRAND, agentPath, jobBySlug, jobPath, outcomeBySlug, outcomePath } from "@/lib/use-cases/taxonomy";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getUseCase(slug);
  if (!item) return {};
  const agent = agentLabels(item.agents);
  const who = item.creator ? `@${item.creator.handle}` : "a named source";
  const title =
    item.slug === "build-terminal-to-html-tool-claude-code"
      ? "Build a Terminal-to-HTML Tool with Claude Code for Web"
      : `${item.title} with ${agent} | ${BRAND}`;
  return pageMeta({
    path: `/use-cases/${item.slug}`,
    absoluteTitle: true,
    title,
    description: clip(
      `${item.summary} Shared by ${who}. ${statusText(item.status)}. ${cardTitle(item.category, agent, item.outcome)}. Copyable prompt.`,
    ),
  });
}

export default async function UseCasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = getUseCase(slug);
  if (!item) notFound();
  const job = jobBySlug(item.category);
  const outcome = outcomeBySlug(item.outcome);
  const agent = item.agents[0];
  const agentName = agentLabels(item.agents);
  const path = hrefFor(item);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: agentName, path: agent ? agentPath(agent) : "/agents" },
    { name: job?.label ?? item.category, path: jobPath(item.category) },
    { name: item.title, path },
  ];
  const faqs = [
    { question: "How did it go?", answer: item.howItWent },
    {
      question: "Who shared this?",
      answer: item.creator ? `@${item.creator.handle}, via ${item.sourceLabel}.` : item.sourceLabel,
    },
    {
      question: "What should I watch for?",
      answer: item.watchOut[0] ?? "The write-up does not add a separate warning.",
    },
  ];
  const guide = item.slug === "move-website-hosting-in-four-days" ? "/guides/move-website-hosting-in-four-days" : null;
  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: item.title,
          description: item.summary,
          datePublished: item.addedAt,
          dateModified: item.updatedAt,
          author: { "@type": "Organization", name: BRAND },
          citation: item.sourceUrl,
          about: { "@type": "SoftwareApplication", name: agentName },
          ...(item.creator
            ? { mentions: { "@type": "Person", name: `@${item.creator.handle}`, url: item.creator.url } }
            : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: agent ? agentPath(agent) : "/agents", label: agentName },
          { href: jobPath(item.category), label: job?.label ?? item.category },
          { label: item.title },
        ]}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={agent ? agentPath(agent) : "/agents"} className="rounded-full bg-foreground px-2.5 py-1 text-xs text-background">
          {agentName}
        </Link>
        <StatusBadge status={item.status} />
      </div>
      <h1 className="font-display mt-3 text-3xl leading-tight sm:text-5xl">{item.title}</h1>
      <p className="mt-3 text-base leading-7 text-foreground/75">{item.summary}</p>
      <p className="mt-2 text-sm text-foreground/55">
        <Link href={outcomePath(item.outcome)} className="underline underline-offset-4">
          {outcome?.label}
        </Link>
      </p>

      <section className="mt-8">
        <h2 className="font-display text-2xl">What they did</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">{item.whatTheyDid}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">How it went</h2>
        <p className="mt-2 text-base leading-7 text-foreground/80">{item.howItWent}</p>
      </section>
      {item.steps.length ? (
        <section className="mt-8">
          <h2 className="font-display text-2xl">Setup</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-7 text-foreground/80">
            {item.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}
      <PromptBlock text={item.prompt} credit={item.promptCredit} />
      {guide ? (
        <p className="mt-6 text-sm">
          <Link href={guide} className="underline underline-offset-4">
            Full guide
          </Link>
        </p>
      ) : null}
      {item.sourceUrl ? <SourceLine href={item.sourceUrl} label={item.sourceLabel} /> : null}
      {item.creator ? (
        <p className="mt-2 text-sm">
          <Link href={`/creators/${item.creator.handle.toLowerCase()}`} className="underline underline-offset-4">
            @{item.creator.handle}
          </Link>
        </p>
      ) : null}
      <SponsorSlot />
      <FaqList items={faqs} />
      <Related links={relatedLinks(item)} />
      <StickyCopy text={item.prompt} />
    </article>
  );
}
