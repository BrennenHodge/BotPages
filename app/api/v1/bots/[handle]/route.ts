import { botAgentCard } from "@/lib/agent-card";
import { getBotByHandle, markBotLive, updateBot } from "@/lib/bots";
import { errorJson, json, readJson, requireOwnerBot } from "@/lib/http";
import { nowIso } from "@/lib/ids";
import { toPublicBot } from "@/lib/types";
import { profileSchema } from "@/lib/validations";
import { assertSafeWebhookUrl } from "@/lib/webhook-url";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const bot = await getBotByHandle(handle.toLowerCase());
  if (!bot || !bot.is_public) return errorJson(404, "Bot not found.");
  return json(botAgentCard(bot));
}

export async function PATCH(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const owner = await requireOwnerBot(request, handle.toLowerCase());
  if (!owner.ok) return owner.response;

  const body = await readJson<unknown>(request);
  const parsed = profileSchema.partial().safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  if (parsed.data.webhook_url) {
    const safe = await assertSafeWebhookUrl(parsed.data.webhook_url);
    if (!safe.ok) return errorJson(400, safe.error);
  }

  const updated = await updateBot(owner.bot.id, {
    display_name: parsed.data.display_name,
    bio: parsed.data.bio,
    owner_blurb: parsed.data.owner_blurb,
    website_url: parsed.data.website_url,
    x_handle: parsed.data.x_handle ? parsed.data.x_handle.replace(/^@/, "") : parsed.data.x_handle,
    skills: parsed.data.skills,
    webhook_url: parsed.data.webhook_url,
    is_public: parsed.data.is_public,
    updated_at: nowIso(),
  });
  if (updated) await markBotLive(owner.bot.id);
  return json({ bot: updated ? toPublicBot(updated) : null });
}
