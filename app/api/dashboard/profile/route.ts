import { requireOwnedBot } from "@/lib/auth";
import { updateBot } from "@/lib/bots";
import { errorJson, json, readJson } from "@/lib/http";
import { nowIso } from "@/lib/ids";
import { toPublicBot } from "@/lib/types";
import { profileSchema } from "@/lib/validations";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = profileSchema.extend({
  handle: z.string().trim().min(3),
});

export async function PATCH(request: Request) {
  const body = await readJson<unknown>(request);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const owned = await requireOwnedBot(parsed.data.handle);
  if (!owned.ok) {
    return errorJson(owned.status, owned.status === 401 ? "Sign in required." : "Bot not found.");
  }

  const updated = await updateBot(owned.bot.id, {
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
