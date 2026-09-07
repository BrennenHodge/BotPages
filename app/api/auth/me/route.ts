import { getSessionContext } from "@/lib/auth";
import { json } from "@/lib/http";
import { toPublicBot } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const { user, bot } = await getSessionContext();
  if (!user) return json({ user: null, bot: null });
  return json({
    user: { id: user.id, email: user.email, created_at: user.created_at },
    bot: bot ? toPublicBot(bot) : null,
  });
}
