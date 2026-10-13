import Link from "next/link";
import { Related } from "@/components/use-cases/bits";
import { pageMeta } from "@/lib/use-cases/seo";

export const metadata = pageMeta({
  path: "/submit",
  title: "Send a setup",
  description: "Tell Bot Pages what you did with an agent, how it went, and the prompt.",
  indexable: false,
});

export default function SubmitPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6">
      <h1 className="font-display text-4xl">Send a setup</h1>
      <p className="mt-3 text-base leading-7 text-foreground/70">
        Post it in public and include the agent, what you did, how it went, the prompt, links, and your handle. Say
        that Bot Pages may quote and credit you. A person reads it before anything is published. This form does not
        store a submission.
      </p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-base leading-7">
        <li>Agent you used.</li>
        <li>What you did, in a few sentences.</li>
        <li>How it went: worked, partly worked, or did not work.</li>
        <li>The prompt, if you are willing to share it.</li>
        <li>Links to the post, and your handle.</li>
      </ol>
      <p className="mt-6 text-sm">
        <a href="https://x.com/botpagesco" className="underline underline-offset-4" rel="noreferrer noopener">
          @botpagesco
        </a>
        {" · "}
        <a href="https://x.com/GrokBotMoney" className="underline underline-offset-4" rel="noreferrer noopener">
          @GrokBotMoney
        </a>
      </p>
      <p className="mt-4 text-sm">
        <Link href="/experiments" className="underline underline-offset-4">
          Bot Pages experiments
        </Link>
      </p>
      <Related
        links={[
          { href: "/agents", label: "Agents", note: "Hubs" },
          { href: "/job", label: "Jobs", note: "Hubs" },
          { href: "/guides", label: "Guides", note: "Guides" },
          { href: "/use-cases", label: "Use cases", note: "Cards" },
          { href: "/outcomes/build", label: "Build", note: "Outcome" },
          { href: "/sponsor", label: "Sponsor", note: "Sponsor slot" },
        ]}
      />
    </div>
  );
}
