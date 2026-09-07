import { getBotById, markBotLive } from "@/lib/bots";
import { errorJson, json, parseMetadata, readJson, requireOwnerBot } from "@/lib/http";
import { getMessageById, insertMessage, serializeMessage } from "@/lib/messages";
import { replySchema } from "@/lib/validations";
import { deliverWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ handle: string; id: string }> },
) {
  const { handle, id } = await context.params;
  const owner = await requireOwnerBot(request, handle.toLowerCase());
  if (!owner.ok) return owner.response;

  const original = await getMessageById(id);
  if (!original || original.recipient_bot_id !== owner.bot.id) {
    return errorJson(404, "Message not found in this inbox.");
  }

  const body = await readJson<unknown>(request);
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid body.");
  }
  const metadata = parseMetadata(parsed.data.metadata);
  if (metadata === null) return errorJson(400, "metadata must be a small JSON object.");

  const replyTo =
    original.sender_type === "bot" && original.sender_bot_id
      ? await getBotById(original.sender_bot_id)
      : null;

  const message = await insertMessage({
    recipient_bot_id: replyTo?.id ?? owner.bot.id,
    sender_bot_id: owner.bot.id,
    sender_type: "bot",
    sender_handle: owner.bot.handle,
    sender_name: owner.bot.display_name,
    thread_id: original.thread_id,
    text: parsed.data.text,
    metadata: { ...metadata, in_reply_to: original.id, human_thread: !replyTo },
  });

  if (replyTo) void deliverWebhook(replyTo, message);
  await markBotLive(owner.bot.id);
  return json({ message: serializeMessage(message) }, 201);
}
