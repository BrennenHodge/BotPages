import { getEventType } from "./catalog";
import { addDays, utcDay } from "./dates";
import { query } from "./db";
import { isBotLive } from "./bots";
import type { Bot } from "./types";

function placeholders(count: number) {
  return Array.from({ length: count }, () => "?").join(", ");
}

export type FleetMail = {
  from: string;
  text: string;
  at: string;
};

export type FleetDid = {
  label: string;
  at: string;
};

export type FleetBotCard = {
  id: string;
  handle: string;
  display_name: string;
  is_public: boolean;
  live: boolean;
  unread: number;
  inbox: number;
  lastMail: FleetMail | null;
  lastDid: FleetDid | null;
  weekScore: number;
  totalScore: number;
};

export type FleetPulseItem =
  | { kind: "mail"; botHandle: string; from: string; text: string; at: string }
  | { kind: "did"; botHandle: string; label: string; at: string };

function senderLabel(row: { sender_type: string; sender_handle: string | null; sender_name: string | null }) {
  if (row.sender_type === "bot" && row.sender_handle) return `@${row.sender_handle}`;
  return row.sender_name?.trim() || "Someone";
}

export async function getFleetDesk(bots: Bot[]) {
  const cards: FleetBotCard[] = bots.map((bot) => ({
    id: bot.id,
    handle: bot.handle,
    display_name: bot.display_name,
    is_public: bot.is_public,
    live: isBotLive(bot),
    unread: 0,
    inbox: 0,
    lastMail: null,
    lastDid: null,
    weekScore: 0,
    totalScore: 0,
  }));
  const byId = new Map(cards.map((card) => [card.id, card]));
  const ids = bots.map((bot) => bot.id);
  if (!ids.length) {
    return {
      cards,
      pulse: [] as FleetPulseItem[],
      unread: 0,
      live: 0,
      needsPaste: 0,
    };
  }

  const inList = placeholders(ids.length);
  const weekStart = addDays(utcDay(), -6);

  const counts = await query<{ bot_id: string; inbox: number; unread: number }>(
    `SELECT recipient_bot_id as bot_id,
            COUNT(*) as inbox,
            SUM(CASE WHEN acked_at IS NULL THEN 1 ELSE 0 END) as unread
     FROM messages
     WHERE recipient_bot_id IN (${inList})
     GROUP BY recipient_bot_id`,
    ids,
  );
  for (const row of counts) {
    const card = byId.get(row.bot_id);
    if (!card) continue;
    card.inbox = Number(row.inbox);
    card.unread = Number(row.unread);
  }

  const latestMail = await query<{
    recipient_bot_id: string;
    sender_type: string;
    sender_handle: string | null;
    sender_name: string | null;
    text: string;
    created_at: string;
  }>(
    `SELECT m.recipient_bot_id, m.sender_type, m.sender_handle, m.sender_name, m.text, m.created_at
     FROM messages m
     INNER JOIN (
       SELECT recipient_bot_id, MAX(created_at) as max_at
       FROM messages
       WHERE recipient_bot_id IN (${inList})
       GROUP BY recipient_bot_id
     ) latest ON latest.recipient_bot_id = m.recipient_bot_id AND latest.max_at = m.created_at`,
    ids,
  );
  for (const row of latestMail) {
    const card = byId.get(row.recipient_bot_id);
    if (!card) continue;
    card.lastMail = {
      from: senderLabel(row),
      text: row.text.trim(),
      at: row.created_at,
    };
  }

  const scores = await query<{ bot_id: string; score: number; week_score: number }>(
    `SELECT bot_id,
            COALESCE(SUM(points), 0) as score,
            COALESCE(SUM(CASE WHEN occurred_at >= ? THEN points ELSE 0 END), 0) as week_score
     FROM events
     WHERE bot_id IN (${inList})
     GROUP BY bot_id`,
    [weekStart, ...ids],
  );
  for (const row of scores) {
    const card = byId.get(row.bot_id);
    if (!card) continue;
    card.totalScore = Number(row.score);
    card.weekScore = Number(row.week_score);
  }

  const latestDid = await query<{ bot_id: string; type: string; created_at: string }>(
    `SELECT e.bot_id, e.type, e.created_at
     FROM events e
     INNER JOIN (
       SELECT bot_id, MAX(created_at) as max_at
       FROM events
       WHERE bot_id IN (${inList})
       GROUP BY bot_id
     ) latest ON latest.bot_id = e.bot_id AND latest.max_at = e.created_at`,
    ids,
  );
  for (const row of latestDid) {
    const card = byId.get(row.bot_id);
    if (!card) continue;
    card.lastDid = {
      label: getEventType(row.type)?.label ?? row.type.replace(/_/g, " "),
      at: row.created_at,
    };
  }

  const recentMail = await query<{
    recipient_bot_id: string;
    sender_type: string;
    sender_handle: string | null;
    sender_name: string | null;
    text: string;
    created_at: string;
  }>(
    `SELECT recipient_bot_id, sender_type, sender_handle, sender_name, text, created_at
     FROM messages
     WHERE recipient_bot_id IN (${inList})
     ORDER BY created_at DESC
     LIMIT 12`,
    ids,
  );
  const recentDid = await query<{ bot_id: string; type: string; created_at: string }>(
    `SELECT bot_id, type, created_at
     FROM events
     WHERE bot_id IN (${inList})
     ORDER BY created_at DESC
     LIMIT 12`,
    ids,
  );

  const handleById = new Map(bots.map((bot) => [bot.id, bot.handle]));
  const pulse: FleetPulseItem[] = [
    ...recentMail.map((row) => ({
      kind: "mail" as const,
      botHandle: handleById.get(row.recipient_bot_id) ?? "unknown",
      from: senderLabel(row),
      text: row.text.trim(),
      at: row.created_at,
    })),
    ...recentDid.map((row) => ({
      kind: "did" as const,
      botHandle: handleById.get(row.bot_id) ?? "unknown",
      label: getEventType(row.type)?.label ?? row.type.replace(/_/g, " "),
      at: row.created_at,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 14);

  return {
    cards,
    pulse,
    unread: cards.reduce((sum, card) => sum + card.unread, 0),
    live: cards.filter((card) => card.live).length,
    needsPaste: cards.filter((card) => !card.live).length,
  };
}
