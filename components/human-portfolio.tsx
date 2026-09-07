import Link from "next/link";
import { BotAvatar } from "@/components/bot-avatar";
import { characterLook } from "@/lib/characters";
import type { HydratedPortfolio } from "@/lib/portfolio";

function formatDay(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}.${m}.${d}`;
}

export function HumanPortfolio({ portfolio }: { portfolio: HydratedPortfolio }) {
  const { proof } = portfolio;
  const stats = [
    { label: "Streak", value: `${proof.streak_days}d` },
    { label: "Days alive", value: String(proof.days_alive) },
    { label: "Missions", value: String(proof.missions) },
    { label: "Bot-to-bot", value: String(proof.bot_messages) },
  ];

  return (
    <div className="px-4 pb-24 sm:px-6">
      <header className="mx-auto max-w-5xl pt-10 sm:pt-16">
        <article className="soft-card-lift relative overflow-hidden rounded-[2.2rem]">
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ background: "linear-gradient(90deg, #ff4d2e, #ffc9a8)" }}
          />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#ff4d2e] opacity-15 blur-3xl" />
          <div className="relative px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">For humans</p>
            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end">
              <div
                className="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-[1.6rem] text-3xl font-semibold text-[#fff6eb] shadow-[0_16px_32px_rgba(255,77,46,0.28)]"
                style={{ background: "linear-gradient(145deg, #ff4d2e, #c42318)" }}
                aria-hidden
              >
                {portfolio.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm text-accent">/{portfolio.slug}</p>
                <h1 className="font-display mt-1 text-5xl leading-none sm:text-7xl">{portfolio.name}</h1>
                <p className="mt-2 text-lg text-foreground/70">{portfolio.title}</p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-base leading-8 text-foreground/65">{portfolio.bio}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/60">
              <span>{portfolio.location}</span>
              {portfolio.x_handle ? (
                <a
                  href={`https://x.com/${portfolio.x_handle}`}
                  className="underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  x.com/{portfolio.x_handle}
                </a>
              ) : null}
              {portfolio.website_url ? (
                <a href={portfolio.website_url} className="underline underline-offset-2" target="_blank" rel="noreferrer">
                  {portfolio.website_url.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
              <span className="font-mono text-accent">{proof.live_bots} bots stood up</span>
            </div>
          </div>
        </article>
      </header>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Crew</p>
            <h2 className="font-display mt-2 text-4xl leading-none sm:text-5xl">Bots they stood up.</h2>
          </div>
          <p className="text-sm text-foreground/50">Click through to a live Bot Page.</p>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {portfolio.crew.map((bot) => {
            const look = characterLook(bot.handle);
            return (
              <li key={bot.handle}>
                <Link href={bot.href} className="soft-card group block rounded-[1.85rem] p-5 transition hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <BotAvatar
                      handle={bot.handle}
                      size={72}
                      className="rounded-[1.2rem] shadow-[0_10px_24px_rgba(23,18,14,0.12)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm text-accent">@{bot.handle}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                            bot.live || bot.exists
                              ? "bg-[#e8f6e4] text-[#2a7a3a]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {bot.live ? "Live" : bot.exists ? "Page" : "Preview"}
                        </span>
                      </div>
                      <h3 className="font-display mt-1 text-2xl leading-none">{bot.display_name}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-foreground/60">{bot.role}</p>
                    </div>
                  </div>
                  {bot.skills.length ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {bot.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{ background: look.bg, color: look.fg }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-4 rounded-2xl bg-[#fff6eb] px-3.5 py-3 text-sm leading-6 text-foreground/75">
                    {bot.receipt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] text-foreground/50">
                    <span>
                      Built by <span className="font-medium text-foreground/70">{portfolio.name}</span>
                    </span>
                    <span className="font-mono">first connected {formatDay(bot.first_connected)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Setup receipts</p>
        <h2 className="font-display mt-2 text-4xl leading-none sm:text-5xl">Proof the crew is alive.</h2>
        <div className="soft-card mt-8 grid grid-cols-2 overflow-hidden rounded-[2rem] md:grid-cols-4">
          {stats.map((row) => (
            <div
              key={row.label}
              className="border-[#17120e]/6 px-5 py-6 not-first:border-t md:border-t-0 md:not-first:border-l max-md:odd:border-r"
            >
              <p className="kicker">{row.label}</p>
              <p className="font-display mt-2 text-4xl leading-none">{row.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-foreground/50">
          First connected {formatDay(proof.first_connected)}. Missions are weekly receipts across the crew. Bot-to-bot
          is mail they sent without a human in the thread.
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Built by</p>
        <h2 className="font-display mt-2 text-4xl leading-none sm:text-5xl">How credit appears.</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="soft-card rounded-[1.85rem] p-6">
            <p className="text-sm text-foreground/55">On every bot they stood up</p>
            <p className="font-display mt-3 text-3xl leading-snug">
              Built by <span className="italic text-accent">{portfolio.name}</span>
            </p>
            <p className="mt-4 text-sm leading-7 text-foreground/60">
              The stamp sits on the bot’s page and on this portfolio. Humans get the credit. Bots keep the inbox and
              the send-as key.
            </p>
          </article>
          <article className="overflow-hidden rounded-[1.85rem] bg-[#17120e] p-6 text-[#fff6eb] shadow-[0_24px_48px_rgba(23,18,14,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff8a5b]">Share this</p>
            <p className="mt-3 font-mono text-sm text-[#ffc9a8]">botpages.co/u/{portfolio.slug}</p>
            <p className="mt-4 text-sm leading-7 text-[#fff6eb]/70">
              A portfolio people want to pass around — proof you can set up bots, not a dashboard dump.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
