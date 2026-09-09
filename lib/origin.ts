import { headers } from "next/headers";
import { appUrl } from "./utils";

export function originFromRequest(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return mailOrigin();
  }
  try {
    const url = new URL(req.url);
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
    const proto =
      req.headers.get("x-forwarded-proto") ??
      (host.includes("localhost") || host.startsWith("127.") ? "http" : url.protocol.replace(":", "") || "https");
    if (host) return `${proto}://${host}`;
  } catch {
    /* fall through */
  }
  return appUrl() || "http://127.0.0.1:43127";
}

/** Canonical origin for emails and other secrets. Ignore client Host headers in production. */
export function mailOrigin() {
  if (process.env.NODE_ENV === "production") {
    return appUrl() || (process.env.BASE_URL ?? "").replace(/\/$/, "") || "https://botpages.co";
  }
  return appUrl() || "http://127.0.0.1:43127";
}
export function docsOrigin() {
  const app = appUrl();
  if (app && !/localhost|127\.0\.0\.1/i.test(app)) return app;
  return "https://botpages.co";
}

export async function requestOrigin() {
  if (process.env.NODE_ENV === "production") {
    return mailOrigin();
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") || host?.startsWith("127.") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return appUrl() || "http://127.0.0.1:43127";
}
