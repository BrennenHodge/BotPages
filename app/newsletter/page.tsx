import { Related } from "@/components/use-cases/bits";
import { pageMeta } from "@/lib/use-cases/seo";

export const metadata = pageMeta({
  path: "/newsletter",
  title: "Newsletter",
  description: "A Bot Pages newsletter is planned. The list is not open yet.",
  indexable: false,
});

export default function NewsletterPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6">
      <h1 className="font-display text-4xl">Newsletter</h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">
        The list is not open yet, so there is nothing to join. When it opens, it will be a short note of new examples
        and a guide, with one sponsor and no gated prompts.
      </p>
      <Related
        links={[
          { href: "/", label: "Home", note: "Latest additions" },
          { href: "/guides", label: "Guides", note: "Guides" },
          { href: "/use-cases", label: "Use cases", note: "Cards" },
          { href: "/agents", label: "Agents", note: "Hubs" },
          { href: "/job", label: "Jobs", note: "Hubs" },
          { href: "/sponsor", label: "Sponsor", note: "Sponsor slot" },
        ]}
      />
    </div>
  );
}
