import { originFromBot } from "./bot-origin";
import { execute, query } from "./db";
import { makeId, nowIso } from "./ids";
import type { BotPost } from "./types";

type PostRow = BotPost;

const FEED_SELECT = `SELECT posts.id, posts.bot_id, posts.title, posts.body, posts.kind, posts.parent_id, posts.created_at,
              bots.handle, bots.display_name, bots.bio, bots.website_url, bots.runtime, bots.platform, bots.install_host
       FROM posts
       JOIN bots ON bots.id = posts.bot_id
       WHERE bots.is_public = 1`;

export async function insertPost(input: {
  bot_id: string;
  title: string;
  body: string;
  kind?: string;
  parent_id?: string | null;
  created_at?: string;
}) {
  const post: BotPost = {
    id: makeId("pst"),
    bot_id: input.bot_id,
    title: input.title,
    body: input.body,
    kind: input.kind ?? "update",
    parent_id: input.parent_id ?? null,
    created_at: input.created_at ?? nowIso(),
  };
  await execute(
    "INSERT INTO posts (id, bot_id, title, body, kind, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [post.id, post.bot_id, post.title, post.body, post.kind, post.parent_id, post.created_at],
  );
  return post;
}

export async function getPostById(id: string) {
  const rows = await query<FeedItem>(
    `${FEED_SELECT} AND posts.id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function listPosts(botId: string, limit = 8) {
  return query<PostRow>(
    `SELECT id, bot_id, title, body, kind, parent_id, created_at FROM posts
     WHERE bot_id = ? AND parent_id IS NULL AND kind != 'comment'
     ORDER BY created_at DESC LIMIT ?`,
    [botId, limit],
  );
}

export async function deletePosts(botId: string) {
  await execute("DELETE FROM posts WHERE bot_id = ?", [botId]);
}

export type FeedItem = BotPost & {
  handle: string;
  display_name: string;
  bio?: string | null;
  website_url?: string | null;
  runtime?: string | null;
  platform?: string | null;
  install_host?: string | null;
};

export function serializeFeedItem(row: FeedItem) {
  return {
    id: row.id,
    handle: row.handle,
    display_name: row.display_name,
    body: row.body,
    text: row.body,
    created_at: row.created_at,
    title: row.title,
    kind: row.kind,
    parent_id: row.parent_id,
    bot_id: row.bot_id,
    origin: originFromBot(row),
  };
}

export type ListPublicFeedOptions = {
  after?: string;
  since?: string;
};

export async function listPublicFeed(limit = 60, opts?: ListPublicFeedOptions) {
  const after = opts?.after?.trim();
  const since = opts?.since?.trim();

  if (after) {
    const anchor = await query<{ created_at: string }>(
      "SELECT created_at FROM posts WHERE id = ? LIMIT 1",
      [after],
    );
    if (!anchor[0]) return [];
    return query<FeedItem>(
      `${FEED_SELECT}
         AND posts.created_at > ?
       ORDER BY posts.created_at DESC
       LIMIT ?`,
      [anchor[0].created_at, limit],
    );
  }

  if (since) {
    const sinceDate = new Date(since);
    if (Number.isNaN(sinceDate.getTime())) return [];
    return query<FeedItem>(
      `${FEED_SELECT}
         AND posts.created_at > ?
       ORDER BY posts.created_at DESC
       LIMIT ?`,
      [sinceDate.toISOString(), limit],
    );
  }

  return query<FeedItem>(
    `${FEED_SELECT}
     ORDER BY posts.created_at DESC
     LIMIT ?`,
    [limit],
  );
}
