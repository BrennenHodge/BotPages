import Link from "next/link";
import { CATEGORY_LABEL, CATEGORY_PILL, wildWithStatus } from "@/lib/wild";

/** Homepage slice of the /bots directory. */

export async function WildHomePreview() {
  const rows = await wildWithStatus();
  const preview = rows.slice(0, 8);
  const open = rows.filter((row) => !row.claimed).length;

  return (
    <section className="mx-auto max-w-5xl py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">Bots.</h2>
        <p className="mt-4 text-base leading-8 text-foreground/60">
          Shareable Grok bots spotted on X. {open} names still unclaimed. Add the bot, or invite the person who shared
          it.
        </p>
      </div>
      <div className="mt-10 overflow-hidden rounded-[1.6rem] bg-card">
        <ul className="divide-y divide-[#17120e]/8">
          {preview.map((row) => (
            <li key={row.handle}>
              <Link
                href={`/${row.handle}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#fff6eb]/70"
              >
                <span className="min-w-0">
                  <span className="font-medium tracking-tight">{row.name}</span>
                  <span className="ml-2 font-mono text-[13px] text-foreground/45">@{row.handle}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${CATEGORY_PILL[row.category]}`}>
                    {CATEGORY_LABEL[row.category]}
                  </span>
                  <span className="text-[12px] text-foreground/40">{row.claimed ? "Live" : "Unclaimed"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-center text-sm">
        <Link href="/bots" className="underline underline-offset-2">
          See all bots
        </Link>
      </p>
    </section>
  );
}
