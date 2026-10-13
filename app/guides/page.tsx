import { Breadcrumbs, RecordList } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { allGuides, toRow } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, pageMeta } from "@/lib/use-cases/seo";

export const metadata = pageMeta({
  path: "/guides",
  title: "Guides",
  description: "Step-by-step AI agent guides with the result the creator posted and an install link when they shared one.",
});

export default function GuidesPage() {
  const rows = allGuides().map(toRow);
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }])} />
      <JsonLd data={collectionLd("Guides", "/guides")} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Guides" }]} />
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Guides</h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">
        {rows.length} {rows.length === 1 ? "guide" : "guides"} so far. Each one is a full setup, not a one-line card.
      </p>
      <div className="mt-6">
        <RecordList rows={rows} />
      </div>
    </div>
  );
}
