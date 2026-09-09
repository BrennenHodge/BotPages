export function safeNextPath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  const next = value.trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://") || next.includes("\\")) {
    return fallback;
  }
  if (/[\0\s]/.test(next)) return fallback;
  return next;
}

export function clientKey(request: Request, kind: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "local";
  return `${kind}:${ip}`;
}
