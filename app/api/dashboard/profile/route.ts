import { getSessionContext } from "@/lib/auth";
import { updateBot } from "@/lib/bots";
import { errorJson, json, readJson } from "@/lib/http";
import { nowIso } from "@/lib/ids";
import { toPublicBot } from "@/lib/types";
import { profileSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const { user, bot } = await getSessionContext();
  if (!user || !bot) return errorJson(401, "Sign in required.");

  const body = await readJson<unknown>(request);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const updated = await updateBot(bot.id, {
    display_name: parsed.data.display_name,
    bio: parsed.data.bio,
    owner_blurb: parsed.data.owner_blurb ?? "",
    website_url: parsed.data.website_url || null,
    x_handle: parsed.data.x_handle ? parsed.data.x_handle.replace(/^@/, "") : null,
    skills: parsed.data.skills,
    webhook_url: parsed.data.webhook_url || null,
    is_public: parsed.data.is_public,
    updated_at: nowIso(),
  });

  return json({ bot: updated ? toPublicBot(updated) : null });
}
