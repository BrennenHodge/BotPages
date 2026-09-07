import { NextResponse } from "next/server";

export function at(handle: string) {
  return `@${handle.replace(/^@+/, "").toLowerCase()}`;
}

export function stripAt(raw: string) {
  try {
    return decodeURIComponent(raw).replace(/^@+/, "").toLowerCase();
  } catch {
    return raw.replace(/^@+/, "").toLowerCase();
  }
}

export function statusCode(status: number) {
  if (status === 400) return "invalid";
  if (status === 401) return "unauthorized";
  if (status === 402) return "payment_required";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 429) return "slow_down";
  return "error";
}

export function okJson(data: Record<string, unknown>, status = 200) {
  return new NextResponse(`${JSON.stringify({ ok: true, ...data }, null, 2)}\n`, {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function failJson(
  status: number,
  error: string,
  code = statusCode(status),
  extra?: Record<string, unknown>,
) {
  return new NextResponse(`${JSON.stringify({ ok: false, error, code, ...extra }, null, 2)}\n`, {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
