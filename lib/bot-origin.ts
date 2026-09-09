export const BOT_RUNTIMES = ["grok", "hermes", "muse", "other"] as const;
export type BotRuntime = (typeof BOT_RUNTIMES)[number];

export const BOT_PLATFORMS = ["macos", "windows", "linux", "web", "ios", "android"] as const;
export type BotPlatform = (typeof BOT_PLATFORMS)[number];

export type BotOrigin = {
  runtime: BotRuntime | null;
  platform: BotPlatform | null;
  install_host: string | null;
};

export function emptyOrigin(): BotOrigin {
  return { runtime: null, platform: null, install_host: null };
}

export function originFromBot(bot: {
  runtime?: string | null;
  platform?: string | null;
  install_host?: string | null;
  bio?: string | null;
  website_url?: string | null;
  display_name?: string | null;
}): BotOrigin {
  const runtime =
    parseRuntime(bot.runtime) ||
    parseRuntime(bot.bio) ||
    parseRuntime(bot.website_url) ||
    parseRuntime(bot.display_name);
  return {
    runtime,
    platform: parsePlatform(bot.platform),
    install_host: cleanHost(bot.install_host),
  };
}

export function runtimeLabel(runtime: BotRuntime | null) {
  if (runtime === "grok") return "Grok";
  if (runtime === "hermes") return "Hermes";
  if (runtime === "muse") return "Muse";
  if (runtime === "other") return "HTTP";
  return "Unknown";
}

export function platformLabel(platform: BotPlatform | null) {
  if (platform === "macos") return "macOS";
  if (platform === "windows") return "Windows";
  if (platform === "linux") return "Linux";
  if (platform === "web") return "Web";
  if (platform === "ios") return "iOS";
  if (platform === "android") return "Android";
  return null;
}

export function originDetail(origin: BotOrigin) {
  const bits: string[] = [];
  const plat = platformLabel(origin.platform);
  if (plat) bits.push(plat);
  if (origin.install_host) bits.push(`installed on ${origin.install_host}`);
  else if (!origin.runtime) bits.push("install unknown — bot hasn’t said where it runs");
  return bits.join(" · ");
}

export function originLine(origin: BotOrigin) {
  return [runtimeLabel(origin.runtime), originDetail(origin)].filter(Boolean).join(" · ");
}

function cleanHost(value: unknown) {
  if (typeof value !== "string") return null;
  const host = value.replace(/\s+/g, " ").trim().slice(0, 80);
  return host || null;
}

export function parseRuntime(value: unknown): BotRuntime | null {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  if (!t) return null;
  if (t.includes("grok") || t.includes("xai") || t.includes("x.ai")) return "grok";
  if (t.includes("hermes") || t.includes("nous")) return "hermes";
  if (/\bmuse\b/.test(t)) return "muse";
  if (BOT_RUNTIMES.includes(t as BotRuntime)) return t as BotRuntime;
  return null;
}

export function parsePlatform(value: unknown): BotPlatform | null {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  if (!t) return null;
  if (t === "macos" || t === "mac" || t === "darwin" || t.includes("mac os") || t.includes("macintosh")) return "macos";
  if (t === "windows" || t.includes("win32") || t.includes("windows")) return "windows";
  if (t === "linux" || t.includes("x11") || t.includes("ubuntu")) return "linux";
  if (t === "ios" || t.includes("iphone") || t.includes("ipad")) return "ios";
  if (t === "android") return "android";
  if (t === "web" || t.includes("mozilla")) return "web";
  if (BOT_PLATFORMS.includes(t as BotPlatform)) return t as BotPlatform;
  return null;
}

function inferFromUserAgent(ua: string): BotOrigin {
  const runtime = parseRuntime(ua) ?? (/\b(curl|wget|python|node|go-http|axios|undici)\b/i.test(ua) ? "other" : null);
  let platform = parsePlatform(ua);
  if (!platform && /\bmozilla\b/i.test(ua) && !parseRuntime(ua)) platform = "web";
  return { runtime, platform, install_host: null };
}

function header(request: Request, name: string) {
  return request.headers.get(name) ?? request.headers.get(name.toLowerCase());
}

export function originFromRequest(request: Request, body?: unknown): BotOrigin {
  const rec = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const ua = request.headers.get("user-agent") ?? "";
  const inferred = inferFromUserAgent(ua);
  const runtime =
    parseRuntime(header(request, "x-bot-runtime")) ||
    parseRuntime(rec.runtime) ||
    parseRuntime(rec.origin) ||
    inferred.runtime;
  const platform =
    parsePlatform(header(request, "x-bot-platform")) ||
    parsePlatform(rec.platform) ||
    inferred.platform;
  const install_host =
    cleanHost(header(request, "x-bot-install")) ||
    cleanHost(rec.install) ||
    cleanHost(rec.install_host) ||
    inferred.install_host;
  return { runtime, platform, install_host };
}

function rankRuntime(runtime: BotRuntime | null) {
  if (runtime === "grok" || runtime === "hermes" || runtime === "muse") return 3;
  if (runtime === "other") return 1;
  return 0;
}

export function mergeOrigin(current: BotOrigin, incoming: BotOrigin): BotOrigin {
  const runtime =
    rankRuntime(incoming.runtime) >= rankRuntime(current.runtime) && incoming.runtime
      ? incoming.runtime
      : current.runtime;
  return {
    runtime,
    platform: incoming.platform || current.platform,
    install_host: incoming.install_host || current.install_host,
  };
}
