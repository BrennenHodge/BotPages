import { getEventType, scoreEvent } from "./catalog";
import { utcDay } from "./dates";
import { execute, query, queryOne } from "./db";
import { makeId, nowIso } from "./ids";
import type { BotEvent } from "./types";

type EventRow = {
  id: string;
  bot_id: string;
  type: string;
  count: number;
  points: number;
  dedupe_key: string;
  occurred_at: string;
  created_at: string;
  metadata: string;
};

function mapEvent(row: EventRow): BotEvent {
  let metadata: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(row.metadata);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      metadata = parsed as Record<string, unknown>;
    }
  } catch {
    metadata = {};
  }
  return {
    ...row,
    count: Number(row.count),
    points: Number(row.points),
    metadata,
  };
}

export function serializeEvent(event: BotEvent) {
  const spec = getEventType(event.type);
  // Public ledger is type + count + points only — never freeform did notes / spicy metadata.
  return {
    id: event.id,
    type: event.type,
    label: spec?.label ?? event.type,
    count: event.count,
    points: event.points,
    occurred_at: event.occurred_at,
    created_at: event.created_at,
    metadata: {},
  };
}

export async function insertEvent(input: {
  bot_id: string;
  type: string;
  count: number;
  points?: number;
  dedupe_key: string;
  occurred_at?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ event: BotEvent; inserted: boolean } | { error: string }> {
  const scored = scoreEvent(input.type, input.count, input.points);
  if (!scored) return { error: `Unknown event type: ${input.type}` };

  let occurred: string;
  try {
    occurred = utcDay(input.occurred_at ?? new Date());
  } catch {
    return { error: "occurred_at must be an ISO date." };
  }

  const existing = await queryOne<EventRow>(
    "SELECT * FROM events WHERE bot_id = ? AND dedupe_key = ?",
    [input.bot_id, input.dedupe_key],
  );
  if (existing) return { event: mapEvent(existing), inserted: false };

  const event: BotEvent = {
    id: makeId("evt"),
    bot_id: input.bot_id,
    type: input.type,
    count: input.count,
    points: scored.points,
    dedupe_key: input.dedupe_key,
    occurred_at: occurred,
    created_at: nowIso(),
    metadata: input.metadata ?? {},
  };

  await execute(
    `INSERT INTO events (
      id, bot_id, type, count, points, dedupe_key, occurred_at, created_at, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.bot_id,
      event.type,
      event.count,
      event.points,
      event.dedupe_key,
      event.occurred_at,
      event.created_at,
      JSON.stringify(event.metadata),
    ],
  );
  return { event, inserted: true };
}

export async function listEvents(botId: string, limit = 50, type?: string) {
  const rows = type
    ? await query<EventRow>(
        `SELECT * FROM events WHERE bot_id = ? AND type = ?
         ORDER BY occurred_at DESC, created_at DESC LIMIT ?`,
        [botId, type, limit],
      )
    : await query<EventRow>(
        `SELECT * FROM events WHERE bot_id = ?
         ORDER BY occurred_at DESC, created_at DESC LIMIT ?`,
        [botId, limit],
      );
  return rows.map(mapEvent);
}

export async function listEventsSince(botId: string, sinceDay: string) {
  const rows = await query<EventRow>(
    `SELECT * FROM events WHERE bot_id = ? AND occurred_at >= ?
     ORDER BY occurred_at ASC`,
    [botId, sinceDay],
  );
  return rows.map(mapEvent);
}

export async function deleteSeedEvents(botId: string) {
  await execute("DELETE FROM events WHERE bot_id = ? AND dedupe_key LIKE 'seed:%'", [botId]);
}
