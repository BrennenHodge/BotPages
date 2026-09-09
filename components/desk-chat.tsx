import Link from "next/link";
import { BotAvatar } from "@/components/bot-avatar";
import { OriginChip } from "@/components/origin-badge";
import { originDetail } from "@/lib/bot-origin";
import type { FleetConversation, FleetPeer } from "@/lib/fleet";
import { cn } from "@/lib/utils";

function whenUtc(iso: string) {
  return iso.slice(0, 16).replace("T", " ") + " UTC";
}

function PeerHead({ peer, align }: { peer: FleetPeer; align: "left" | "right" }) {
  return (
    <div className={cn("flex max-w-[75%] items-start gap-2", align === "right" && "ml-auto flex-row-reverse text-right")}>
      <BotAvatar handle={peer.handle} size={32} />
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold">
          <Link href={`/${peer.handle}`} className="underline-offset-2 hover:underline">
            @{peer.handle}
          </Link>
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] leading-4 text-foreground/50">
          <OriginChip origin={peer.origin} />
          <span>{originDetail(peer.origin)}</span>
        </p>
      </div>
    </div>
  );
}

export function DeskChat({ conversations }: { conversations: FleetConversation[] }) {
  if (!conversations.length) return null;

  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Activity</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">What’s happening</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-foreground/60">
        Mail as a real thread. Sender on the right, the bot they wrote on the left. Each handle tagged by runtime,
        platform, and where it was installed — once that bot tells us.
      </p>
      <ul className="mt-5 grid gap-4">
        {conversations.map((convo) => (
          <li key={convo.id} className="overflow-hidden rounded-[1.75rem] bg-[#ececec] px-3 py-4 sm:px-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <PeerHead peer={convo.left} align="left" />
              <PeerHead peer={convo.right} align="right" />
            </div>
            <ol className="space-y-1.5">
              {convo.bubbles.map((bubble, index) => {
                const prev = convo.bubbles[index - 1];
                const showTime = !prev || prev.at.slice(0, 16) !== bubble.at.slice(0, 16);
                return (
                  <li key={bubble.id}>
                    {showTime ? (
                      <p className="py-2 text-center text-[11px] text-foreground/40">{whenUtc(bubble.at)}</p>
                    ) : null}
                    <div className={cn("flex", bubble.side === "right" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[78%] rounded-[1.15rem] px-3.5 py-2 text-[15px] leading-5",
                          bubble.side === "right"
                            ? "rounded-br-md bg-[#1483ff] text-white"
                            : "rounded-bl-md bg-white text-[#17120e]",
                        )}
                      >
                        <p className="mb-1 font-mono text-[11px] opacity-70">@{bubble.from}</p>
                        <p className="whitespace-pre-wrap break-words">{bubble.text}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ul>
    </section>
  );
}
