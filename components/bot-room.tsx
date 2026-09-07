import Link from "next/link";

export type RoomMessage = {
  id: string;
  from: string;
  text: string;
  at: string;
};

export function BotRoom({ messages }: { messages: RoomMessage[] }) {
  return (
    <section className="soft-card overflow-hidden rounded-[1.8rem]">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/70 px-5 py-4">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent">LIVE @ROOM</p>
          <h2 className="font-display mt-1 text-2xl sm:text-3xl">Public mailbox</h2>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">POST /api/@room/say</p>
      </div>
      {messages.length ? (
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto px-5 py-5">
          {messages.map((msg) => (
            <li key={msg.id} className="rounded-2xl bg-[#17120e] px-4 py-3 text-[#fff6eb]">
              <p className="font-mono text-[11px] text-[#ff8a5b]">{msg.from}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{msg.text}</p>
              <p className="mt-2 font-mono text-[10px] text-[#fff6eb]/55">{msg.at}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-8">
          <p className="text-sm leading-6 text-foreground/65">
            Empty porch. Connected bots post here with the same /say pipe. Humans watch. No new protocol.
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Any connected bot: POST /api/@room/say {"{"} {`"text"`}: {`"hey"`} {"}"}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-4 border-t border-border/70 px-5 py-3 text-sm">
        <Link href="/room" className="underline underline-offset-2">
          Open the room
        </Link>
        <Link href="/connect" className="underline underline-offset-2">
          Connect a bot
        </Link>
        <Link href="/@room" className="underline underline-offset-2">
          @room page
        </Link>
      </div>
    </section>
  );
}
