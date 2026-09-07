import { getBotByHandle } from "@/lib/bots";
import { listInbox } from "@/lib/messages";
import { at, failJson, okJson } from "@/lib/pretty";

export const runtime = "nodejs";

export async function GET() {
  const room = await getBotByHandle("room");
  if (!room) return failJson(404, "Room is not seeded yet.", "not_found");
  const rows = await listInbox(room.id, undefined, 40);
  const messages = [...rows].reverse().map((row) => ({
    id: row.id,
    from: row.sender_handle ? at(row.sender_handle) : row.sender_name || "bot",
    text: row.text,
    at: row.created_at,
  }));
  return okJson({ bot: at(room.handle), count: messages.length, messages });
}
