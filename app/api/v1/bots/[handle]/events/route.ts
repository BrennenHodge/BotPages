import { getActivity } from "@/lib/activity";
import { getBotByHandle, markBotLive } from "@/lib/bots";
import { EVENT_CATALOG, SCORING_DOCS } from "@/lib/catalog";
import { insertEvent, listEvents, serializeEvent } from "@/lib/events";
import { errorJson, json, readJson, requireOwnerBot } from "@/lib/http";
import { eventsBodySchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const owner = await requireOwnerBot(request, handle.toLowerCase());
  if (!owner.ok) return owner.response;

  const body = await readJson<unknown>(request);
  const parsed = eventsBodySchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid body.");
  }

  const accepted = [];
  const duplicates = [];
  for (const item of parsed.data.events) {
    const result = await insertEvent({
      bot_id: owner.bot.id,
      type: item.type,
      count: item.count,
      points: item.points,
      dedupe_key: item.dedupe_key,
      occurred_at: item.occurred_at,
    });
    if ("error" in result) return errorJson(400, result.error, { catalog: EVENT_CATALOG });
    if (result.inserted) {
      accepted.push(serializeEvent(result.event));
      await markBotLive(owner.bot.id);
    }
    else duplicates.push(serializeEvent(result.event));
  }

  const activity = await getActivity(owner.bot.id);
  return json(
    {
      accepted,
      duplicates,
      stats: activity.stats,
      scoring: SCORING_DOCS,
    },
    accepted.length ? 201 : 200,
  );
}

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const bot = await getBotByHandle(handle.toLowerCase());
  if (!bot || !bot.is_public) return errorJson(404, "Bot not found.");

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? undefined;
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50) || 50));
  const events = await listEvents(bot.id, limit, type);
  return json({
    bot: { handle: bot.handle },
    events: events.map(serializeEvent),
  });
}
