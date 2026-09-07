import { execute, query, queryOne } from "./db";
import { makeId, nowIso } from "./ids";
import type { Message } from "./types";

type MessageRow = {
  id: string;
  recipient_bot_id: string;
  sender_bot_id: string | null;
  sender_type: "bot" | "human";
  sender_handle: string | null;
  sender_name: string | null;
  thread_id: string;
  text: string;
  metadata: string;
  created_at: string;
  acked_at: string | null;
};

function mapMessage(row: MessageRow): Message {
  let metadata: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(row.metadata);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      metadata = parsed as Record<string, unknown>;
    }
  } catch {
    metadata = {};
  }
  return { ...row, metadata, acked_at: row.acked_at ?? null };
}

export async function insertMessage(input: {
  recipient_bot_id: string;
  sender_bot_id?: string | null;
  sender_type: "bot" | "human";
  sender_handle?: string | null;
  sender_name?: string | null;
  thread_id?: string;
  text: string;
  metadata?: Record<string, unknown>;
}) {
  const message: Message = {
    id: makeId("msg"),
    recipient_bot_id: input.recipient_bot_id,
    sender_bot_id: input.sender_bot_id ?? null,
    sender_type: input.sender_type,
    sender_handle: input.sender_handle ?? null,
    sender_name: input.sender_name ?? null,
    thread_id: input.thread_id || makeId("thr"),
    text: input.text,
    metadata: input.metadata ?? {},
    created_at: nowIso(),
    acked_at: null,
  };
  await execute(
    `INSERT INTO messages (
      id, recipient_bot_id, sender_bot_id, sender_type, sender_handle,
      sender_name, thread_id, text, metadata, created_at, acked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.recipient_bot_id,
      message.sender_bot_id,
      message.sender_type,
      message.sender_handle,
      message.sender_name,
      message.thread_id,
      message.text,
      JSON.stringify(message.metadata),
      message.created_at,
      null,
    ],
  );
  return message;
}

export async function getMessageById(id: string) {
  const row = await queryOne<MessageRow>("SELECT * FROM messages WHERE id = ?", [id]);
  return row ? mapMessage(row) : null;
}

export async function listInbox(
  botId: string,
  threadId?: string,
  limit = 50,
  opts?: { unreadOnly?: boolean },
) {
  const unread = Boolean(opts?.unreadOnly);
  const rows = threadId
    ? await query<MessageRow>(
        `SELECT * FROM messages
         WHERE (recipient_bot_id = ? OR sender_bot_id = ?) AND thread_id = ?
         ORDER BY created_at ASC
         LIMIT ?`,
        [botId, botId, threadId, limit],
      )
    : unread
      ? await query<MessageRow>(
          `SELECT * FROM messages
           WHERE recipient_bot_id = ? AND acked_at IS NULL
           ORDER BY created_at DESC
           LIMIT ?`,
          [botId, limit],
        )
      : await query<MessageRow>(
          `SELECT * FROM messages
           WHERE recipient_bot_id = ?
           ORDER BY created_at DESC
           LIMIT ?`,
          [botId, limit],
        );
  return rows.map(mapMessage);
}

export async function ackMessage(botId: string, messageId: string) {
  const row = await getMessageById(messageId);
  if (!row || row.recipient_bot_id !== botId) return null;
  if (row.acked_at) return row;
  const stamped = nowIso();
  await execute("UPDATE messages SET acked_at = ? WHERE id = ? AND recipient_bot_id = ?", [
    stamped,
    messageId,
    botId,
  ]);
  return { ...row, acked_at: stamped };
}

export function serializeMessage(message: Message) {
  return {
    id: message.id,
    thread_id: message.thread_id,
    text: message.text,
    metadata: message.metadata,
    sender: {
      type: message.sender_type,
      bot_id: message.sender_bot_id,
      handle: message.sender_handle,
      name: message.sender_name,
    },
    recipient_bot_id: message.recipient_bot_id,
    created_at: message.created_at,
  };
}

export async function listBotToBotMessages(botId: string, limit = 24) {
  const rows = await query<MessageRow>(
    `SELECT * FROM messages
     WHERE sender_type = 'bot'
       AND sender_bot_id IS NOT NULL
       AND (recipient_bot_id = ? OR sender_bot_id = ?)
     ORDER BY created_at DESC
     LIMIT ?`,
    [botId, botId, limit],
  );
  const messages = rows.map(mapMessage);
  if (!messages.length) return [] as Message[];

  // Prefer the welcome / a2a thread if present; else most recent thread.
  const welcome = messages.find(
    (row) => Boolean(row.metadata?.site_welcome) || Boolean(row.metadata?.demo_welcome) || Boolean(row.metadata?.a2a_demo),
  );
  const threadId = welcome?.thread_id ?? messages[0].thread_id;
  const thread = messages
    .filter((row) => row.thread_id === threadId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return thread;
}

