import { createClient, type Client, type InValue, type Row } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { BOT_COLUMN_MIGRATIONS, MESSAGE_COLUMN_MIGRATIONS, POST_COLUMN_MIGRATIONS, SCHEMA_SQL, SCHEMA_VERSION, TABLE_MIGRATIONS } from "./schema";

const globalForDb = globalThis as unknown as {
  __cursorBotDb?: Client;
  __cursorBotReady?: Promise<void>;
  __cursorBotSchemaVersion?: number;
  __cursorBotPostsMigrated?: boolean;
};

function resolveUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const filePath = path.join(process.cwd(), "data", "cursor-bot.db");
  return `file:${filePath}`;
}

function ensureFileDir(url: string) {
  if (!url.startsWith("file:")) return;
  const filePath = url.slice("file:".length);
  if (!filePath || filePath.startsWith(":memory:")) return;
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

export function getDb(): Client {
  if (globalForDb.__cursorBotDb) return globalForDb.__cursorBotDb;
  const url = resolveUrl();
  ensureFileDir(url);
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  globalForDb.__cursorBotDb = client;
  return client;
}

async function migrateColumns(table: string, migrations: readonly { name: string; sql: string }[]) {
  const info = await getDb().execute(`PRAGMA table_info(${table})`);
  const names = new Set(info.rows.map((row) => String(row.name)));
  for (const column of migrations) {
    if (names.has(column.name)) continue;
    await getDb().execute(column.sql);
  }
}

async function migrateTables(migrations: readonly { name: string; sql: string }[]) {
  const info = await getDb().execute(`SELECT name FROM sqlite_master WHERE type = 'table'`);
  const names = new Set(info.rows.map((row) => String(row.name)));
  for (const table of migrations) {
    if (names.has(table.name)) continue;
    await getDb().executeMultiple(table.sql);
  }
}

export async function ensureSchema() {
  if (globalForDb.__cursorBotSchemaVersion === SCHEMA_VERSION && globalForDb.__cursorBotReady) {
    await globalForDb.__cursorBotReady;
    if (!globalForDb.__cursorBotPostsMigrated) {
      await migrateColumns("posts", POST_COLUMN_MIGRATIONS);
      await getDb().execute("CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id, created_at)");
      globalForDb.__cursorBotPostsMigrated = true;
    }
    return;
  }
  globalForDb.__cursorBotReady = (async () => {
    await getDb().executeMultiple(SCHEMA_SQL);
    await migrateTables(TABLE_MIGRATIONS);
    await migrateColumns("bots", BOT_COLUMN_MIGRATIONS);
    await migrateColumns("messages", MESSAGE_COLUMN_MIGRATIONS);
    await migrateColumns("posts", POST_COLUMN_MIGRATIONS);
    await getDb().execute("CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id, created_at)");
    globalForDb.__cursorBotPostsMigrated = true;
    await getDb().execute(
      `UPDATE bots SET went_live_at = created_at
       WHERE went_live_at IS NULL AND (
         TRIM(bio) != '' OR id IN (SELECT DISTINCT bot_id FROM events)
       )`,
    );
    globalForDb.__cursorBotSchemaVersion = SCHEMA_VERSION;
  })();
  await globalForDb.__cursorBotReady;
}

export async function query<T>(sql: string, args: InValue[] = []) {
  await ensureSchema();
  const result = await getDb().execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function queryOne<T>(sql: string, args: InValue[] = []) {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

export async function execute(sql: string, args: InValue[] = []) {
  await ensureSchema();
  return getDb().execute({ sql, args });
}

export function rowString(row: Row, key: string) {
  const value = row[key];
  return value == null ? null : String(value);
}
