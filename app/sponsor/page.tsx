import { Related } from "@/components/use-cases/bits";
import { pageMeta } from "@/lib/use-cases/seo";

export const metadata = pageMeta({
  path: "/sponsor",
  title: "Sponsor",
  description: "One labeled sponsor slot per page, below the writing. No rate is published yet.",
  indexable: false,
});

export default function SponsorPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6">
      <h1 className="font-display text-4xl">Sponsor</h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">
        Each page has one labeled sponsor slot, under the first block of writing. A sponsor does not change status
        badges, how a setup went, or which examples are in Start here. There is no rate on this page. We will publish
        one from our own numbers, not a guess.
      </p>
      <Related
        links={[
          { href: "/", label: "Home", note: "Bot Pages" },
          { href: "/agents/grok-bot", label: "Grok Bot", note: "Agent hub" },
          { href: "/jobs/software", label: "Software and DevOps", note: "Job hub" },
          { href: "/guides", label: "Guides", note: "Guides" },
          { href: "/newsletter", label: "Newsletter", note: "List" },
          { href: "/submit", label: "Send a setup", note: "Submissions" },
        ]}
      />
    </div>
  );
}
