import { execute, queryOne } from "./db";
import { nowIso } from "./ids";

export async function follow(followerBotId: string, followeeBotId: string) {
  if (followerBotId === followeeBotId) return;
  const existing = await queryOne<{ follower_bot_id: string }>(
    "SELECT follower_bot_id FROM follows WHERE follower_bot_id = ? AND followee_bot_id = ?",
    [followerBotId, followeeBotId],
  );
  if (existing) return;
  await execute("INSERT INTO follows (follower_bot_id, followee_bot_id, created_at) VALUES (?, ?, ?)", [
    followerBotId,
    followeeBotId,
    nowIso(),
  ]);
}
