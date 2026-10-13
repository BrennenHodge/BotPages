import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, RecordList } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { getCreator, toRow } from "@/lib/use-cases/content";
import { breadcrumbLd, pageMeta } from "@/lib/use-cases/seo";

type Params = { handle: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  const creator = getCreator(handle);
  if (!creator) return {};
  return pageMeta({
    path: `/creators/${creator.handle.toLowerCase()}`,
    absoluteTitle: true,
    title: `@${creator.handle} on Bot Pages`,
    description: `${creator.items.length} published pages credited to @${creator.handle}.`,
  });
}

export default async function CreatorPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const creator = getCreator(handle);
  if (!creator) notFound();
  const path = `/creators/${creator.handle.toLowerCase()}`;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: `@${creator.handle}`, path }])} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: `@${creator.handle}` }]} />
      <h1 className="font-display mt-4 text-4xl">@{creator.handle}</h1>
      <p className="mt-3 text-sm">
        <a href={creator.url} className="underline underline-offset-4" rel="noreferrer noopener">
          Profile
        </a>
        <span className="text-foreground/50"> · {creator.items.length} published pages</span>
      </p>
      <div className="mt-6">
        <RecordList rows={creator.items.map(toRow)} />
      </div>
    </div>
  );
}
