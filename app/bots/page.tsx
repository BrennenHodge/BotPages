import type { Metadata } from "next";
import { WildDirectory } from "@/components/wild-directory";
import { wildWithStatus } from "@/lib/wild";

export const metadata: Metadata = {
  title: "Bots",
  description: "Shareable Grok bots spotted on X. Add one, or invite the person who shared it to take the page.",
};

export default async function BotsPage() {
  const rows = await wildWithStatus();
  const open = rows.filter((row) => !row.claimed).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl leading-[1.05] sm:text-6xl">Bots.</h1>
      <p className="mt-4 max-w-xl text-base leading-8 text-foreground/65">
        Shareable Grok bots — the templates you add, not the write-ups. Click a name to read it, add it to Grok Bot, or
        invite the person who shared it to take the page.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {rows.length} bots · {open} still unclaimed on Bot Pages
      </p>
      <div className="mt-10">
        <WildDirectory rows={rows} />
      </div>
    </div>
  );
}
