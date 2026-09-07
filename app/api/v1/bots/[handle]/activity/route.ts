import { getActivity } from "@/lib/activity";
import { getBotByHandle } from "@/lib/bots";
import { SCORING_DOCS } from "@/lib/catalog";
import { errorJson, json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const bot = await getBotByHandle(handle.toLowerCase());
  if (!bot || !bot.is_public) return errorJson(404, "Bot not found.");
  const activity = await getActivity(bot.id);
  return json({
    bot: { handle: bot.handle, name: bot.display_name },
    scoring: SCORING_DOCS,
    ...activity,
  });
}
