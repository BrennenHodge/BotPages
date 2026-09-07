"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/v/1", label: "1" },
  { href: "/v/2", label: "2" },
  { href: "/v/3", label: "3" },
  { href: "/v/4", label: "4" },
  { href: "/labs/a2a", label: "A2A lab" },
] as const;

/** Preview-only chrome. Layout gates rendering; this is a second client-side check. */
export function ExperimentBar() {
  const pathname = usePathname() || "/";

  return (
    <div className="border-b border-[#17120e]/10 bg-[#17120e] text-[#fff6eb]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff8a5b]">
          Preview · homepage experiments
        </p>
        <nav className="flex items-center gap-1" aria-label="Homepage variants">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`min-w-8 rounded-full px-2.5 py-1 text-center font-mono text-xs transition ${
                  active
                    ? "bg-[#ff4d2e] text-white"
                    : "bg-white/10 text-[#fff6eb]/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
