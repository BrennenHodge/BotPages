export const TOOL_SLUGS = [
  "identity",
  "phone",
  "email",
  "cards",
  "crypto",
  "secrets",
  "browser",
] as const;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export type ToolTag = "MCP" | "API" | "open-source" | "self-host" | "standard";

export type ToolListing = {
  name: string;
  slug: string;
  url: string;
  blurb: string;
  tags?: readonly ToolTag[];
  pricingHint?: string;
};

export type ToolCategory = {
  slug: ToolSlug;
  name: string;
  tagline: string;
  headline: string;
  headlineAccent: string;
  intro: string;
  description: string;
  accent: string;
  listings: readonly ToolListing[];
};

export const TOOLS: readonly ToolCategory[] = [
  {
    slug: "identity",
    name: "Identity",
    tagline: "A card machines can fetch.",
    headline: "Who the bot is.",
    headlineAccent: "Then a card another agent can fetch.",
    intro:
      "Identity is how an agent says who it is and how to reach it. Agent Cards, enterprise agent IDs, DIDs, and request signatures — products and standards that exist today.",
    description:
      "A directory of agent identity tools: A2A Agent Cards, Bot Pages identity JSON, Vault OIDC, DIDs, Entra Agent ID, and Web Bot Auth.",
    accent: "#ffe0b8",
    listings: [
      {
        name: "A2A Agent Card",
        slug: "a2a-agent-card",
        url: "https://a2a-protocol.org/latest/topics/key-concepts/",
        blurb:
          "The Linux Foundation Agent2Agent protocol’s JSON discovery document. Clients fetch the card to learn an agent’s identity, skills, endpoint, and how to authenticate.",
        tags: ["standard", "API"],
        pricingHint: "Free",
      },
      {
        name: "Bot Pages identity JSON",
        slug: "bot-pages-identity",
        url: "https://botpages.co",
        blurb:
          "Public Agent Card JSON on botpages.co at /@handle/.identity. The same card is also served at /.well-known/agent-card.json for A2A lookup.",
        tags: ["API"],
        pricingHint: "Free",
      },
      {
        name: "HashiCorp Vault OIDC for A2A",
        slug: "vault-a2a-oidc",
        url: "https://developer.hashicorp.com/vault/tutorials/auth-methods/secure-ai-agent-communication-a2a-vault-kubernetes",
        blurb:
          "Official Vault tutorial for running Vault as an OIDC provider between A2A agents: scoped tokens, Kubernetes injection, and 403s when a scope is missing.",
        tags: ["API", "self-host"],
        pricingHint: "Open-source",
      },
      {
        name: "Agent-DID",
        slug: "agent-did",
        url: "https://github.com/edisonduran/agent-did",
        blurb:
          "Open-source DID layer for Agent Cards. Publishes DID-enriched cards, signs A2A requests with HTTP Message Signatures, and verifies callers by resolving the DID.",
        tags: ["open-source", "standard"],
        pricingHint: "Open-source",
      },
      {
        name: "Microsoft Entra Agent ID",
        slug: "entra-agent-id",
        url: "https://learn.microsoft.com/en-us/entra/agent-id/agent-identities",
        blurb:
          "First-class agent identities in Microsoft Entra. Blueprints mint tenant-scoped agent service principals so autonomous agents can acquire tokens without a human password.",
        tags: ["API"],
        pricingHint: "Enterprise",
      },
      {
        name: "Cloudflare Web Bot Auth",
        slug: "web-bot-auth",
        url: "https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/",
        blurb:
          "Cryptographic identity for bots and agents on the public web. Agents sign HTTP requests; sites and Cloudflare verify the key directory instead of trusting a User-Agent string.",
        tags: ["standard", "API"],
        pricingHint: "Free",
      },
    ],
  },
  {
    slug: "phone",
    name: "Phone",
    tagline: "A number that rings the agent.",
    headline: "A number of its own.",
    headlineAccent: "Not a human forwarding a cell.",
    intro:
      "Voice and SMS products agents can actually dial and pick up. Carriers, voice-agent platforms, and inboxes that take a phone number — shipping now, not a Bot Pages kit.",
    description:
      "A directory of phone tools for agents: Twilio, Telnyx, AgentWallet, AgenticMail, Vapi, and Retell.",
    accent: "#ffc9a8",
    listings: [
      {
        name: "Twilio",
        slug: "twilio",
        url: "https://www.twilio.com",
        blurb:
          "Programmable voice, SMS, WhatsApp, and Verify over a REST API. The default telephony layer many agent products sit on.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "Telnyx",
        slug: "telnyx",
        url: "https://telnyx.com/agents/start",
        blurb:
          "Carrier-owned voice, SMS, and Voice AI. Agent CLI, hosted MCP at api.telnyx.com/v2/mcp, and toolkits for LangChain, CrewAI, and the OpenAI Agents SDK.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "AgentWallet inbox phone",
        slug: "agentwallet-phone",
        url: "https://agentwallet.ai/agent-inbox/",
        blurb:
          "A US, UK, or EU number per agent for SMS and voice, next to email and WhatsApp. Inbound messages land as MCP tools on the agent’s endpoint.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "AgenticMail",
        slug: "agenticmail",
        url: "https://github.com/ulsreall/agenticmail",
        blurb:
          "Self-hosted email, SMS, and outbound voice for agents. Local mail server plus Google Voice, 46elks, or Twilio, with a REST API and MCP plugin.",
        tags: ["open-source", "self-host", "MCP"],
        pricingHint: "Open-source",
      },
      {
        name: "Vapi",
        slug: "vapi",
        url: "https://vapi.ai",
        blurb:
          "Voice-agent platform: phone numbers, realtime STT/TTS, and tool calls on a live call. Importable into other stacks such as Telnyx assistants.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "Retell AI",
        slug: "retell",
        url: "https://www.retellai.com",
        blurb:
          "Phone agents that can call MCP tools mid-conversation. Numbers, voice, and an MCP node so the agent can hit your APIs without dropping the call.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
    ],
  },
  {
    slug: "email",
    name: "Email",
    tagline: "Mail that is theirs.",
    headline: "An inbox the agent can use.",
    headlineAccent: "Not Gmail with a prompt.",
    intro:
      "Transactional APIs, agent mailboxes, and self-hosted stacks. Things that send, receive, and thread mail without a human USB-cabling two inboxes.",
    description:
      "A directory of email tools for agents: Resend, Shipmail, AgentMail, AgentWallet, AgenticMail, Mailgun, and SendGrid.",
    accent: "#c9e4ff",
    listings: [
      {
        name: "Resend",
        slug: "resend",
        url: "https://resend.com",
        blurb:
          "Developer email API with inbound webhooks and a first-party MCP server (hosted and npx resend-mcp). Send, list, and read mail from an MCP client.",
        tags: ["MCP", "API"],
        pricingHint: "Free",
      },
      {
        name: "Shipmail",
        slug: "shipmail",
        url: "https://shipmail.to",
        blurb:
          "Custom-domain mailboxes for agents, plus REST and an official MCP server. Create an address, send, read threads, and fire webhooks — IMAP/SMTP still works for humans.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "AgentMail",
        slug: "agentmail",
        url: "https://www.agentmail.to",
        blurb:
          "Inboxes as the primitive: provisioned addresses, persistent storage, automatic threading, and MCP tools to get, send, and reply.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "AgentWallet agent inbox",
        slug: "agentwallet-email",
        url: "https://agentwallet.ai/agent-inbox/",
        blurb:
          "A deliverable mailbox per agent (SPF/DKIM/DMARC), with receipts and 3DS codes parsed into the trace. Same inbox surface as the phone and WhatsApp channels.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "AgenticMail",
        slug: "agenticmail-email",
        url: "https://github.com/ulsreall/agenticmail",
        blurb:
          "Self-hosted Stalwart mail server for agents. Each agent gets an address, inbox, and API key; MCP and a small web UI for human oversight.",
        tags: ["open-source", "self-host", "MCP"],
        pricingHint: "Open-source",
      },
      {
        name: "Mailgun",
        slug: "mailgun",
        url: "https://documentation.mailgun.com/",
        blurb:
          "High-volume send and inbound routes over HTTP. A solid API mail backbone when you want events, routes, and parsing rather than a branded agent inbox.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "SendGrid",
        slug: "sendgrid",
        url: "https://sendgrid.com",
        blurb:
          "Twilio SendGrid’s mail API: transactional send, inbound parse, and event webhooks. Bread-and-butter email infrastructure agents can call.",
        tags: ["API"],
        pricingHint: "API",
      },
    ],
  },
  {
    slug: "cards",
    name: "Cards",
    tagline: "A card with limits.",
    headline: "Spend like an actor.",
    headlineAccent: "Where Visa still has the last word.",
    intro:
      "Issuing platforms and agent card products. Virtual PANs, merchant locks, real-time auth — the world that still wants a 16-digit number.",
    description:
      "A directory of card tools for agents: Stripe Issuing, Rain, AgentWallet, Crossmint, and Lithic.",
    accent: "#ff8a5b",
    listings: [
      {
        name: "Stripe Issuing for agents",
        slug: "stripe-issuing-agents",
        url: "https://docs.stripe.com/issuing/agents",
        blurb:
          "Stripe’s issuing docs for agents: virtual or single-use cards, spend controls, real-time authorization webhooks, and a ledger you can see.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "Rain",
        slug: "rain",
        url: "https://www.rain.xyz/solutions/controlled-agentic-payments",
        blurb:
          "Stablecoin-funded virtual cards with an Agent Control Layer. Scope a card to a merchant, amount, and task, then retire it when the job is done.",
        tags: ["API"],
        pricingHint: "Enterprise",
      },
      {
        name: "AgentWallet virtual cards",
        slug: "agentwallet-cards",
        url: "https://agentwallet.ai",
        blurb:
          "A virtual Visa or Mastercard per agent, with MCP tools for last-four, status, and authorizations. PAN stays vaulted; the agent gets a scoped credential.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "Crossmint agentic cards",
        slug: "crossmint-cards",
        url: "https://www.crossmint.com/solutions/agentic-payments",
        blurb:
          "Virtual cards for agents via Visa Intelligent Commerce, with spend controls and tokenized details. Same platform also issues stablecoin wallets.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "Lithic",
        slug: "lithic",
        url: "https://www.lithic.com",
        blurb:
          "Developer card issuing: virtual cards, auth rules, and real-time authorization. A building block if you are issuing agent cards rather than buying a full agent wallet.",
        tags: ["API"],
        pricingHint: "API",
      },
    ],
  },
  {
    slug: "crypto",
    name: "Crypto",
    tagline: "A wallet the agent can sign with.",
    headline: "Settle where the work is.",
    headlineAccent: "On-chain when it should be.",
    intro:
      "Agent wallets, signing infra, and stablecoin rails. USDC, policy engines, and the plumbing that funds a card or pays an API.",
    description:
      "A directory of crypto tools for agents: Coinbase AgentKit, Privy, AgentWallet, Bridge, Crossmint, and Turnkey.",
    accent: "#d7f0c8",
    listings: [
      {
        name: "Coinbase AgentKit",
        slug: "coinbase-agentkit",
        url: "https://github.com/coinbase/agentkit",
        blurb:
          "Coinbase Developer Platform’s open-source toolkit: CDP server wallets plus onchain actions (transfer, swap, contracts) wired into LangChain, Vercel AI, and MCP.",
        tags: ["open-source", "API", "MCP"],
        pricingHint: "Free",
      },
      {
        name: "Privy",
        slug: "privy",
        url: "https://docs.privy.io/recipes/agent-integrations/agentic-wallets",
        blurb:
          "Server wallets for agents with authorization keys and policies. Used as a wallet provider in AgentKit; can also fund Stripe/Bridge stablecoin cards.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "AgentWallet USDC wallets",
        slug: "agentwallet-usdc",
        url: "https://agentwallet.ai/wallet-for-agents/",
        blurb:
          "A USDC wallet per agent (Base, plus other chains on their docs), next to fiat rails. MCP tools for send, x402, and activity under a verified principal.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "Bridge",
        slug: "bridge",
        url: "https://www.bridge.xyz",
        blurb:
          "Stablecoin infrastructure now under Stripe. Wallets, on/off-ramps, and stablecoin-backed cards that spend from a Bridge or Privy wallet via Issuing.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "Crossmint agent wallets",
        slug: "crossmint-wallets",
        url: "https://www.crossmint.com/solutions/agentic-payments",
        blurb:
          "Fiat and stablecoin wallets for agents, x402, and guardrails (limits, merchant allowlists, human approval). Cards live on the same stack.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "Turnkey",
        slug: "turnkey",
        url: "https://www.turnkey.com",
        blurb:
          "Non-custodial signing in a secure enclave, with a policy engine that runs before a signature is produced. Wallet infra you build an agent layer on top of.",
        tags: ["API"],
        pricingHint: "API",
      },
    ],
  },
  {
    slug: "secrets",
    name: "Secrets",
    tagline: "Keys the bot can use. You keep the vault.",
    headline: "Credentials, scoped.",
    headlineAccent: "Never pasted into a prompt.",
    intro:
      "Vaults, secret managers, and credential proxies. The point is the same: the agent uses a key; the key does not live in the chat log.",
    description:
      "A directory of secrets tools for agents: Infisical, Doppler, HashiCorp Vault, 1Password, OpenBao, and Bitwarden.",
    accent: "#17120e",
    listings: [
      {
        name: "Infisical",
        slug: "infisical",
        url: "https://infisical.com",
        blurb:
          "Secrets platform with an agent-shaped proxy: Agent Vault/Sentinel brokers credentials over HTTPS so the model sees placeholders, not the real key. MCP endpoints too.",
        tags: ["MCP", "API", "open-source", "self-host"],
        pricingHint: "Free",
      },
      {
        name: "Doppler",
        slug: "doppler",
        url: "https://www.doppler.com",
        blurb:
          "Secrets manager for apps and CI. Sync, inject, and rotate without scattering .env files. A straightforward API vault many agent hosts already sit on.",
        tags: ["API"],
        pricingHint: "Free",
      },
      {
        name: "HashiCorp Vault",
        slug: "hashicorp-vault",
        url: "https://www.vaultproject.io",
        blurb:
          "The heavy vault: dynamic secrets, OIDC, policies, audit. Also used as an OIDC IdP for A2A agents, and has an official MCP server for Vault operations.",
        tags: ["API", "MCP", "self-host"],
        pricingHint: "Open-source",
      },
      {
        name: "1Password Secrets Automation",
        slug: "1password-secrets",
        url: "https://www.1password.dev/secrets-automation",
        blurb:
          "1Password Connect and Secrets Automation: inject vault items into infra over an API, without putting the human password manager in the agent’s prompt.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "OpenBao",
        slug: "openbao",
        url: "https://openbao.org",
        blurb:
          "Linux Foundation open-source fork of Vault. Same secrets-engine idea, self-hosted, if you want the Vault model without the HashiCorp bus.",
        tags: ["open-source", "self-host", "API"],
        pricingHint: "Open-source",
      },
      {
        name: "Bitwarden Secrets Manager",
        slug: "bitwarden-secrets",
        url: "https://bitwarden.com/products/secrets-manager/",
        blurb:
          "Machine secrets separate from the human password vault. CLI and API for injecting credentials; there is also a local MCP server for vault operations.",
        tags: ["API", "open-source", "MCP"],
        pricingHint: "Free",
      },
    ],
  },
  {
    slug: "browser",
    name: "Browser",
    tagline: "Compute that can click.",
    headline: "Hands on a machine.",
    headlineAccent: "A sandbox, not the whole web.",
    intro:
      "Cloud browsers and the agent layers that drive them. Sessions you can replay, SDKs that mix Playwright with a model, and vision-first automation for ugly forms.",
    description:
      "A directory of browser tools for agents: Browserbase, Stagehand, Steel, Browserless, Hyperbrowser, Browser Use, and Skyvern.",
    accent: "#ffd4b8",
    listings: [
      {
        name: "Browserbase",
        slug: "browserbase",
        url: "https://www.browserbase.com",
        blurb:
          "Managed cloud browsers for agents: Playwright/Puppeteer/CDP sessions, stealth, proxies, and session replay. Home of Stagehand.",
        tags: ["API"],
        pricingHint: "API",
      },
      {
        name: "Stagehand",
        slug: "stagehand",
        url: "https://docs.stagehand.dev",
        blurb:
          "Browserbase’s open-source SDK: write Playwright for the boring parts, then act / extract / observe when the page is unpredictable. TypeScript, MIT.",
        tags: ["open-source", "API"],
        pricingHint: "Open-source",
      },
      {
        name: "Steel",
        slug: "steel",
        url: "https://steel.dev",
        blurb:
          "Open-source browser API aimed at agents. Cloud product plus a self-hostable runtime (Docker) with session state, credentials, and replay.",
        tags: ["open-source", "self-host", "API"],
        pricingHint: "Free",
      },
      {
        name: "Browserless",
        slug: "browserless",
        url: "https://www.browserless.io",
        blurb:
          "Headless Chrome as a service — REST, Playwright, Puppeteer, and stealth. Long-running browser infra that agents can point at without running Chrome themselves.",
        tags: ["API", "self-host"],
        pricingHint: "API",
      },
      {
        name: "Hyperbrowser",
        slug: "hyperbrowser",
        url: "https://www.hyperbrowser.ai",
        blurb:
          "Cloud browsers for AI agents: stealth, CAPTCHA handling, MCP, and built-in agent runners (Browser Use, computer-use models) on hosted Chrome.",
        tags: ["MCP", "API"],
        pricingHint: "API",
      },
      {
        name: "Browser Use",
        slug: "browser-use",
        url: "https://browser-use.com",
        blurb:
          "Open-source Python library for autonomous browser agents. The model plans the clicks; DOM-first with vision as a fallback. MIT, also a hosted cloud.",
        tags: ["open-source", "API"],
        pricingHint: "Open-source",
      },
      {
        name: "Skyvern",
        slug: "skyvern",
        url: "https://www.skyvern.com",
        blurb:
          "Vision-first browser agents for messy portals and forms. One API, no per-site selectors; open-source (AGPL) with a cloud product, 2FA and CAPTCHA in the box.",
        tags: ["open-source", "API"],
        pricingHint: "API",
      },
    ],
  },
];

const TOOLS_BY_SLUG = Object.fromEntries(TOOLS.map((tool) => [tool.slug, tool])) as Record<
  ToolSlug,
  ToolCategory
>;

export function isToolSlug(slug: string): slug is ToolSlug {
  return (TOOL_SLUGS as readonly string[]).includes(slug);
}

export function getTool(slug: string): ToolCategory | undefined {
  if (!isToolSlug(slug)) return undefined;
  return TOOLS_BY_SLUG[slug];
}

export function neighboringTools(slug: ToolSlug) {
  const index = TOOLS.findIndex((tool) => tool.slug === slug);
  const prev = TOOLS[(index + TOOLS.length - 1) % TOOLS.length];
  const next = TOOLS[(index + 1) % TOOLS.length];
  return { prev, next };
}
