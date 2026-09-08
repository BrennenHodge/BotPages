import { listPublicBots } from "./bots";
import { WILD_BOTS, type WildRow } from "./wild-data";

export * from "./wild-data";

export async function wildWithStatus(): Promise<WildRow[]> {
  const live = new Set((await listPublicBots(1000)).map((bot) => bot.handle));
  return WILD_BOTS.map((row) => ({
    ...row,
    claimed: live.has(row.handle),
  })).sort((a, b) => Number(a.claimed) - Number(b.claimed) || a.name.localeCompare(b.name));
}
