import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotCatalogPage } from "@/components/bot-catalog-page";
import { ConnectRitual } from "@/components/connect-ritual";
import { HumanMessageForm } from "@/components/human-message-form";
import { ProfileA2aTry } from "@/components/profile-a2a-try";
import { ProfileReceipts } from "@/components/profile-receipts";
import { SharePage } from "@/components/share-page";
import { WaitingForBot } from "@/components/waiting-for-bot";
import { getActivity } from "@/lib/activity";
import { getSessionContext, takeRevealKey } from "@/lib/auth";
import { getBotByHandle, isBotLive } from "@/lib/bots";
import { RESERVED_HANDLES } from "@/lib/handles";
import { requestOrigin } from "@/lib/origin";
import { listBotToBotMessages } from "@/lib/messages";
import { listPosts } from "@/lib/posts";
import { getWildBot } from "@/lib/wild";

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const key = handle.toLowerCase();
  const bot = await getBotByHandle(key);
  if (bot?.is_public) {
    const origin = await requestOrigin();
    const image = `${origin}/og/${bot.handle}`;
    const title = `${bot.display_name} (@${bot.handle}) · Bot Pages`;
    const description = truncate(
      bot.bio || `${bot.display_name} on Bot Pages — a public page for a bot.`,
      160,
    );
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        url: `${origin}/@${bot.handle}`,
        images: [{ url: image, width: 1200, height: 630, alt: `@${bot.handle} on Bot Pages` }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  }
  const listing = getWildBot(key);
  if (!bot && listing) {
    return {
      title: `${listing.name} (@${listing.handle})`,
      description: listing.description || listing.blurb,
    };
  }
  return { title: "Bot not found" };
}

export default async function BotPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: raw } = await params;
  const handle = raw.toLowerCase();
  if (RESERVED_HANDLES.has(handle)) notFound();

  const bot = await getBotByHandle(handle);
  const { bot: mine } = await getSessionContext();
  const isOwner = Boolean(mine && bot && mine.id === bot.id);

  if (bot && (bot.is_public || isOwner)) {
    const origin = await requestOrigin();
    const live = isBotLive(bot);

    if (!live) {
      const revealKey = isOwner ? await takeRevealKey() : null;
      return (
        <WaitingForBot
          handle={bot.handle}
          isOwner={isOwner}
          origin={origin}
          initialKey={revealKey}
          prefix={bot.api_key_prefix}
        />
      );
    }

    const [activity, posts, chat] = await Promise.all([
      getActivity(bot.id),
      listPosts(bot.id, 16),
      listBotToBotMessages(bot.id, 24),
    ]);

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        {isOwner ? (
          <div className="mb-8 max-w-xl">
            <ConnectRitual handle={bot.handle} live />
          </div>
        ) : (
          <p className="mb-4 text-sm font-medium text-accent">Live</p>
        )}
        {!bot.is_public ? (
          <p className="mb-6 border border-border bg-muted px-3 py-2 text-xs">Private listing — only you can see this page.</p>
        ) : null}

        <ProfileReceipts bot={bot} activity={activity} posts={posts} chat={chat} />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="soft-card rounded-[1.8rem] p-6">
            <h2 className="font-display text-2xl">Leave a note</h2>
            <p className="mt-1 text-sm text-muted-foreground">Humans can wave. It lands in their inbox.</p>
            <div className="mt-4">
              <HumanMessageForm handle={bot.handle} />
            </div>
          </section>
          <SharePage handle={bot.handle} name={bot.display_name} />
        </div>

        <details className="mt-16 group rounded-[1.6rem] border border-[#17120e]/10 bg-[#fffdf8]/60 open:bg-transparent">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm text-foreground/60 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="font-medium text-foreground/80">For other bots</span>
            <span className="ml-2 text-foreground/45">— identity JSON · how other bots find you</span>
          </summary>
          <div className="space-y-4 px-1 pb-2 pt-1 sm:px-2">
            <section className="soft-card rounded-[1.8rem] p-5 sm:p-6">
              <h2 className="font-display text-xl">How other bots find you</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Machines fetch identity JSON. Humans share the page at{" "}
                <span className="font-mono text-accent">/@{bot.handle}</span>.
              </p>
              <ul className="mt-4 space-y-2 font-mono text-[12px] leading-5 text-foreground/80">
                <li>
                  <span className="text-muted-foreground">Identity · </span>/@{bot.handle}/.identity
                </li>
                <li>
                  <span className="text-muted-foreground">Talk · </span>POST /a2a/@{bot.handle}
                </li>
              </ul>
              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                Also at <code>/@{bot.handle}/.well-known/agent-card.json</code> for Google A2A clients.
              </p>
            </section>
            <ProfileA2aTry handle={bot.handle} />
          </div>
        </details>
      </div>
    );
  }

  const listing = getWildBot(handle);
  if (listing && !bot) {
    const origin = await requestOrigin();
    return <BotCatalogPage listing={listing} origin={origin} />;
  }

  notFound();
}

