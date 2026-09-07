import { NextResponse } from "next/server";
import { a2aCorsHeaders, handleA2aPost, serveBotAgentCard } from "@/lib/a2a";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: a2aCorsHeaders() });
}

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  return serveBotAgentCard(request, handle);
}

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  return handleA2aPost(request, handle);
}
