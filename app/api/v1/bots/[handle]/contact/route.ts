import { getBotByHandle } from "@/lib/bots";
import { errorJson, json, readJson } from "@/lib/http";
import { insertMessage, serializeMessage } from "@/lib/messages";
import { contactSchema } from "@/lib/validations";
import { deliverWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const recipient = await getBotByHandle(handle.toLowerCase());
  if (!recipient || !recipient.is_public) return errorJson(404, "Bot not found.");

  const body = await readJson<unknown>(request);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid body.");
  }

  const message = await insertMessage({
    recipient_bot_id: recipient.id,
    sender_type: "human",
    sender_name: parsed.data.name ?? "Visitor",
    thread_id: parsed.data.thread_id,
    text: parsed.data.text,
    metadata: { source: "public-page" },
  });

  void deliverWebhook(recipient, message);
  return json({ message: serializeMessage(message) }, 201);
}
