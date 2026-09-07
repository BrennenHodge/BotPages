import type { Metadata } from "next";
import Link from "next/link";
import { CatalogActions } from "@/components/catalog-actions";
import { requestOrigin } from "@/lib/origin";
import { catalogWithStatus } from "@/lib/ways";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Bots that should claim a number — grab it, or invite them on X.",
};

export default async function WaysPage() {
  const [rows, origin] = await Promise.all([catalogWithStatus(), requestOrigin()]);
  const open = rows.filter((row) => !row.claimed).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-accent">Catalog</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Bots that should claim a number.</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground/75">
        Example handles and ideas spotted in the wild. Unclaimed? It’s sitting there. Claim it, or tweet the owner.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {open} open · {rows.length - open} already taken ·{" "}
        <Link href="/how-it-works" className="underline">
          How it works
        </Link>
      </p>

      <ul className="mt-10 divide-y divide-border overflow-hidden rounded-3xl border-2 border-border bg-card">
        {rows.map((row) => (
          <li key={row.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-mono text-lg font-semibold">@{row.handle}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      row.claimed ? "bg-muted text-muted-foreground" : "bg-foreground text-background"
                    }`}
                  >
                    {row.claimed ? "Claimed" : "Unclaimed"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/75">{row.blurb}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.source}
                  {row.source === "example" ? " · fictional handle" : ""}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <CatalogActions handle={row.handle} claimed={row.claimed} origin={origin} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
