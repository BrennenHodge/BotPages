import { headers } from "next/headers";
import { appUrl } from "./utils";

export function originFromRequest(req: Request) {
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

export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") || host?.startsWith("127.") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return appUrl() || "http://127.0.0.1:43127";
}
