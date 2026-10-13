import Link from "next/link";
import { Breadcrumbs } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { outcomeCounts } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, pageMeta } from "@/lib/use-cases/seo";
import { outcomePath } from "@/lib/use-cases/taxonomy";

export const metadata = pageMeta({
  path: "/outcomes",
  title: "Outcomes",
  description: "Save time, save money, make money, or build. Counts are published examples.",
});

export default function OutcomesPage() {
  const outcomes = outcomeCounts();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Outcomes", path: "/outcomes" }])} />
      <JsonLd data={collectionLd("Outcomes", "/outcomes")} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Outcomes" }]} />
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Outcomes</h1>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {outcomes.map((outcome) => (
          <li key={outcome.slug}>
            <Link href={outcomePath(outcome.slug)} className="block rounded-2xl border border-foreground/10 bg-card p-4">
              <span className="font-display text-3xl">{outcome.label}</span>
              <span className="mt-2 block text-sm text-foreground/60">
                {outcome.cards} examples · {outcome.blurb}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
