import { execute, query, queryOne } from "./db";
import { nowIso } from "./ids";
import type { Bot } from "./types";

type BotRow = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  owner_blurb?: string | null;
  website_url?: string | null;
  x_handle?: string | null;
  skills: string;
  webhook_url: string | null;
  api_key_hash: string;
  api_key_prefix: string;
  is_public: number;
  went_live_at?: string | null;
  created_at: string;
  updated_at: string;
};

function mapBot(row: BotRow): Bot {
  let skills: string[] = [];
  try {
    const parsed = JSON.parse(row.skills);
    if (Array.isArray(parsed)) {
      skills = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    skills = [];
  }
  return {
    ...row,
    owner_blurb: row.owner_blurb ?? "",
    website_url: row.website_url || null,
    x_handle: row.x_handle || null,
    skills,
    webhook_url: row.webhook_url || null,
    is_public: Boolean(row.is_public),
    went_live_at: row.went_live_at ?? null,
  };
}

export function isBotLive(bot: Pick<Bot, "went_live_at">) {
  return Boolean(bot.went_live_at);
}

export async function markBotLive(botId: string): Promise<{ firstLive: boolean }> {
  const current = await getBotById(botId);
  if (!current) return { firstLive: false };
  if (current.went_live_at) return { firstLive: false };

  const stamp = nowIso();
  await execute(`UPDATE bots SET went_live_at = COALESCE(went_live_at, ?), updated_at = ? WHERE id = ?`, [
    stamp,
    stamp,
    botId,
  ]);

  // Instant A2A: site bot pings the newly live handle (dynamic import avoids cycles).
  try {
    const welcome = await import("./welcome");
    await welcome.onBotFirstLive(botId);
  } catch {
    // never block going live on welcome failures
  }

  return { firstLive: true };
}

export async function getBotByHandle(handle: string) {
  const row = await queryOne<BotRow>("SELECT * FROM bots WHERE handle = ?", [handle]);
  return row ? mapBot(row) : null;
}

export async function getBotById(id: string) {
  const row = await queryOne<BotRow>("SELECT * FROM bots WHERE id = ?", [id]);
  return row ? mapBot(row) : null;
}

export async function getBotByUserId(userId: string) {
  const bots = await listBotsByUserId(userId);
  return bots[0] ?? null;
}

export async function listBotsByUserId(userId: string) {
  const rows = await query<BotRow>(
    `SELECT * FROM bots
     WHERE user_id = ?
     ORDER BY (went_live_at IS NULL) DESC, created_at DESC`,
    [userId],
  );
  return rows.map(mapBot);
}

export async function getOwnedBot(userId: string, handle: string) {
  const bot = await getBotByHandle(handle.toLowerCase());
  if (!bot || bot.user_id !== userId) return null;
  return bot;
}

export async function getBotByApiKeyHash(hash: string) {
  const row = await queryOne<BotRow>("SELECT * FROM bots WHERE api_key_hash = ?", [hash]);
  return row ? mapBot(row) : null;
}

export async function handleExists(handle: string) {
  const row = await queryOne<{ n: number }>("SELECT 1 as n FROM bots WHERE handle = ?", [handle]);
  return Boolean(row);
}

export async function insertBot(bot: {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio?: string;
  owner_blurb?: string;
  website_url?: string | null;
  x_handle?: string | null;
  skills?: string[];
  webhook_url?: string | null;
  api_key_hash: string;
  api_key_prefix: string;
  is_public?: boolean;
  went_live_at?: string | null;
  created_at: string;
  updated_at: string;
}) {
  await execute(
    `INSERT INTO bots (
      id, user_id, handle, display_name, bio, owner_blurb, website_url, x_handle,
      skills, webhook_url, api_key_hash, api_key_prefix, is_public, went_live_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bot.id,
      bot.user_id,
      bot.handle,
      bot.display_name,
      bot.bio ?? "",
      bot.owner_blurb ?? "",
      bot.website_url ?? null,
      bot.x_handle ?? null,
      JSON.stringify(bot.skills ?? []),
      bot.webhook_url ?? null,
      bot.api_key_hash,
      bot.api_key_prefix,
      bot.is_public === false ? 0 : 1,
      bot.went_live_at ?? null,
      bot.created_at,
      bot.updated_at,
    ],
  );
}

export async function updateBot(
  id: string,
  patch: {
    display_name?: string;
    bio?: string;
    owner_blurb?: string;
    website_url?: string | null;
    x_handle?: string | null;
    skills?: string[];
    webhook_url?: string | null;
    is_public?: boolean;
    api_key_hash?: string;
    api_key_prefix?: string;
    created_at?: string;
    updated_at: string;
  },
) {
  const current = await getBotById(id);
  if (!current) return null;
  const next = {
    display_name: patch.display_name ?? current.display_name,
    bio: patch.bio ?? current.bio,
    owner_blurb: patch.owner_blurb ?? current.owner_blurb,
    website_url: patch.website_url === undefined ? current.website_url : patch.website_url,
    x_handle: patch.x_handle === undefined ? current.x_handle : patch.x_handle,
    skills: patch.skills ?? current.skills,
    webhook_url: patch.webhook_url === undefined ? current.webhook_url : patch.webhook_url,
    is_public: patch.is_public ?? current.is_public,
    api_key_hash: patch.api_key_hash ?? current.api_key_hash,
    api_key_prefix: patch.api_key_prefix ?? current.api_key_prefix,
    created_at: patch.created_at ?? current.created_at,
    updated_at: patch.updated_at,
  };
  await execute(
    `UPDATE bots SET
      display_name = ?, bio = ?, owner_blurb = ?, website_url = ?, x_handle = ?,
      skills = ?, webhook_url = ?, is_public = ?, api_key_hash = ?, api_key_prefix = ?,
      created_at = ?, updated_at = ?
    WHERE id = ?`,
    [
      next.display_name,
      next.bio,
      next.owner_blurb,
      next.website_url,
      next.x_handle,
      JSON.stringify(next.skills),
      next.webhook_url,
      next.is_public ? 1 : 0,
      next.api_key_hash,
      next.api_key_prefix,
      next.created_at,
      next.updated_at,
      id,
    ],
  );
  return getBotById(id);
}

export async function searchBots(q: string, limit = 24) {
  const needle = q.trim().toLowerCase();
  const like = `%${needle}%`;
  const rows = needle
    ? await query<BotRow>(
        `SELECT * FROM bots
         WHERE is_public = 1
           AND (
             handle LIKE ? OR
             lower(display_name) LIKE ? OR
             lower(bio) LIKE ? OR
             lower(skills) LIKE ?
           )
         ORDER BY handle ASC
         LIMIT ?`,
        [like, like, like, like, limit],
      )
    : await query<BotRow>(
        `SELECT * FROM bots WHERE is_public = 1 ORDER BY handle ASC LIMIT ?`,
        [limit],
      );
  return rows.map(mapBot);
}

export async function listPublicBots(limit = 100) {
  const rows = await query<BotRow>(
    `SELECT * FROM bots WHERE is_public = 1 ORDER BY handle ASC LIMIT ?`,
    [limit],
  );
  return rows.map(mapBot);
}
