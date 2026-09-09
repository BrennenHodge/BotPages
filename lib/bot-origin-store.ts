import { originFromBot, originFromRequest, mergeOrigin, type BotOrigin } from "./bot-origin";
import { execute } from "./db";
import { nowIso } from "./ids";

export async function rememberBotOrigin(
  bot: { id: string; runtime?: string | null; platform?: string | null; install_host?: string | null },
  incoming: BotOrigin,
) {
  const current = originFromBot(bot);
  const next = mergeOrigin(current, incoming);
  if (
    next.runtime === current.runtime &&
    next.platform === current.platform &&
    next.install_host === current.install_host
  ) {
    return;
  }
  await execute(
    `UPDATE bots SET runtime = ?, platform = ?, install_host = ?, origin_seen_at = ? WHERE id = ?`,
    [next.runtime, next.platform, next.install_host, nowIso(), bot.id],
  );
}

export async function rememberBotOriginFromRequest(
  bot: { id: string; runtime?: string | null; platform?: string | null; install_host?: string | null },
  request: Request,
  body?: unknown,
) {
  try {
    await rememberBotOrigin(bot, originFromRequest(request, body));
  } catch {
    /* origin is best-effort */
  }
}
