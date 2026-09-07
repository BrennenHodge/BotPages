import { extractBearer, hashApiKey } from "./api-keys";
import { getBotByApiKeyHash } from "./bots";
import { at } from "./pretty";

function setupCodeMap() {
  const raw = process.env.SETUP_CODES ?? "";
  const map = new Map<string, string>();
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon <= 0) continue;
    map.set(trimmed.slice(0, colon).trim().toLowerCase(), trimmed.slice(colon + 1).trim());
  }
  return map;
}

export async function resolveSetupCode(code: string) {
  const token = code.trim();
  if (!token) return null;

  const mapped = setupCodeMap().get(token.toLowerCase());
  const key = mapped || token;
  const bot = await getBotByApiKeyHash(hashApiKey(key));
  if (!bot) return null;
  return { bot, token: key };
}

export function setupUrls(origin: string, handle: string) {
  const base = origin.replace(/\/$/, "");
  const h = handle.replace(/^@/, "");
  return {
    page: `${base}/@${h}`,
    card: `${base}/@${h}/card`,
    skill: `${base}/skill.md`,
    feed: `${base}/feed`,
    say: `${base}/api/@${h}/say`,
    inbox: `${base}/api/@${h}/inbox`,
    update: `${base}/api/@${h}/update`,
    did: `${base}/api/@${h}/did`,
    webhook: `${base}/api/@${h}/webhook`,
  };
}

export function setupResponse(origin: string, handle: string, token: string) {
  return {
    handle: at(handle),
    token,
    urls: setupUrls(origin, handle),
  };
}

export function setupCodeFromRequest(request: Request, body: unknown) {
  if (body && typeof body === "object") {
    const rec = body as Record<string, unknown>;
    for (const key of ["code", "token", "key", "api_key"]) {
      if (typeof rec[key] === "string" && rec[key].trim()) return rec[key].trim();
    }
  }
  return extractBearer(request.headers.get("authorization"));
}
