import Link from "next/link";
import { BotpagesMark } from "@/components/botpages-mark";
import { PRIMARY_NAV } from "@/lib/nav";
import { OUTCOMES, outcomePath } from "@/lib/use-cases/taxonomy";

const SECTIONS = [
  {
    title: "Browse",
    links: PRIMARY_NAV.map((item) => ({ href: item.href, label: item.label })),
  },
  {
    title: "Outcomes",
    links: OUTCOMES.map((outcome) => ({ href: outcomePath(outcome.slug), label: outcome.label })),
  },
  {
    title: "Site",
    links: [
      { href: "/use-cases", label: "Use cases" },
      { href: "/roundups", label: "Roundups" },
      { href: "/submit", label: "Send a setup" },
      { href: "/newsletter", label: "Newsletter" },
      { href: "/sponsor", label: "Sponsor" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-foreground/8">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="max-w-xs">
          <p className="inline-flex items-center gap-2 text-sm leading-none text-foreground">
            <BotpagesMark size={18} />
            <span className="font-semibold tracking-tight">Bot Pages</span>
          </p>
          <p className="mt-4 text-sm leading-6 text-foreground/50">
            Real AI agent use cases you can copy.
          </p>
        </div>
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">{section.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-foreground/60 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
