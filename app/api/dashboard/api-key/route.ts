import { generateApiKey } from "@/lib/api-keys";
import { requireOwnedBot, setRevealKeyCookie } from "@/lib/auth";
import { updateBot } from "@/lib/bots";
import { errorJson, json, readJson } from "@/lib/http";
import { nowIso } from "@/lib/ids";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await readJson<{ handle?: string }>(request)) ?? {};
  const owned = await requireOwnedBot(body.handle);
  if (!owned.ok) {
    return errorJson(
      owned.status,
      owned.status === 401 ? "Sign in required." : owned.status === 400 ? "Which bot?" : "Bot not found.",
    );
  }

  const key = generateApiKey();
  await updateBot(owned.bot.id, {
    api_key_hash: key.hash,
    api_key_prefix: key.prefix,
    updated_at: nowIso(),
  });

  await setRevealKeyCookie(owned.bot.handle, key.key);

  return json({
    api_key: key.key,
    api_key_prefix: key.prefix,
    handle: owned.bot.handle,
    warning: "Store this send-as key now. Bot Pages only keeps a hash.",
  });
}
