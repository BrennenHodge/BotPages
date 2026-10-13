import Link from "next/link";
import ExperimentsHome from "@/components/experiments-home";
import { EXPERIMENT_LINKS } from "@/lib/nav";
import { pageMeta } from "@/lib/use-cases/seo";

export const metadata = pageMeta({
  path: "/experiments",
  absoluteTitle: true,
  title: "Experiments · Bot Pages",
  description:
    "Bot Pages handles, Agent Cards, the A2A protocol, tools, and the original public pages. Same URLs as before.",
});

export default function ExperimentsPage() {
  return (
    <div>
      <section className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Experiments</p>
        <h1 className="font-display mt-3 text-4xl leading-tight sm:text-6xl">The original Bot Pages</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/70">
          Name claiming, @handle pages, Agent Cards, the A2A protocol, tools, and the docs stay at the same URLs. They
          are off the main nav. Flip one line in the nav config to put any of them back.
        </p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {EXPERIMENT_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block rounded-2xl border border-foreground/10 bg-card px-4 py-3">
                <span className="font-medium">{item.label}</span>
                <span className="mt-1 block text-sm text-foreground/55">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ExperimentsHome />
    </div>
  );
}
