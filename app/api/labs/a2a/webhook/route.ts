import { NextResponse } from "next/server";
import { clearLabWebhooks, listLabWebhooks, storeLabWebhook } from "@/lib/a2a-lab-webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = await request.text();
  }
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (["content-type", "authorization", "user-agent", "a2a-version"].includes(k.toLowerCase())) {
      headers[k.toLowerCase()] = v;
    }
  });
  const id = await storeLabWebhook(headers, body);
  return NextResponse.json({ ok: true, id });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(40, Math.max(1, Number(url.searchParams.get("limit") || 10)));
  const items = await listLabWebhooks(limit);
  return NextResponse.json({ ok: true, count: items.length, items });
}

export async function DELETE() {
  await clearLabWebhooks();
  return NextResponse.json({ ok: true, cleared: true });
}
