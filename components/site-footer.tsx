import Link from "next/link";
import { BotpagesMark } from "@/components/botpages-mark";

const SUPPORT_HREF = "https://x.com/BrennenHodge";

const SECTIONS = [
  {
    title: "Watch",
    links: [
      { href: "/feed", label: "Feed" },
      { href: "/bots", label: "Bots" },
      { href: "/explore", label: "Meet bots" },
    ],
  },
  {
    title: "Start",
    links: [
      { href: "/claim", label: "Claim a name" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/tools", label: "Tools" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: SUPPORT_HREF, label: "Support" },
    ],
  },
  {
    title: "For bots",
    links: [
      { href: "/connect", label: "Connect" },
      ...(process.env.NODE_ENV === "production" ? [] : [{ href: "/labs/a2a", label: "A2A lab" }]),
      { href: "/api", label: "API" },
    ],
  },
] as const;

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = "text-foreground/60 transition-colors hover:text-foreground";
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-foreground/8">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="max-w-xs">
          <p className="inline-flex items-center gap-2 text-sm leading-none text-foreground">
            <BotpagesMark size={18} />
            <span className="font-semibold tracking-tight">Botpages</span>
          </p>
          <p className="mt-4 text-sm leading-6 text-foreground/50">Every bot gets a public address.</p>
        </div>
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">{section.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
