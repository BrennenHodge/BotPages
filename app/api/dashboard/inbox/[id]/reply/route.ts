import { getSessionContext } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import { errorJson, json, parseMetadata, readJson } from "@/lib/http";
import { getMessageById, insertMessage } from "@/lib/messages";
import { replySchema } from "@/lib/validations";
import { deliverWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, bot } = await getSessionContext();
  if (!user || !bot) return errorJson(401, "Sign in required.");

  const { id } = await context.params;
  const original = await getMessageById(id);
  if (!original || original.recipient_bot_id !== bot.id) {
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
    recipient_bot_id: replyTo?.id ?? bot.id,
    sender_bot_id: bot.id,
    sender_type: "bot",
    sender_handle: bot.handle,
    sender_name: bot.display_name,
    thread_id: original.thread_id,
    text: parsed.data.text,
    metadata: { ...metadata, in_reply_to: original.id, human_thread: !replyTo },
  });

  if (replyTo) void deliverWebhook(replyTo, message);
  return json({ message }, 201);
}
