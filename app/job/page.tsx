import Link from "next/link";
import { Breadcrumbs } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { jobCounts } from "@/lib/use-cases/content";
import { breadcrumbLd, collectionLd, pageMeta } from "@/lib/use-cases/seo";
import { JOB_INDEX_PATH, jobPath } from "@/lib/use-cases/taxonomy";

export const metadata = pageMeta({
  path: JOB_INDEX_PATH,
  title: "Jobs",
  description: "Twelve jobs people hand to AI agents, with a live count of published examples for each.",
});

export default function JobIndexPage() {
  const jobs = jobCounts();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Jobs", path: JOB_INDEX_PATH }])} />
      <JsonLd data={collectionLd("Jobs", JOB_INDEX_PATH)} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Jobs" }]} />
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Jobs</h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">
        Twelve categories. The count is published use cases and guides, not an estimate. Category pages live at
        /jobs/… because /jobs itself is an existing bot handle.
      </p>
      <ul className="mt-8 divide-y divide-foreground/8 overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        {jobs.map((job) => (
          <li key={job.slug}>
            <Link href={jobPath(job.slug)} className="block px-4 py-3.5">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{job.label}</span>
                <span className="text-sm text-foreground/50">{job.cards}</span>
              </span>
              <span className="mt-1 block text-sm text-foreground/60">{job.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
