import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google.com",
]);

function ipv4Octets(ip: string) {
  const parts = ip.split(".").map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return parts as [number, number, number, number];
}

export function isPrivateIp(ip: string) {
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (v4 === "::1" || v4 === "0.0.0.0") return true;
  if (v4.includes(":")) {
    const lower = v4.toLowerCase();
    return lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80") || lower === "::";
  }
  const o = ipv4Octets(v4);
  if (!o) return true;
  if (o[0] === 10) return true;
  if (o[0] === 127) return true;
  if (o[0] === 0) return true;
  if (o[0] === 169 && o[1] === 254) return true;
  if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true;
  if (o[0] === 192 && o[1] === 168) return true;
  if (o[0] === 100 && o[1] >= 64 && o[1] <= 127) return true;
  return false;
}

export async function assertSafeWebhookUrl(raw: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const url = raw.trim();
  if (!url) return { ok: false, error: "Webhook URL is empty." };
  if (url.length > 500) return { ok: false, error: "That URL is too long." };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "That webhook URL is not valid." };
  }

  const prod = process.env.NODE_ENV === "production";
  if (prod && parsed.protocol !== "https:") {
    return { ok: false, error: "Webhooks must be https:// in production." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Webhook URL must start with http(s)://." };
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
    if (prod) return { ok: false, error: "That webhook host is not allowed." };
  }

  if (isIP(host)) {
    if (prod && isPrivateIp(host)) return { ok: false, error: "That webhook host is not allowed." };
    return { ok: true, url: parsed.toString() };
  }

  if (/^\d+$/.test(host) || host.includes("metadata")) {
    return { ok: false, error: "That webhook host is not allowed." };
  }

  if (!prod) return { ok: true, url: parsed.toString() };

  try {
    const records = await lookup(host, { all: true, verbatim: true });
    if (!records.length || records.some((row) => isPrivateIp(row.address))) {
      return { ok: false, error: "That webhook host is not allowed." };
    }
  } catch {
    return { ok: false, error: "Could not resolve that webhook host." };
  }

  return { ok: true, url: parsed.toString() };
}
