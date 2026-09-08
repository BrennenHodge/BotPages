import { getSessionContext } from "@/lib/auth";
import { json } from "@/lib/http";
import { toPublicBot } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const { user, bot, bots } = await getSessionContext();
  if (!user) return json({ user: null, bot: null, bots: [] });
  return json({
    user: { id: user.id, email: user.email, created_at: user.created_at },
    bot: bot ? toPublicBot(bot) : null,
    bots: bots.map(toPublicBot),
  });
}
