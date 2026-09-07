import { BotAvatar } from "@/components/bot-avatar";
import { characterLook } from "@/lib/characters";
import type { Bot } from "@/lib/types";

export function AgentBusinessCard({
  bot,
  compact = false,
}: {
  bot: Pick<Bot, "handle" | "display_name" | "bio" | "skills">;
  compact?: boolean;
}) {
  const look = characterLook(bot.handle);
  const skills = bot.skills.length ? bot.skills.slice(0, 5) : ["inbox"];

  return (
    <article
      className={`relative overflow-hidden rounded-[1.85rem] bg-[#fffdf8] text-[#17120e] ${compact ? "p-0" : ""}`}
      style={{
        boxShadow: `
          0 1px 2px rgba(23, 18, 14, 0.06),
          0 16px 36px rgba(23, 18, 14, 0.1),
          0 40px 72px ${look.blush}33
        `,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: `linear-gradient(90deg, ${look.fg}, ${look.blush})` }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full opacity-50 blur-2xl"
        style={{ background: look.bg }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full opacity-40 blur-2xl"
        style={{ background: look.blush }}
      />

      <div className="relative flex items-center justify-between px-6 pt-5 sm:px-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b5344]">Bot Pages</p>
        <p className="rounded-full bg-[#17120e] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#fff6eb]">
          Identity
        </p>
      </div>

      <div className={`relative grid gap-5 px-6 sm:grid-cols-[auto_1fr] sm:items-center sm:px-7 ${compact ? "py-5" : "py-6"}`}>
        <BotAvatar handle={bot.handle} size={compact ? 80 : 96} className="rounded-[1.4rem] shadow-[0_10px_24px_rgba(23,18,14,0.12)]" />
        <div className="min-w-0">
          <p className="font-mono text-sm text-accent">@{bot.handle}</p>
          <p className="font-display mt-1 text-3xl leading-none tracking-tight sm:text-4xl">{bot.display_name}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#3d2c24]">{bot.bio || look.vibe}</p>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-1.5 px-6 sm:px-7">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{ background: look.bg, color: look.fg }}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="relative mt-5 grid gap-3 border-t border-[#17120e]/10 bg-[#fff6eb]/80 px-6 py-4 font-mono text-[11px] leading-5 sm:grid-cols-2 sm:px-7">
        <p>
          <span className="mb-0.5 block font-sans text-[10px] uppercase tracking-[0.14em] text-[#6b5344]">Dial</span>
          /a2a/@{bot.handle}
        </p>
        <p>
          <span className="mb-0.5 block font-sans text-[10px] uppercase tracking-[0.14em] text-[#6b5344]">Page</span>
          /@{bot.handle}
        </p>
        <p className="sm:col-span-2">
          <span className="mb-0.5 block font-sans text-[10px] uppercase tracking-[0.14em] text-[#6b5344]">
            Identity JSON
          </span>
          /@{bot.handle}/.identity
        </p>
        <p className="sm:col-span-2 text-[10px] leading-4 text-[#6b5344]/80">
          Also /.well-known/agent-card.json for Google A2A clients
        </p>
      </div>
    </article>
  );
}
