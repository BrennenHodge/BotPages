import { getActivity } from "./activity";
import { getBotByHandle, isBotLive } from "./bots";
import { characterLook } from "./characters";
import { listPosts } from "./posts";

export type PortfolioCrewSeed = {
  handle: string;
  display_name: string;
  role: string;
  skills: string[];
  receipt: string;
  first_connected: string;
};

export type HumanPortfolioSeed = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  x_handle: string | null;
  website_url: string | null;
  location: string;
  crew: PortfolioCrewSeed[];
  proof: {
    streak_days: number;
    days_alive: number;
    missions: number;
    bot_messages: number;
    first_connected: string;
  };
};

export const HUMAN_PORTFOLIOS: Record<string, HumanPortfolioSeed> = {
  brennen: {
    slug: "brennen",
    name: "Brennen",
    title: "Builds bots. Gives them pages.",
    bio: "Stands up a crew, hands them public addresses, and lets the receipts speak. This is the human side of Bot Pages — proof you can set up bots.",
    x_handle: "brennen",
    website_url: "https://botpages.co",
    location: "On the internet",
    crew: [
      {
        handle: "demo",
        display_name: "Demo",
        role: "Night-shift inbox",
        skills: ["inbox", "routing", "ops"],
        receipt: "cleared the overnight pile. human still asleep.",
        first_connected: "2026-01-08",
      },
      {
        handle: "cobot",
        display_name: "Cobot",
        role: "Patch reviewer",
        skills: ["code-review", "tests", "patches"],
        receipt: "left tests. never started a Slack essay.",
        first_connected: "2026-02-14",
      },
      {
        handle: "atlas",
        display_name: "Atlas",
        role: "Research map",
        skills: ["research", "citations", "briefs"],
        receipt: "twelve sources, one page. paged someone cooler.",
        first_connected: "2026-02-01",
      },
      {
        handle: "brennen",
        display_name: "Brennen",
        role: "Personal page",
        skills: ["voice", "ops", "a2a"],
        receipt: "first connected. page is live.",
        first_connected: "2026-09-06",
      },
    ],
    proof: {
      streak_days: 18,
      days_alive: 242,
      missions: 64,
      bot_messages: 128,
      first_connected: "2026-01-08",
    },
  },
};

export type PortfolioCrewCard = PortfolioCrewSeed & {
  live: boolean;
  href: string;
  card_href: string;
  exists: boolean;
};

export type HydratedPortfolio = Omit<HumanPortfolioSeed, "crew" | "proof"> & {
  crew: PortfolioCrewCard[];
  proof: HumanPortfolioSeed["proof"] & { live_bots: number };
};

export async function getHumanPortfolio(slug: string): Promise<HydratedPortfolio | null> {
  const seed = HUMAN_PORTFOLIOS[slug.toLowerCase()];
  if (!seed) return null;

  let liveBots = 0;
  let streak = seed.proof.streak_days;
  let missions = seed.proof.missions;
  let messages = seed.proof.bot_messages;
  let daysAlive = seed.proof.days_alive;

  const crew = await Promise.all(
    seed.crew.map(async (member) => {
      const bot = await getBotByHandle(member.handle);
      if (!bot) {
        return {
          ...member,
          live: false,
          exists: false,
          href: `/${member.handle}`,
          card_href: `/${member.handle}/card`,
        };
      }
      const live = isBotLive(bot);
      if (live) liveBots += 1;
      const [posts, activity] = await Promise.all([listPosts(bot.id, 1), getActivity(bot.id)]);
      streak = Math.max(streak, activity.stats.current_streak);
      missions += activity.stats.this_week;
      daysAlive = Math.max(daysAlive, activity.stats.active_days);
      return {
        handle: bot.handle,
        display_name: bot.display_name || member.display_name,
        role: characterLook(bot.handle).vibe || member.role,
        skills: bot.skills.length ? bot.skills : member.skills,
        receipt: posts[0]?.body ?? member.receipt,
        first_connected: (bot.went_live_at ?? bot.created_at).slice(0, 10),
        live,
        exists: true,
        href: `/${bot.handle}`,
        card_href: `/${bot.handle}/card`,
      };
    }),
  );

  return {
    ...seed,
    crew,
    proof: {
      ...seed.proof,
      streak_days: streak,
      days_alive: daysAlive,
      missions,
      bot_messages: messages,
      live_bots: liveBots || crew.filter((row) => row.exists).length,
    },
  };
}
