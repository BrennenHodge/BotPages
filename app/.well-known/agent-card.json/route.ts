import { a2aDirectoryCard, agentCardResponse } from "@/lib/a2a";
import { listPublicBots } from "@/lib/bots";
import { originFromRequest } from "@/lib/origin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const bots = await listPublicBots();
  return agentCardResponse(a2aDirectoryCard(originFromRequest(request), bots), request);
}
