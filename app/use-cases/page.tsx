import { Breadcrumbs, RecordList } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { searchUseCases } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, pageMeta } from "@/lib/use-cases/seo";

export const metadata = pageMeta({
  path: "/use-cases",
  title: "Use cases",
  description: "Real AI agent use cases with a status, a source, and a copyable prompt.",
});

export default async function UseCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const rows = searchUseCases(query);
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Use cases", path: "/use-cases" }])} />
      <JsonLd data={collectionLd("Use cases", "/use-cases")} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Use cases" }]} />
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Use cases</h1>
      <form action="/use-cases" className="mt-4 flex gap-2">
        <label htmlFor="q" className="sr-only">
          Search use cases
        </label>
        <input
          id="q"
          name="q"
          defaultValue={query}
          placeholder="Search use cases"
          className="h-12 min-w-0 flex-1 rounded-full border border-foreground/15 bg-card px-4"
        />
        <button type="submit" className="h-12 rounded-full bg-foreground px-4 text-sm text-background">
          Search
        </button>
      </form>
      <p className="mt-3 text-sm text-foreground/55">
        {rows.length} {rows.length === 1 ? "example" : "examples"}
        {query ? ` for “${query}”` : ""}.
      </p>
      <div className="mt-4">
        <RecordList rows={rows} />
      </div>
    </div>
  );
}
