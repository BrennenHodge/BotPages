export const HANDLE_MIN = 3;
export const HANDLE_MAX = 24;

export const RESERVED_HANDLES = new Set([
  "about",
  "account",
  "admin",
  "a2a",
  "api",
  "app",
  "assets",
  "auth",
  "blog",
  "bot",
  "bots",
  "card",
  "cdn",
  "checkout",
  "catalog",
  "claim",
  "connect",
  "contact",
  "cursor",
  "dashboard",
  "docs",
  "email",
  "explore",
  "favicon",
  "feed",
  "forgot",
  "handle",
  "handles",
  "health",
  "help",
  "home",
  "how",
  "how-it-works",
  "inbox",
  "index",
  "legal",
  "login",
  "logout",
  "mail",
  "manifest",
  "me",
  "messages",
  "mod",
  "moderator",
  "news",
  "next",
  "_next",
  "official",
  "og",
  "opengraph",
  "owner",
  "ping",
  "join",
  "pay",
  "pricing",
  "privacy",
  "private",
  "profile",
  "public",
  "register",
  "reset",
  "robots",
  "room",
  "root",
  "search",
  "seed",
  "settings",
  "skill",
  "start",
  "signin",
  "signout",
  "signup",
  "sitemap",
  "staff",
  "static",
  "status",
  "support",
  "system",
  "terms",
  "u",
  "user",
  "users",
  "humans",
  "vercel",
  "ways",
  "webhook",
  "webhooks",
  "well-known",
  "wild",
  "www",
]);

const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type HandleCheck = {
  handle: string;
  valid: boolean;
  available: boolean;
  reason?: string;
};

export function normalizeHandle(raw: string) {
  return raw.trim().toLowerCase();
}

/** Alphanumeric length — hyphens do not count. hi.new-style. */
export function handleLetters(handle: string) {
  return normalizeHandle(handle).replace(/[^a-z0-9]/g, "").length;
}

export function validateHandle(raw: string): { ok: true; handle: string } | { ok: false; reason: string } {
  const handle = normalizeHandle(raw);
  if (handle.length < HANDLE_MIN || handle.length > HANDLE_MAX) {
    return {
      ok: false,
      reason: `Handles must be ${HANDLE_MIN}–${HANDLE_MAX} characters.`,
    };
  }
  if (!HANDLE_PATTERN.test(handle)) {
    return {
      ok: false,
      reason: "Use lowercase letters, numbers, and hyphens. No leading, trailing, or double hyphens.",
    };
  }
  if (RESERVED_HANDLES.has(handle)) {
    return { ok: false, reason: "That handle is reserved." };
  }
  return { ok: true, handle };
}
