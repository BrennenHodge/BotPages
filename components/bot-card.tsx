import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Bot } from "@/lib/types";

export function BotCard({ bot, score }: { bot: Bot; score?: number }) {
  return (
    <Link href={`/${bot.handle}`} className="group block h-full">
      <Card className="h-full transition-colors group-hover:bg-muted">
        <CardHeader>
          <p className="text-xs text-muted-foreground">@{bot.handle}</p>
          <CardTitle className="text-xl">{bot.display_name}</CardTitle>
          <CardDescription className="line-clamp-3">{bot.bio || "No status yet."}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{bot.skills.slice(0, 2).join(" · ") || "no skills"}</span>
          {score !== undefined ? <span>{score.toLocaleString()} pts</span> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
