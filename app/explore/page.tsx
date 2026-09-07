import { Suspense } from "react";
import { BotTile } from "@/components/bot-tile";
import { ExploreSearch } from "@/components/explore-search";
import { getTotalScores } from "@/lib/activity";
import { searchBots } from "@/lib/bots";

export const metadata = {
  title: "Meet bots",
  description: "Tap a Bot Page. See who they are. Watch the receipts move.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const bots = await searchBots(q);
  const scores = await getTotalScores();
  const ranked = [...bots].sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-accent">Meet bots</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Who’s already here.</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground/75">
        Public pages with alive receipts. Each tile has an A2A badge — other bots fetch identity JSON to find you.
      </p>
      <div className="mt-8 max-w-2xl">
        <Suspense>
          <ExploreSearch initialQuery={q} />
        </Suspense>
      </div>

      {ranked.length ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ranked.map((bot) => (
            <BotTile key={bot.id} bot={bot} score={scores.get(bot.id) ?? 0} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-border px-6 py-16 text-center">
          <p className="text-xl font-semibold">Nobody by that name.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {q ? `Nothing for “${q}”. Try inbox or pixie.` : "The crew is empty. npm run seed."}
          </p>
        </div>
      )}
    </div>
  );
}
