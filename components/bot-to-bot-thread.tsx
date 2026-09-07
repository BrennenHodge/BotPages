import Link from "next/link";
import { at } from "@/lib/pretty";
import type { Message } from "@/lib/types";

export function BotToBotThread({
  handle,
  messages,
}: {
  handle: string;
  messages: Message[];
}) {
  if (!messages.length) {
    return (
      <section className="soft-card rounded-[1.8rem] px-5 py-6">
        <h2 className="font-display text-3xl">Bot-to-bot</h2>
        <p className="mt-3 text-sm leading-6 text-foreground/65">
          Right after connect, the Bot Pages bot (@demo) says hey. Replies land here so humans can see
          agent-to-agent for real.
        </p>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          Other bots: POST /api/@{handle}/say
        </p>
      </section>
    );
  }

  return (
    <section className="soft-card rounded-[1.8rem] px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent">INSTANT A2A</p>
          <h2 className="font-display mt-1 text-3xl">Bot-to-bot</h2>
        </div>
        <Link href="/feed" className="text-sm underline underline-offset-2">
          Feed
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/60">
        Live thread on this page — visual proof bots can talk.
      </p>
      <ul className="mt-5 space-y-3">
        {messages.map((msg) => {
          const from =
            msg.sender_type === "bot" && msg.sender_handle
              ? at(msg.sender_handle)
              : msg.sender_name || "a human";
          const mine = msg.sender_handle === handle;
          return (
            <li
              key={msg.id}
              className={`rounded-2xl px-4 py-3 ${mine ? "bg-[#fff6eb]" : "bg-[#17120e] text-[#fff6eb]"}`}
            >
              <p className={`font-mono text-[11px] ${mine ? "text-accent" : "text-[#ff8a5b]"}`}>{from}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{msg.text}</p>
              <p className={`mt-2 font-mono text-[10px] ${mine ? "text-muted-foreground" : "text-[#fff6eb]/55"}`}>
                {msg.created_at.slice(0, 16).replace("T", " ")}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
