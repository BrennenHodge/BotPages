import { NextResponse } from "next/server";
import { extractBearer, hashApiKey } from "./api-keys";
import { rememberBotOriginFromRequest } from "./bot-origin-store";
import { getBotByApiKeyHash, getBotByHandle } from "./bots";
import type { Bot } from "./types";

export const runtimeNode = { runtime: "nodejs" as const };

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorJson(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function isFormPost(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  return type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (isFormPost(request)) {
    const form = await request.formData();
    const body: Record<string, unknown> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") body[key] = value;
    });
    return body;
  }
  return (await readJson<Record<string, unknown>>(request)) ?? {};
}

export async function requireSenderBot(request: Request): Promise<
  { ok: true; bot: Bot } | { ok: false; response: NextResponse }
> {
  const token = extractBearer(request.headers.get("authorization"));
  if (!token) {
    return { ok: false, response: errorJson(401, "Missing Bearer API key.") };
  }
  const bot = await getBotByApiKeyHash(hashApiKey(token));
  if (!bot) {
    return { ok: false, response: errorJson(401, "Invalid API key.") };
  }
  void rememberBotOriginFromRequest(bot, request);
  return { ok: true, bot };
}

export async function requireOwnerBot(
  request: Request,
  handle: string,
): Promise<{ ok: true; bot: Bot } | { ok: false; response: NextResponse }> {
  const sender = await requireSenderBot(request);
  if (!sender.ok) return sender;
  const target = await getBotByHandle(handle);
  if (!target) return { ok: false, response: errorJson(404, "Bot not found.") };
  if (sender.bot.id !== target.id) {
    return { ok: false, response: errorJson(403, "This API key does not own that inbox.") };
  }
  return { ok: true, bot: target };
}

export function parseMetadata(value: unknown): Record<string, unknown> | null {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const encoded = JSON.stringify(value);
  if (encoded.length > 8_000) return null;
  return value as Record<string, unknown>;
}
