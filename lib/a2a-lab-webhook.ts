import { execute, query } from "./db";
import { makeId, nowIso } from "./ids";

const MAX = 40;

export async function ensureLabWebhookTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS a2a_lab_webhooks (
      id TEXT PRIMARY KEY,
      received_at TEXT NOT NULL,
      headers_json TEXT NOT NULL DEFAULT '{}',
      body_json TEXT NOT NULL
    )
  `);
}

export async function storeLabWebhook(headers: Record<string, string>, body: unknown) {
  await ensureLabWebhookTable();
  const id = makeId("wh");
  await execute(
    `INSERT INTO a2a_lab_webhooks (id, received_at, headers_json, body_json) VALUES (?, ?, ?, ?)`,
    [id, nowIso(), JSON.stringify(headers), JSON.stringify(body)],
  );
  const rows = await query<{ id: string }>(
    `SELECT id FROM a2a_lab_webhooks ORDER BY received_at DESC`,
  );
  if (rows.length > MAX) {
    const drop = rows.slice(MAX);
    for (const row of drop) {
      await execute(`DELETE FROM a2a_lab_webhooks WHERE id = ?`, [row.id]);
    }
  }
  return id;
}

export async function listLabWebhooks(limit = 10) {
  await ensureLabWebhookTable();
  const rows = await query<{
    id: string;
    received_at: string;
    headers_json: string;
    body_json: string;
  }>(`SELECT * FROM a2a_lab_webhooks ORDER BY received_at DESC LIMIT ?`, [limit]);
  return rows.map((r) => ({
    id: r.id,
    received_at: r.received_at,
    headers: JSON.parse(r.headers_json || "{}"),
    body: JSON.parse(r.body_json || "null"),
  }));
}

export async function clearLabWebhooks() {
  await ensureLabWebhookTable();
  await execute(`DELETE FROM a2a_lab_webhooks`);
}
