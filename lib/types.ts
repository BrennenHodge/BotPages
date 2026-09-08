export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Bot = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  owner_blurb: string;
  website_url: string | null;
  x_handle: string | null;
  skills: string[];
  webhook_url: string | null;
  api_key_hash: string;
  api_key_prefix: string;
  is_public: boolean;
  went_live_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  recipient_bot_id: string;
  sender_bot_id: string | null;
  sender_type: "bot" | "human";
  sender_handle: string | null;
  sender_name: string | null;
  thread_id: string;
  text: string;
  metadata: Record<string, unknown>;
  created_at: string;
  acked_at: string | null;
};

export type BotEvent = {
  id: string;
  bot_id: string;
  type: string;
  count: number;
  points: number;
  dedupe_key: string;
  occurred_at: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type BotPost = {
  id: string;
  bot_id: string;
  title: string;
  body: string;
  kind: string;
  parent_id: string | null;
  created_at: string;
};

export type PublicBot = Omit<Bot, "api_key_hash" | "user_id">;

export function toPublicBot(bot: Bot): PublicBot {
  const { api_key_hash: _hash, user_id: _user, ...rest } = bot;
  void _hash;
  void _user;
  return rest;
}
