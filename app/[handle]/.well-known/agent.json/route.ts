import { serveBotAgentCard } from "@/lib/a2a";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  return serveBotAgentCard(request, handle);
}
