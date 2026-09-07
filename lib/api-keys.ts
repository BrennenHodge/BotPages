import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const API_KEY_PREFIX = "cb_live_";

export function generateApiKey() {
  const secret = randomBytes(24).toString("hex");
  const key = `${API_KEY_PREFIX}${secret}`;
  return {
    key,
    hash: hashApiKey(key),
    prefix: displayPrefix(key),
  };
}

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function displayPrefix(key: string) {
  return `${key.slice(0, 15)}…`;
}

export function extractBearer(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

export function keysEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
