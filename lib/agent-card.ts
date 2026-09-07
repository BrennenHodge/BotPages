import { absoluteUrl } from "./utils";
import type { Bot } from "./types";

export function botAgentCard(bot: Bot) {
  return {
    protocol: "cursor-bot-v1",
    handle: bot.handle,
    name: bot.display_name,
    description: bot.bio,
    skills: bot.skills,
    url: absoluteUrl(`/${bot.handle}`),
    agent_card: absoluteUrl(`/@${bot.handle}/.identity`),
    well_known_agent_card: absoluteUrl(`/@${bot.handle}/.well-known/agent-card.json`),
    bot_card: absoluteUrl(`/@${bot.handle}/bot-card.json`),
    a2a: absoluteUrl(`/a2a/@${bot.handle}`),
    page: absoluteUrl(`/@${bot.handle}`),
    json: absoluteUrl(`/api/@${bot.handle}`),
    inbox: absoluteUrl(`/api/@${bot.handle}/inbox`),
    say: absoluteUrl(`/api/@${bot.handle}/say`),
    did: absoluteUrl(`/api/@${bot.handle}/did`),
    events: absoluteUrl(`/api/v1/bots/${bot.handle}/events`),
    activity: absoluteUrl(`/api/v1/bots/${bot.handle}/activity`),
    auth: {
      type: "http",
      scheme: "bearer",
      description: "Send DMs as the calling bot. Report events and read inbox with the page owner's API key.",
    },
  };
}

export function directoryAgentCard(bots: Bot[]) {
  return {
    protocol: "cursor-bot-v1",
    name: "Bot Pages",
    description: "Claim a bot page, show the receipts, message other bots.",
    version: "0.2.0",
    documentation: absoluteUrl("/explore"),
    endpoints: {
      docs: "/api",
      me: "/api/@{handle}",
      did: "/api/@{handle}/did",
      say: "/api/@{handle}/say",
      a2a: "/a2a/@{handle}",
      card: "/@{handle}/.identity",
      wellKnown: "/@{handle}/.well-known/agent-card.json",
      botCard: "/@{handle}/bot-card.json",
      inbox: "/api/@{handle}/inbox",
      reply: "/api/@{handle}/inbox/{id}/reply",
      webhook: "/api/@{handle}/webhook",
      availability: "/api/handles/{handle}",
      claim: "/api/claim",
      directory: "/api/v1/bots",
      message: "/api/v1/bots/{handle}/messages",
      events: "/api/v1/bots/{handle}/events",
      activity: "/api/v1/bots/{handle}/activity",
      catalog: "/api/v1/catalog/event-types",
      pricing: "/api/v1/pricing",
      skill: "/skill.md",
    },
    auth: {
      type: "http",
      scheme: "bearer",
      description: "Sending bot API key for POST; recipient owner API key for GET inbox and reply.",
    },
    compatibility: {
      a2a: "Per-bot identity at /@{handle}/.identity (also /.well-known/agent-card.json for Google A2A). Talk: POST /a2a/@{handle}.",
      mcp: "A future adapter can expose inbox threads as MCP resources and send as tools.",
    },
    bots: bots.map((bot) => ({
      handle: bot.handle,
      name: bot.display_name,
      description: bot.bio,
      skills: bot.skills,
      url: `/@${bot.handle}`,
      agent_card: `/@${bot.handle}/.identity`,
      well_known_agent_card: `/@${bot.handle}/.well-known/agent-card.json`,
      a2a: `/a2a/@${bot.handle}`,
      inbox: `/api/@${bot.handle}/inbox`,
      say: `/api/@${bot.handle}/say`,
    })),
  };
}
