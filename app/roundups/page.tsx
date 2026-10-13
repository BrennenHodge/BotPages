import Link from "next/link";
import { Breadcrumbs } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { allRoundups } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, pageMeta } from "@/lib/use-cases/seo";

export const metadata = pageMeta({
  path: "/roundups",
  title: "Roundups",
  description: "Collections of real Grok Bot write-ups: refunds, overnight fleets, and marketplace haggling.",
});

export default function RoundupsPage() {
  const roundups = allRoundups();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Roundups", path: "/roundups" }])} />
      <JsonLd data={collectionLd("Roundups", "/roundups")} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Roundups" }]} />
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Roundups</h1>
      <ul className="mt-6 space-y-3">
        {roundups.map((roundup) => (
          <li key={roundup.slug}>
            <Link href={`/roundups/${roundup.slug}`} className="block rounded-2xl border border-foreground/10 bg-card p-4">
              <span className="font-medium">{roundup.title}</span>
              <span className="mt-1 block text-sm text-foreground/60">{roundup.intro}</span>
              <span className="mt-2 block text-xs text-foreground/45">{roundup.entries.length} entries</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
