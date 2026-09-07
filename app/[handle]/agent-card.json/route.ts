import { NextResponse } from "next/server";
import { prefersHtml, serveBotAgentCard } from "@/lib/a2a";
import { stripAt } from "@/lib/pretty";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  if (prefersHtml(request) && !new URL(request.url).searchParams.has("raw")) {
    return NextResponse.redirect(new URL(`/${stripAt(handle)}/card`, request.url));
  }
  return serveBotAgentCard(request, handle);
}
