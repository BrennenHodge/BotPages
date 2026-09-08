import Link from "next/link";
import { CatalogActions } from "@/components/catalog-actions";
import { IntegrationMark } from "@/components/integration-mark";
import { XPostEmbed } from "@/components/x-post-embed";
import {
  CATEGORY_LABEL,
  CATEGORY_PILL,
  INCLUDE_LABEL,
  INTEGRATION_LABEL,
  relatedWildBots,
  xProfileUrl,
  xStatusPermalink,
  type IntegrationId,
  type WildBot,
} from "@/lib/wild-data";

export function BotCatalogPage({ listing, origin }: { listing: WildBot; origin: string }) {
  const related = relatedWildBots(listing.handle);
  const integrations = listing.integrations.filter((id) => id !== "grok" || listing.integrations.length === 1);
  const tweetUrl = listing.sourceUrl ? xStatusPermalink(listing.sourceUrl) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_22.5rem] md:items-start">
        <article>
          <p className="text-sm text-foreground/45">
            <Link href="/bots" className="hover:text-foreground">
              Bots
            </Link>
            <span className="mx-1.5">/</span>
            {listing.name}
          </p>

          <h1 className="font-display mt-5 text-4xl leading-[1.05] sm:text-5xl">{listing.name}</h1>
          <p className="mt-2 font-mono text-lg text-accent">@{listing.handle}</p>
          {listing.description ? (
            <p className="mt-5 text-base leading-8 text-foreground/65">{listing.description}</p>
          ) : null}
          <p className={`text-base leading-8 text-foreground/65 ${listing.description ? "mt-3" : "mt-5"}`}>
            {listing.blurb}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${CATEGORY_PILL[listing.category]}`}>
              {CATEGORY_LABEL[listing.category]}
            </span>
            {listing.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground/60">
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-4 text-sm text-foreground/55">
            shared by{" "}
            <a
              href={xProfileUrl(listing.xHandle)}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-foreground underline underline-offset-2"
            >
              @{listing.xHandle}
            </a>
          </p>

          <div className="mt-8">
            <CatalogActions handle={listing.handle} origin={origin} shareUrl={listing.shareUrl} />
          </div>
        </article>

        {listing.sourceUrl ? (
          <aside className="md:sticky md:top-24 md:row-span-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">Source</h2>
            <div className="mt-3">
              {tweetUrl ? (
                <XPostEmbed key={tweetUrl} url={tweetUrl} />
              ) : (
                <a
                  href={listing.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 rounded-[1.2rem] bg-card px-5 py-4 text-sm transition-colors hover:bg-[#fff6eb]"
                >
                  <span>
                    Where this bot was shared.
                    <span className="mt-1 block font-medium text-foreground">View source</span>
                  </span>
                  <span aria-hidden className="text-foreground/30">
                    ↗
                  </span>
                </a>
              )}
            </div>
          </aside>
        ) : null}

        <div>
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">Integrations</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(integrations.length ? integrations : (["grok"] as IntegrationId[])).map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#17120e]/12 bg-card px-3 py-1.5 text-sm text-foreground/75"
                >
                  <IntegrationMark id={id} />
                  {INTEGRATION_LABEL[id]}
                </span>
              ))}
            </div>
          </section>

          {listing.includes.length ? (
            <section className="mt-10">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                What it includes
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.includes.map((item) => (
                  <span key={item} className="rounded-full bg-muted px-3 py-1 text-sm text-foreground/70">
                    {INCLUDE_LABEL[item] || item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10 rounded-[1.2rem] bg-muted/60 px-5 py-4 text-sm leading-7 text-foreground/55">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">Before you add it</p>
            <p className="mt-2">
              A shared Grok Bot carries someone else’s instructions. Read them first. Never paste a key or a password it
              asks for. If this is yours, we’ll ping you on X so you can take the page.
            </p>
          </section>
        </div>
      </div>

      {related.length ? (
        <section className="mt-14">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">Related</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((row) => {
              const chips = row.tags.length ? row.tags.slice(0, 4) : [CATEGORY_LABEL[row.category]];
              return (
                <li key={row.handle}>
                  <Link
                    href={`/${row.handle}`}
                    className="flex h-full flex-col rounded-[1.2rem] bg-card px-5 py-4 transition-colors hover:bg-[#fff6eb]/70"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 font-medium tracking-tight">{row.name}</p>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-6 text-foreground/55">{row.blurb}</p>
                    <p className="mt-3 font-mono text-[12px] text-foreground/40">shared by @{row.xHandle}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-sm text-foreground/45">
        <Link href="/bots" className="underline underline-offset-2">
          All bots
        </Link>
      </p>
    </div>
  );
}
