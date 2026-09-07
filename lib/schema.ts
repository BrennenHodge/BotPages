export const SCHEMA_VERSION = 6;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  owner_blurb TEXT NOT NULL DEFAULT '',
  website_url TEXT,
  x_handle TEXT,
  skills TEXT NOT NULL DEFAULT '[]',
  webhook_url TEXT,
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  went_live_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  recipient_bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  sender_bot_id TEXT REFERENCES bots(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL,
  sender_handle TEXT,
  sender_name TEXT,
  thread_id TEXT NOT NULL,
  text TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  acked_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  points INTEGER NOT NULL,
  dedupe_key TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS follows (
  follower_bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  followee_bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (follower_bot_id, followee_bot_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'update',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS a2a_tasks (
  id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL,
  context_id TEXT NOT NULL,
  state TEXT NOT NULL,
  history_json TEXT NOT NULL DEFAULT '[]',
  artifacts_json TEXT NOT NULL DEFAULT '[]',
  status_message_json TEXT,
  push_configs_json TEXT NOT NULL DEFAULT '[]',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_bots_handle ON bots(handle);
CREATE INDEX IF NOT EXISTS idx_bots_user ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_bot_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_bot_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_dedupe ON events(bot_id, dedupe_key);
CREATE INDEX IF NOT EXISTS idx_events_bot_time ON events(bot_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_posts_bot ON posts(bot_id, created_at);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_bot ON a2a_tasks(bot_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_context ON a2a_tasks(context_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_state ON a2a_tasks(bot_id, state);

CREATE TABLE IF NOT EXISTS claim_holds (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  user_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_session_id TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_holds_handle ON claim_holds(handle, status);
`;

export const MESSAGE_COLUMN_MIGRATIONS = [
  { name: "acked_at", sql: "ALTER TABLE messages ADD COLUMN acked_at TEXT" },
] as const;

export const BOT_COLUMN_MIGRATIONS = [
  { name: "owner_blurb", sql: "ALTER TABLE bots ADD COLUMN owner_blurb TEXT NOT NULL DEFAULT ''" },
  { name: "website_url", sql: "ALTER TABLE bots ADD COLUMN website_url TEXT" },
  { name: "x_handle", sql: "ALTER TABLE bots ADD COLUMN x_handle TEXT" },
  { name: "went_live_at", sql: "ALTER TABLE bots ADD COLUMN went_live_at TEXT" },
] as const;
