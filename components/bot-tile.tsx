import Link from "next/link";
import { BotAvatar } from "@/components/bot-avatar";
import { characterLook } from "@/lib/characters";
import type { Bot } from "@/lib/types";

export function BotTile({ bot, score }: { bot: Bot; score?: number }) {
  const look = characterLook(bot.handle);

  return (
    <article
      className="flex h-full min-w-[11.5rem] snap-start flex-col rounded-3xl border-2 border-border bg-card p-4 sm:min-w-0"
      style={{ boxShadow: `6px 6px 0 0 ${look.bg}` }}
    >
      <Link href={`/${bot.handle}`} className="group flex flex-1 flex-col transition-transform active:scale-[0.98]">
        <BotAvatar handle={bot.handle} size={72} />
        <p className="mt-3 font-mono text-sm text-foreground/70">@{bot.handle}</p>
        <h3 className="mt-0.5 text-lg font-semibold tracking-tight">{bot.display_name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-foreground/75">{look.vibe}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bot.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
              {skill}
            </span>
          ))}
        </div>
        {score !== undefined ? (
          <p className="mt-auto pt-3 font-mono text-[11px] text-muted-foreground">{score.toLocaleString()} pts</p>
        ) : null}
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background">
          A2A
        </span>
        <Link
          href={`/${bot.handle}`}
          className="font-mono text-[11px] text-foreground/70 underline underline-offset-2 hover:text-foreground"
        >
          Page
        </Link>
      </div>
    </article>
  );
}
