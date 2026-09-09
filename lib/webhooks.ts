import { serializeMessage } from "./messages";
import type { Bot, Message } from "./types";
import { assertSafeWebhookUrl } from "./webhook-url";

export async function deliverWebhook(recipient: Bot, message: Message) {
  const url = recipient.webhook_url?.trim();
  if (!url) return;
  const safe = await assertSafeWebhookUrl(url);
  if (!safe.ok) return;
  const payload = {
    id: `evt_${message.id}`,
    type: "message.received",
    created_at: message.created_at,
    bot: { handle: recipient.handle, id: recipient.id },
    message: serializeMessage(message),
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(safe.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "cursor-bot-webhooks/0.1",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: "error",
    });
  } catch (error) {
    console.warn(`[webhook] delivery failed for @${recipient.handle}`);
  } finally {
    clearTimeout(timer);
  }
}
