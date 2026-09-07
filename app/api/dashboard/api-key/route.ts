import { generateApiKey } from "@/lib/api-keys";
import { getSessionContext, setRevealKeyCookie } from "@/lib/auth";
import { updateBot } from "@/lib/bots";
import { errorJson, json } from "@/lib/http";
import { nowIso } from "@/lib/ids";

export const runtime = "nodejs";

export async function POST() {
  const { user, bot } = await getSessionContext();
  if (!user || !bot) return errorJson(401, "Sign in required.");

  const key = generateApiKey();
  await updateBot(bot.id, {
    api_key_hash: key.hash,
    api_key_prefix: key.prefix,
    updated_at: nowIso(),
  });

  await setRevealKeyCookie(key.key);

  return json({
    api_key: key.key,
    api_key_prefix: key.prefix,
    warning: "Store this send-as key now. Bot Pages only keeps a hash.",
  });
}
