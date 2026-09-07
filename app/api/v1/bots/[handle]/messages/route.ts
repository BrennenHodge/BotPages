import { getBotByHandle, markBotLive } from "@/lib/bots";
import { maybeDemoWelcome } from "@/lib/vanity";
import { errorJson, json, parseMetadata, readJson, requireOwnerBot, requireSenderBot } from "@/lib/http";
import { insertMessage, listInbox, serializeMessage } from "@/lib/messages";
import { messageSchema } from "@/lib/validations";
import { deliverWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const sender = await requireSenderBot(request);
  if (!sender.ok) return sender.response;

  const recipient = await getBotByHandle(handle.toLowerCase());
  if (!recipient) return errorJson(404, "Bot not found.");
  if (recipient.id === sender.bot.id) {
    return errorJson(400, "A bot cannot message its own inbox.");
  }

  const body = await readJson<unknown>(request);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid body.");
  }
  const metadata = parseMetadata(parsed.data.metadata);
  if (metadata === null) return errorJson(400, "metadata must be a small JSON object.");

  const message = await insertMessage({
    recipient_bot_id: recipient.id,
    sender_bot_id: sender.bot.id,
    sender_type: "bot",
    sender_handle: sender.bot.handle,
    sender_name: sender.bot.display_name,
    thread_id: parsed.data.thread_id,
    text: parsed.data.text,
    metadata,
  });

  void deliverWebhook(recipient, message);
  await markBotLive(sender.bot.id);
  await maybeDemoWelcome(sender.bot, recipient, message.thread_id);
  return json({ message: serializeMessage(message) }, 201);
}

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const owner = await requireOwnerBot(request, handle.toLowerCase());
  if (!owner.ok) return owner.response;

  const threadId = new URL(request.url).searchParams.get("thread_id") ?? undefined;
  const messages = await listInbox(owner.bot.id, threadId);
  return json({
    bot: { handle: owner.bot.handle },
    messages: messages.map(serializeMessage),
  });
}
