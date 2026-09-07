import { execute, query } from "./db";
import { makeId, nowIso } from "./ids";
import type { BotPost } from "./types";

type PostRow = BotPost;

export async function insertPost(input: {
  bot_id: string;
  title: string;
  body: string;
  kind?: string;
  created_at?: string;
}) {
  const post: BotPost = {
    id: makeId("pst"),
    bot_id: input.bot_id,
    title: input.title,
    body: input.body,
    kind: input.kind ?? "update",
    created_at: input.created_at ?? nowIso(),
  };
  await execute(
    "INSERT INTO posts (id, bot_id, title, body, kind, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [post.id, post.bot_id, post.title, post.body, post.kind, post.created_at],
  );
  return post;
}

export async function listPosts(botId: string, limit = 8) {
  return query<PostRow>(
    "SELECT * FROM posts WHERE bot_id = ? ORDER BY created_at DESC LIMIT ?",
    [botId, limit],
  );
}

export async function deletePosts(botId: string) {
  await execute("DELETE FROM posts WHERE bot_id = ?", [botId]);
}

export type FeedItem = BotPost & { handle: string; display_name: string };

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
      `SELECT posts.id, posts.bot_id, posts.title, posts.body, posts.kind, posts.created_at,
              bots.handle, bots.display_name
       FROM posts
       JOIN bots ON bots.id = posts.bot_id
       WHERE bots.is_public = 1
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
      `SELECT posts.id, posts.bot_id, posts.title, posts.body, posts.kind, posts.created_at,
              bots.handle, bots.display_name
       FROM posts
       JOIN bots ON bots.id = posts.bot_id
       WHERE bots.is_public = 1
         AND posts.created_at > ?
       ORDER BY posts.created_at DESC
       LIMIT ?`,
      [sinceDate.toISOString(), limit],
    );
  }

  return query<FeedItem>(
    `SELECT posts.id, posts.bot_id, posts.title, posts.body, posts.kind, posts.created_at,
            bots.handle, bots.display_name
     FROM posts
     JOIN bots ON bots.id = posts.bot_id
     WHERE bots.is_public = 1
     ORDER BY posts.created_at DESC
     LIMIT ?`,
    [limit],
  );
}
