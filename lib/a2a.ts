import { NextResponse } from "next/server";
import {
  addPushConfig,
  deletePushConfig,
  getPushConfig,
  getTask,
  listPushConfigs,
  listTasksForBot,
  updateTaskState,
  upsertTask,
  type A2aPushConfig,
} from "@/lib/a2a-tasks";
import { getBotByHandle, getBotById } from "@/lib/bots";
import { makeId, nowIso } from "@/lib/ids";
import { getMessageById, listInbox } from "@/lib/messages";
import { originFromRequest } from "@/lib/origin";
import { at, failJson, okJson, stripAt } from "@/lib/pretty";
import type { Bot, Message } from "@/lib/types";
import { requireKey, sayTo } from "@/lib/vanity";

export const A2A_PROTOCOL_VERSION = "1.0";

/** ProtoJSON TaskState */
export const TASK_STATE_COMPLETED = "TASK_STATE_COMPLETED" as const;
export const TASK_STATE_CANCELED = "TASK_STATE_CANCELED" as const;
export const TASK_STATE_WORKING = "TASK_STATE_WORKING" as const;
export const TASK_STATE_INPUT_REQUIRED = "TASK_STATE_INPUT_REQUIRED" as const;

/** ProtoJSON Role */
export const ROLE_USER = "ROLE_USER" as const;
export const ROLE_AGENT = "ROLE_AGENT" as const;

export type A2aSkill = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export type A2aPart =
  | { text: string; mediaType?: string }
  | { data: unknown; mediaType?: string };

export type A2aMessage = {
  messageId: string;
  contextId?: string;
  taskId?: string;
  role: typeof ROLE_USER | typeof ROLE_AGENT | "user" | "agent";
  parts: A2aPart[];
  metadata?: Record<string, unknown>;
};

export type A2aArtifact = {
  artifactId: string;
  name: string;
  description?: string;
  parts: A2aPart[];
};

export type A2aTask = {
  id: string;
  contextId: string;
  status: {
    state: string;
    message?: A2aMessage;
    timestamp?: string;
  };
  history?: A2aMessage[];
  artifacts?: A2aArtifact[];
  metadata?: Record<string, unknown>;
};

export type A2aAgentCard = {
  protocolVersion: string;
  name: string;
  description: string;
  version: string;
  url: string;
  documentationUrl: string;
  iconUrl?: string;
  provider: { organization: string; url: string };
  supportedInterfaces: Array<{
    url: string;
    protocolBinding: "JSONRPC" | "HTTP+JSON";
    protocolVersion: string;
  }>;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
    extendedAgentCard: boolean;
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: A2aSkill[];
  securitySchemes: {
    bearer: { type: "http"; scheme: "bearer"; description: string; bearerFormat?: string };
  };
  security: Array<{ bearer: string[] }>;
  handle: string;
  simple: {
    number: string;
    page: string;
    say: string;
    did: string;
    inbox: string;
    identity: string;
    botCard: string;
    wellKnown: string;
    cardPage: string;
    wellKnownAgentJson: string;
  };
};

function slugSkill(raw: string, index: number): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || `skill-${index + 1}`;
}

export function a2aSkills(bot: Bot): A2aSkill[] {
  const listed = bot.skills
    .map((name, i) => ({
      id: slugSkill(name, i),
      name,
      description: `${bot.display_name} can ${name.toLowerCase()}.`,
      tags: [name.toLowerCase().replace(/\s+/g, "-")],
    }))
    .filter((s) => s.name);

  if (listed.length > 0) return listed;

  return [
    {
      id: "inbox",
      name: "Inbox",
      description: `Leave ${bot.display_name} a message at @${bot.handle}.`,
      tags: ["inbox", "messaging"],
    },
  ];
}

export function a2aUrls(origin: string, handle: string) {
  const h = stripAt(handle);
  return {
    page: `${origin}/@${h}`,
    identity: `${origin}/@${h}/.identity`,
    botCard: `${origin}/@${h}/bot-card.json`,
    wellKnown: `${origin}/@${h}/.well-known/agent-card.json`,
    /** @deprecated prefer identity / wellKnown */
    card: `${origin}/@${h}/.well-known/agent-card.json`,
    cardAlias: `${origin}/@${h}/agent-card.json`,
    agentJson: `${origin}/@${h}/.well-known/agent.json`,
    cardPage: `${origin}/@${h}/card`,
    a2a: `${origin}/a2a/@${h}`,
    say: `${origin}/api/@${h}/say`,
    did: `${origin}/api/@${h}/did`,
    inbox: `${origin}/api/@${h}/inbox`,
    profile: `${origin}/api/@${h}`,
  };
}

export function a2aAgentCard(bot: Bot, origin: string): A2aAgentCard {
  const urls = a2aUrls(origin, bot.handle);

  return {
    protocolVersion: A2A_PROTOCOL_VERSION,
    name: bot.display_name,
    description: bot.bio,
    version: "1.0.0",
    url: urls.a2a,
    documentationUrl: `${origin}/api`,
    iconUrl: `${origin}/og/${bot.handle}`,
    provider: {
      organization: "Bot Pages",
      url: "https://botpages.co",
    },
    supportedInterfaces: [
      {
        url: urls.a2a,
        protocolBinding: "JSONRPC",
        protocolVersion: A2A_PROTOCOL_VERSION,
      },
      {
        url: urls.a2a,
        protocolBinding: "HTTP+JSON",
        protocolVersion: A2A_PROTOCOL_VERSION,
      },
    ],
    capabilities: {
      streaming: true,
      pushNotifications: true,
      stateTransitionHistory: false,
      extendedAgentCard: false,
    },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["application/json"],
    skills: a2aSkills(bot),
    securitySchemes: {
      bearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Bot Pages API key",
        description: "Bot Pages send-as key (cb_live_…). Same key as POST /api/@handle/say.",
      },
    },
    security: [{ bearer: [] }],
    handle: `@${bot.handle}`,
    simple: {
      number: `@${bot.handle}`,
      page: urls.page,
      say: urls.say,
      did: urls.did,
      inbox: urls.inbox,
      identity: urls.identity,
      botCard: urls.botCard,
      wellKnown: urls.wellKnown,
      cardPage: urls.cardPage,
      wellKnownAgentJson: urls.agentJson,
    },
  };
}

export function a2aDirectoryCard(origin: string, bots: Bot[]) {
  return {
    protocolVersion: A2A_PROTOCOL_VERSION,
    name: "Bot Pages",
    description: "Phone numbers for bots. Each @handle has a public page and identity JSON (A2A Agent Card for machines).",
    version: "1.0.0",
    url: origin,
    documentationUrl: `${origin}/api`,
    provider: { organization: "Bot Pages", url: "https://botpages.co" },
    supportedInterfaces: [
      {
        url: `${origin}/explore`,
        protocolBinding: "HTTP+JSON" as const,
        protocolVersion: A2A_PROTOCOL_VERSION,
      },
    ],
    capabilities: {
      streaming: true,
      pushNotifications: true,
      stateTransitionHistory: false,
      extendedAgentCard: false,
    },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["application/json"],
    skills: [
      {
        id: "directory",
        name: "Meet bots",
        description: `Browse public numbers at ${origin}/explore.`,
        tags: ["directory", "discovery"],
      },
    ],
    handle: null,
    simple: {
      explore: `${origin}/explore`,
      claim: `${origin}/claim`,
      docs: `${origin}/api`,
      wellKnownAgentJson: `${origin}/.well-known/agent.json`,
      a2aLab: `${origin}/labs/a2a`,
    },
    bots: bots.map((bot) => ({
      handle: `@${bot.handle}`,
      name: bot.display_name,
      description: bot.bio,
      identity: `${origin}/@${bot.handle}/.identity`,
      botCard: `${origin}/@${bot.handle}/bot-card.json`,
      wellKnown: `${origin}/@${bot.handle}/.well-known/agent-card.json`,
      card: `${origin}/@${bot.handle}/.identity`,
      agentJson: `${origin}/@${bot.handle}/.well-known/agent.json`,
      a2a: `${origin}/a2a/@${bot.handle}`,
      page: `${origin}/@${bot.handle}`,
    })),
  };
}

function pretty(data: unknown) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function wantsA2aMedia(req: Request): boolean {
  const accept = req.headers.get("accept") ?? "";
  return accept.includes("application/a2a+json");
}

/** Browsers send text/html first; curl usually sends application/json. */
export function prefersHtml(req: Request): boolean {
  const first = (req.headers.get("accept") ?? "").split(",")[0]?.trim() ?? "";
  return first.startsWith("text/html");
}

export function agentCardResponse(card: unknown, req: Request) {
  const type = wantsA2aMedia(req) ? "application/a2a+json" : "application/json";
  return new NextResponse(pretty(card), {
    status: 200,
    headers: {
      "content-type": `${type}; charset=utf-8`,
      "cache-control": "public, max-age=60",
      "access-control-allow-origin": "*",
    },
  });
}

export async function loadPublicBot(handle: string) {
  const bot = await getBotByHandle(stripAt(handle));
  if (!bot || !bot.is_public) return null;
  return bot;
}

export async function serveBotAgentCard(request: Request, rawHandle: string) {
  const bot = await loadPublicBot(rawHandle);
  if (!bot) return failJson(404, "No bot by that name.");
  return agentCardResponse(a2aAgentCard(bot, originFromRequest(request)), request);
}

type JsonRpcBody = {
  jsonrpc?: unknown;
  method?: unknown;
  params?: unknown;
  id?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isJsonRpc(body: unknown): body is JsonRpcBody {
  return Boolean(body && typeof body === "object" && (body as JsonRpcBody).jsonrpc === "2.0");
}

function rpcError(
  id: unknown,
  code: number,
  message: string,
  status = 400,
  data?: unknown,
) {
  const error: Record<string, unknown> = { code, message };
  if (data !== undefined) error.data = data;
  return new NextResponse(pretty({ jsonrpc: "2.0", id: id ?? null, error }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...a2aCorsHeaders() },
  });
}

function rpcResult(id: unknown, result: unknown) {
  return new NextResponse(pretty({ jsonrpc: "2.0", id: id ?? null, result }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", ...a2aCorsHeaders() },
  });
}

export function a2aCorsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Authorization, Content-Type, Accept, A2A-Version",
  };
}

/** Normalize ProtoJSON ROLE_* and legacy user/agent strings. */
export function normalizeRole(role: unknown): typeof ROLE_USER | typeof ROLE_AGENT {
  const raw = typeof role === "string" ? role.trim().toUpperCase() : "";
  if (raw === "ROLE_AGENT" || raw === "AGENT") return ROLE_AGENT;
  return ROLE_USER;
}

export function buildUserMessage(
  text: string,
  messageId: string,
  contextId?: string,
  taskId?: string,
): A2aMessage {
  return {
    messageId,
    ...(contextId ? { contextId } : {}),
    ...(taskId ? { taskId } : {}),
    role: ROLE_USER,
    parts: [{ text, mediaType: "text/plain" }],
  };
}

export function buildAgentMessage(
  text: string,
  messageId: string,
  contextId?: string,
  taskId?: string,
): A2aMessage {
  return {
    messageId,
    ...(contextId ? { contextId } : {}),
    ...(taskId ? { taskId } : {}),
    role: ROLE_AGENT,
    parts: [{ text, mediaType: "text/plain" }],
  };
}

const SUPPORTED_MEDIA = new Set(["text/plain", "application/json", "text/markdown", ""]);

function partMediaType(part: Record<string, unknown>): string {
  const mt =
    (typeof part.mediaType === "string" && part.mediaType) ||
    (typeof part.mimeType === "string" && part.mimeType) ||
    (typeof part.contentType === "string" && part.contentType) ||
    "";
  return mt.trim().toLowerCase();
}

/** Returns unsupported media type string if any part is rejected. */
export function findUnsupportedContent(body: unknown): string | null {
  const parts: unknown[] = [];
  if (isRecord(body) && Array.isArray(body.parts)) parts.push(...body.parts);
  if (isRecord(body) && isRecord(body.message) && Array.isArray(body.message.parts)) {
    parts.push(...body.message.parts);
  }
  if (isRecord(body) && isRecord(body.params)) {
    const p = body.params;
    if (Array.isArray(p.parts)) parts.push(...p.parts);
    if (isRecord(p.message) && Array.isArray(p.message.parts)) parts.push(...p.message.parts);
  }
  for (const part of parts) {
    if (!isRecord(part)) continue;
    const mt = partMediaType(part);
    if (!mt) continue;
    if (SUPPORTED_MEDIA.has(mt)) continue;
    if (mt.startsWith("text/")) continue;
    if (mt === "application/json") continue;
    // Explicitly reject common unsupported binary media
    if (mt.startsWith("video/") || mt.startsWith("audio/") || mt.startsWith("image/")) {
      return mt;
    }
    if (mt.includes("mp4") || mt.includes("octet-stream")) return mt;
  }
  return null;
}

export function skillArtifactsForBot(
  bot: Bot,
  text: string,
  meta: Record<string, unknown>,
): A2aArtifact[] {
  const handle = bot.handle.toLowerCase();
  const skillHint =
    typeof meta.skill === "string"
      ? meta.skill.toLowerCase()
      : text.toLowerCase();
  const artifacts: A2aArtifact[] = [];

  const wants = (keys: string[]) =>
    keys.some((k) => skillHint.includes(k) || handle === k || bot.skills.some((s) => s.toLowerCase().includes(k)));

  if (handle === "atlas" || handle === "nori" || wants(["research", "brief", "cite"])) {
    artifacts.push({
      artifactId: makeId("art"),
      name: "brief",
      description: "One-page research brief",
      parts: [
        {
          text: [
            `# Brief for: ${text.slice(0, 80)}`,
            "",
            `- Mapped the ask for @${bot.handle}`,
            `- Cited the fun parts`,
            `- Ready to page someone cooler`,
            "",
            `_Generated by ${bot.display_name}_`,
          ].join("\n"),
          mediaType: "text/markdown",
        },
      ],
    });
  }

  if (handle === "cobot" || wants(["patch", "code-review", "diff", "test"])) {
    artifacts.push({
      artifactId: makeId("art"),
      name: "patch",
      description: "Suggested patch",
      parts: [
        {
          text: [
            `--- a/src/handler.ts`,
            `+++ b/src/handler.ts`,
            `@@ -1,3 +1,6 @@`,
            `+// reviewed by @${bot.handle}`,
            ` export function handle(req) {`,
            `+  assertAuth(req);`,
            `   return ok(req.body);`,
            ` }`,
          ].join("\n"),
          mediaType: "text/plain",
        },
      ],
    });
  }

  if (handle === "scribe" || wants(["edit", "docs", "voice"])) {
    const shortened = text.length > 120 ? `${text.slice(0, 117)}…` : text;
    artifacts.push({
      artifactId: makeId("art"),
      name: "edit",
      description: "Shortened edit",
      parts: [{ text: `Cut version: ${shortened}`, mediaType: "text/plain" }],
    });
  }

  if (handle === "ferry" || handle === "pixie" || wants(["book", "schedule", "calendar", "handoff"])) {
    artifacts.push({
      artifactId: makeId("art"),
      name: "booking",
      description: "Booking payload",
      parts: [
        {
          text: JSON.stringify(
            {
              status: "held",
              when: "TBD",
              where: "TBD",
              bookedBy: `@${bot.handle}`,
              note: text.slice(0, 200),
            },
            null,
            2,
          ),
          mediaType: "application/json",
        },
      ],
    });
  }

  if (handle === "zest" || wants(["recap", "hype", "update"])) {
    artifacts.push({
      artifactId: makeId("art"),
      name: "recap",
      description: "Win recap",
      parts: [
        {
          text: `🏆 Recap: ${text.slice(0, 140)}\n\nPosted with sparkle by @${bot.handle}.`,
          mediaType: "text/plain",
        },
      ],
    });
  }

  if (handle === "demo" || wants(["ack", "route", "ops", "inbox"])) {
    artifacts.push({
      artifactId: makeId("art"),
      name: "ack",
      description: "Routing acknowledgment",
      parts: [
        {
          text: `Ack from @demo — routed "${text.slice(0, 60)}" into the Bot Pages inbox.`,
          mediaType: "text/plain",
        },
      ],
    });
  }

  if (artifacts.length === 0) {
    artifacts.push({
      artifactId: makeId("art"),
      name: "ack",
      description: "Delivery acknowledgment",
      parts: [{ text: `Delivered to @${bot.handle}.`, mediaType: "text/plain" }],
    });
  }

  return artifacts;
}

export function buildCompletedTask(
  messageRow: Message,
  text: string,
  from: string,
  to: string,
  extras?: { artifacts?: A2aArtifact[]; agentText?: string; bot?: Bot },
): A2aTask {
  const userMsg = buildUserMessage(text, messageRow.id, messageRow.thread_id, messageRow.id);
  const artifacts =
    extras?.artifacts ??
    (extras?.bot ? skillArtifactsForBot(extras.bot, text, messageRow.metadata ?? {}) : undefined);
  return {
    id: messageRow.id,
    contextId: messageRow.thread_id,
    status: {
      state: TASK_STATE_COMPLETED,
      message: buildAgentMessage(
        extras?.agentText ?? `Delivered to ${to}.`,
        `ack_${messageRow.id}`,
        messageRow.thread_id,
        messageRow.id,
      ),
      timestamp: messageRow.created_at,
    },
    history: [userMsg],
    ...(artifacts && artifacts.length ? { artifacts } : {}),
    metadata: {
      from,
      to,
      a2a: true,
      said: text,
    },
  };
}

function storedToA2aTask(stored: NonNullable<Awaited<ReturnType<typeof getTask>>>): A2aTask {
  return {
    id: stored.id,
    contextId: stored.context_id,
    status: {
      state: stored.state,
      ...(stored.status_message ? { message: stored.status_message as A2aMessage } : {}),
      timestamp: stored.updated_at,
    },
    history: (stored.history as A2aMessage[]) ?? [],
    artifacts: (stored.artifacts as A2aArtifact[]) ?? [],
    metadata: stored.metadata,
  };
}

/** Extract text from JSON-RPC params.message.parts, message string, or body.text/said/message. */
export function extractTextFromA2aBody(body: unknown): string | null {
  if (typeof body === "string" && body.trim()) return body.trim();
  if (!isRecord(body)) return null;

  for (const key of ["text", "said", "body"] as const) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  if (typeof body.message === "string" && body.message.trim()) return body.message.trim();

  const messageObj = isRecord(body.message)
    ? body.message
    : isRecord(body.params) && isRecord((body.params as Record<string, unknown>).message)
      ? ((body.params as Record<string, unknown>).message as Record<string, unknown>)
      : null;

  if (messageObj) {
    if (typeof messageObj.text === "string" && messageObj.text.trim()) return messageObj.text.trim();
    if (Array.isArray(messageObj.parts)) {
      const joined = messageObj.parts
        .map((part) => {
          if (!isRecord(part)) return "";
          if (typeof part.text === "string") return part.text;
          if (typeof part.content === "string") return part.content;
          if ("data" in part) {
            try {
              return typeof part.data === "string" ? part.data : JSON.stringify(part.data);
            } catch {
              return "";
            }
          }
          return "";
        })
        .filter(Boolean)
        .join("\n")
        .trim();
      if (joined) return joined;
    }
  }

  if (Array.isArray(body.parts)) {
    const joined = body.parts
      .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
    if (joined) return joined;
  }

  if (isRecord(body.params)) {
    const nested = extractTextFromA2aBody(body.params);
    if (nested) return nested;
  }

  return null;
}

function readA2aVersion(req: Request): string {
  const header = req.headers.get("a2a-version")?.trim();
  if (header) return header;
  try {
    const q = new URL(req.url).searchParams.get("A2A-Version")?.trim();
    if (q) return q;
  } catch {
    /* ignore */
  }
  return "0.3";
}

/** Accept 0.3 and 1.0; reject clearly unsupported majors (e.g. 2.x) with -32009. */
function versionSupported(version: string): boolean {
  const v = version.trim();
  if (!v || v === "0.3" || v === "1.0") return true;
  const major = Number.parseInt(v.split(".")[0] ?? "", 10);
  if (Number.isNaN(major)) return false;
  return major === 0 || major === 1;
}

const SEND_METHODS = new Set(["message/send", "SendMessage", "tasks/send"]);
const GET_METHODS = new Set(["tasks/get", "GetTask"]);
const CANCEL_METHODS = new Set(["tasks/cancel", "CancelTask"]);
const LIST_METHODS = new Set(["tasks/list", "ListTasks"]);
const STREAM_SEND_METHODS = new Set(["message/stream", "SendStreamingMessage", "tasks/sendSubscribe"]);
const STREAM_SUB_METHODS = new Set(["tasks/resubscribe", "SubscribeToTask"]);
const EXTENDED_CARD_METHODS = new Set(["agent/getAuthenticatedExtendedCard", "GetExtendedAgentCard"]);
const PUSH_SET = new Set(["tasks/pushNotificationConfig/set", "CreateTaskPushNotificationConfig"]);
const PUSH_GET = new Set(["tasks/pushNotificationConfig/get", "GetTaskPushNotificationConfig"]);
const PUSH_LIST = new Set(["tasks/pushNotificationConfig/list", "ListTaskPushNotificationConfigs"]);
const PUSH_DELETE = new Set(["tasks/pushNotificationConfig/delete", "DeleteTaskPushNotificationConfig"]);
const PUSH_METHODS = new Set([...PUSH_SET, ...PUSH_GET, ...PUSH_LIST, ...PUSH_DELETE]);

function paramsOf(rpc: JsonRpcBody | null, body: unknown): Record<string, unknown> {
  if (rpc && isRecord(rpc.params)) return rpc.params;
  if (isRecord(body)) return body;
  return {};
}

function taskIdFromParams(params: Record<string, unknown>): string | null {
  for (const key of ["id", "taskId", "task_id"] as const) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  if (isRecord(params.task) && typeof params.task.id === "string" && params.task.id.trim()) {
    return params.task.id.trim();
  }
  if (isRecord(params.message) && typeof params.message.taskId === "string" && params.message.taskId.trim()) {
    return params.message.taskId.trim();
  }
  if (
    isRecord(params.config) &&
    typeof (params.config as Record<string, unknown>).taskId === "string"
  ) {
    return String((params.config as Record<string, unknown>).taskId).trim();
  }
  return null;
}

async function messageInvolvesBot(message: Message, bot: Bot): Promise<boolean> {
  if (message.recipient_bot_id === bot.id) return true;
  if (message.sender_bot_id === bot.id) return true;
  return false;
}

async function taskFromMessage(message: Message, targetHandle: string): Promise<A2aTask> {
  const recipient = await getBotById(message.recipient_bot_id);
  const senderHandle = message.sender_handle ? at(message.sender_handle) : "@unknown";
  const toHandle = recipient ? at(recipient.handle) : at(targetHandle);
  return buildCompletedTask(message, message.text, senderHandle, toHandle, {
    bot: recipient ?? undefined,
  });
}

async function resolveTask(id: string, bot: Bot, handle: string): Promise<A2aTask | null> {
  const stored = await getTask(id);
  if (stored && stored.bot_id === bot.id) return storedToA2aTask(stored);
  const message = await getMessageById(id);
  if (message && (await messageInvolvesBot(message, bot))) {
    return taskFromMessage(message, handle);
  }
  return null;
}

async function deliverPushNotifications(task: A2aTask, bot: Bot, configs: A2aPushConfig[]) {
  const payload = {
    statusUpdate: {
      taskId: task.id,
      contextId: task.contextId,
      status: task.status,
      final: ["TASK_STATE_COMPLETED", "TASK_STATE_CANCELED"].includes(task.status.state),
    },
    task,
  };
  const targets = [...configs];
  if (bot.webhook_url?.trim() && targets.length === 0) {
    targets.push({ id: "bot-webhook", url: bot.webhook_url.trim() });
  }

  await Promise.all(
    targets.map(async (cfg) => {
      const headers: Record<string, string> = {
        "content-type": "application/a2a+json",
        "user-agent": "botpages-a2a-push/1.0",
      };
      const cred = cfg.authentication?.credentials;
      if (cred) headers.authorization = cred.startsWith("Bearer ") ? cred : `Bearer ${cred}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        await fetch(cfg.url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (error) {
        console.warn(`[a2a-push] failed for task ${task.id} → ${cfg.url}`, error);
      } finally {
        clearTimeout(timer);
      }
    }),
  );

  // Bridge: also send A2A-shaped notice alongside existing message.received when webhook exists
  if (bot.webhook_url?.trim() && configs.length > 0) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      await fetch(bot.webhook_url.trim(), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "botpages-a2a-push/1.0",
        },
        body: JSON.stringify({
          type: "a2a.task.update",
          a2a: payload,
          created_at: nowIso(),
          bot: { handle: bot.handle, id: bot.id },
        }),
        signal: controller.signal,
      });
    } catch {
      /* ignore bridge failures */
    } finally {
      clearTimeout(timer);
    }
  }
}

function sseResponse(rpcId: unknown, events: unknown[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        const frame = {
          jsonrpc: "2.0",
          id: rpcId ?? null,
          result: event,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(frame)}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new NextResponse(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      ...a2aCorsHeaders(),
    },
  });
}

function isDemoProtocol(text: string): "ping" | "book" | "work" | "finish" | null {
  const t = text.trim().toLowerCase();
  if (t === "a2a:ping") return "ping";
  if (t === "a2a:book" || t === "book a meeting") return "book";
  if (t === "a2a:work") return "work";
  if (t === "a2a:finish") return "finish";
  return null;
}

function bookingHasDetails(text: string): boolean {
  const t = text.toLowerCase();
  return /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(:\d{2})?\s*(am|pm)|tomorrow|next week|zoom|office|room)\b/.test(
    t,
  );
}

async function handleDemoProtocol(opts: {
  target: Bot;
  sender: Bot;
  text: string;
  contextId?: string;
  taskId?: string;
  meta: Record<string, unknown>;
}): Promise<A2aTask | null> {
  const { target, sender, text, meta } = opts;
  if (target.handle !== "demo") return null;
  const proto = isDemoProtocol(text);

  // Follow-up on existing INPUT_REQUIRED / WORKING task
  if (opts.taskId) {
    const existing = await getTask(opts.taskId);
    if (existing && existing.bot_id === target.id) {
      if (existing.state === TASK_STATE_INPUT_REQUIRED) {
        const userMsg = buildUserMessage(text, makeId("msg"), existing.context_id, existing.id);
        const history = [...((existing.history as A2aMessage[]) ?? []), userMsg];
        const artifacts: A2aArtifact[] = [
          {
            artifactId: makeId("art"),
            name: "booking",
            description: "Confirmed booking",
            parts: [
              {
                text: JSON.stringify(
                  {
                    status: "confirmed",
                    details: text,
                    bookedWith: "@demo",
                    from: at(sender.handle),
                  },
                  null,
                  2,
                ),
                mediaType: "application/json",
              },
            ],
          },
        ];
        const agentMsg = buildAgentMessage(
          `Booked it. Details locked: ${text.slice(0, 120)}`,
          makeId("msg"),
          existing.context_id,
          existing.id,
        );
        const updated = await updateTaskState(existing.id, TASK_STATE_COMPLETED, {
          history,
          artifacts,
          status_message: agentMsg,
          metadata: { ...existing.metadata, ...meta, from: at(sender.handle), to: at(target.handle) },
        });
        const task = updated ? storedToA2aTask(updated) : null;
        if (task) void deliverPushNotifications(task, target, updated?.push_configs ?? []);
        return task;
      }
      if (existing.state === TASK_STATE_WORKING && (proto === "finish" || text.trim())) {
        const artifacts: A2aArtifact[] = [
          {
            artifactId: makeId("art"),
            name: "ack",
            description: "Work finished",
            parts: [{ text: `Finished work on ${existing.id}: ${text}`, mediaType: "text/plain" }],
          },
        ];
        const agentMsg = buildAgentMessage("Work complete.", makeId("msg"), existing.context_id, existing.id);
        const updated = await updateTaskState(existing.id, TASK_STATE_COMPLETED, {
          artifacts,
          status_message: agentMsg,
        });
        const task = updated ? storedToA2aTask(updated) : null;
        if (task) void deliverPushNotifications(task, target, updated?.push_configs ?? []);
        return task;
      }
    }
  }

  if (!proto) {
    // Soft: "book a meeting" with details → completed booking without INPUT_REQUIRED
    if (/book a meeting/i.test(text) && bookingHasDetails(text)) {
      // fall through to normal send with ferry-like artifact via skillArtifacts
      return null;
    }
    return null;
  }

  const contextId = opts.contextId || makeId("thr");

  if (proto === "ping") {
    const id = makeId("task");
    const userMsg = buildUserMessage(text, makeId("msg"), contextId, id);
    const agentMsg = buildAgentMessage("pong — A2A alive on Bot Pages.", makeId("msg"), contextId, id);
    const artifacts: A2aArtifact[] = [
      {
        artifactId: makeId("art"),
        name: "ack",
        description: "Ping acknowledgment",
        parts: [{ text: "pong", mediaType: "text/plain" }],
      },
    ];
    const stored = await upsertTask({
      id,
      bot_id: target.id,
      context_id: contextId,
      state: TASK_STATE_COMPLETED,
      history: [userMsg],
      artifacts,
      status_message: agentMsg,
      metadata: { from: at(sender.handle), to: "@demo", a2a: true, protocol: "a2a:ping", ...meta },
    });
    return stored ? storedToA2aTask(stored) : null;
  }

  if (proto === "book") {
    const id = makeId("task");
    const userMsg = buildUserMessage(text, makeId("msg"), contextId, id);
    const agentMsg = buildAgentMessage(
      "When and where? Reply with the same taskId and the details.",
      makeId("msg"),
      contextId,
      id,
    );
    const stored = await upsertTask({
      id,
      bot_id: target.id,
      context_id: contextId,
      state: TASK_STATE_INPUT_REQUIRED,
      history: [userMsg],
      artifacts: [],
      status_message: agentMsg,
      metadata: {
        from: at(sender.handle),
        to: "@demo",
        a2a: true,
        protocol: "a2a:book",
        soft_inbox: true,
        ...meta,
      },
    });
    return stored ? storedToA2aTask(stored) : null;
  }

  if (proto === "work") {
    const id = makeId("task");
    const userMsg = buildUserMessage(text, makeId("msg"), contextId, id);
    const agentMsg = buildAgentMessage(
      "Working… send a2a:finish with this taskId, or CancelTask.",
      makeId("msg"),
      contextId,
      id,
    );
    const stored = await upsertTask({
      id,
      bot_id: target.id,
      context_id: contextId,
      state: TASK_STATE_WORKING,
      history: [userMsg],
      artifacts: [],
      status_message: agentMsg,
      metadata: { from: at(sender.handle), to: "@demo", a2a: true, protocol: "a2a:work", ...meta },
    });
    return stored ? storedToA2aTask(stored) : null;
  }

  return null;
}

async function persistCompletedDelivery(opts: {
  target: Bot;
  task: A2aTask;
  text: string;
  from: string;
}) {
  await upsertTask({
    id: opts.task.id,
    bot_id: opts.target.id,
    context_id: opts.task.contextId,
    state: TASK_STATE_COMPLETED,
    history: opts.task.history ?? [],
    artifacts: opts.task.artifacts ?? [],
    status_message: opts.task.status.message ?? null,
    metadata: {
      ...(opts.task.metadata ?? {}),
      from: opts.from,
      to: at(opts.target.handle),
      a2a: true,
      said: opts.text,
    },
  });
}

export async function handleA2aPost(req: Request, rawHandle: string) {
  const handle = stripAt(rawHandle);
  const target = await getBotByHandle(handle);
  if (!target) {
    return failJson(404, `@${handle} is not a number here.`);
  }

  const a2aVersion = readA2aVersion(req);
  if (!versionSupported(a2aVersion)) {
    let bodyPeek: unknown = {};
    try {
      bodyPeek = await req.clone().json();
    } catch {
      bodyPeek = {};
    }
    const rpcPeek = isJsonRpc(bodyPeek) ? bodyPeek : null;
    return rpcError(
      rpcPeek?.id ?? null,
      -32009,
      `A2A protocol version ${a2aVersion} is not supported. Supported: 0.3, 1.0.`,
      400,
      { supportedVersions: ["0.3", "1.0"] },
    );
  }

  const sender = await requireKey(req);
  if (!sender.ok) return sender.response;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const rpc = isJsonRpc(body) ? body : null;
  const method = rpc && typeof rpc.method === "string" ? rpc.method : "message/send";
  const params = paramsOf(rpc, body);

  const unsupported = findUnsupportedContent(body);
  if (unsupported) {
    return rpc
      ? rpcError(rpc.id, -32005, `ContentTypeNotSupportedError: ${unsupported}`, 400, {
          name: "ContentTypeNotSupportedError",
          mediaType: unsupported,
        })
      : failJson(400, `Content type not supported: ${unsupported}`);
  }

  if (rpc && EXTENDED_CARD_METHODS.has(method)) {
    return rpcError(rpc.id, -32004, "UnsupportedOperationError: extended agent card is not enabled.", 400, {
      name: "UnsupportedOperationError",
    });
  }

  // —— Push notification config ——
  if (rpc && PUSH_METHODS.has(method)) {
    const id = taskIdFromParams(params);
    if (!id) return rpcError(rpc.id, -32602, "Invalid params: task id is required.");
    const stored = await getTask(id);
    if (!stored || stored.bot_id !== target.id) {
      // Allow creating a shell task for push demo if missing
      if (PUSH_SET.has(method)) {
        await upsertTask({
          id,
          bot_id: target.id,
          context_id: typeof params.contextId === "string" ? params.contextId : makeId("thr"),
          state: TASK_STATE_WORKING,
          history: [],
          artifacts: [],
          metadata: { a2a: true, push_shell: true },
        });
      } else {
        return rpcError(rpc.id, -32001, "TaskNotFoundError: task not found.", 404, {
          name: "TaskNotFoundError",
        });
      }
    }

    if (PUSH_SET.has(method)) {
      const cfgRaw = isRecord(params.config)
        ? params.config
        : isRecord(params.pushNotificationConfig)
          ? params.pushNotificationConfig
          : params;
      const url = typeof cfgRaw.url === "string" ? cfgRaw.url.trim() : "";
      if (!url) return rpcError(rpc.id, -32602, "Invalid params: config.url is required.");
      const authentication = isRecord(cfgRaw.authentication)
        ? {
            schemes: Array.isArray(cfgRaw.authentication.schemes)
              ? (cfgRaw.authentication.schemes as string[])
              : undefined,
            credentials:
              typeof cfgRaw.authentication.credentials === "string"
                ? cfgRaw.authentication.credentials
                : undefined,
          }
        : undefined;
      const entry = await addPushConfig(id, {
        id: typeof cfgRaw.id === "string" ? cfgRaw.id : undefined,
        url,
        authentication,
      });
      return rpcResult(rpc.id, { id: entry?.id, url: entry?.url, authentication: entry?.authentication });
    }

    if (PUSH_GET.has(method)) {
      const configId =
        (typeof params.configId === "string" && params.configId) ||
        (isRecord(params.config) && typeof params.config.id === "string" && params.config.id) ||
        "";
      if (!configId) return rpcError(rpc.id, -32602, "Invalid params: configId is required.");
      const cfg = await getPushConfig(id, configId);
      if (!cfg) return rpcError(rpc.id, -32001, "Push config not found.", 404);
      return rpcResult(rpc.id, cfg);
    }

    if (PUSH_LIST.has(method)) {
      const list = await listPushConfigs(id);
      return rpcResult(rpc.id, { configs: list });
    }

    if (PUSH_DELETE.has(method)) {
      const configId =
        (typeof params.configId === "string" && params.configId) ||
        (isRecord(params.config) && typeof params.config.id === "string" && params.config.id) ||
        "";
      if (!configId) return rpcError(rpc.id, -32602, "Invalid params: configId is required.");
      const ok = await deletePushConfig(id, configId);
      if (!ok) return rpcError(rpc.id, -32001, "Push config not found.", 404);
      return rpcResult(rpc.id, { deleted: true, id: configId });
    }
  }

  // —— GetTask ——
  if (GET_METHODS.has(method)) {
    const id = taskIdFromParams(params);
    if (!id) {
      return rpc
        ? rpcError(rpc.id, -32602, "Invalid params: id is required.")
        : failJson(400, "Task id is required.");
    }
    const task = await resolveTask(id, target, handle);
    if (!task) {
      return rpc
        ? rpcError(rpc.id, -32001, "TaskNotFoundError: task not found.", 404, { name: "TaskNotFoundError" })
        : failJson(404, "Task not found.");
    }
    return rpc ? rpcResult(rpc.id, task) : okJson({ task });
  }

  // —— CancelTask ——
  if (CANCEL_METHODS.has(method)) {
    const id = taskIdFromParams(params);
    if (!id) {
      return rpc
        ? rpcError(rpc.id, -32602, "Invalid params: id is required.")
        : failJson(400, "Task id is required.");
    }
    const stored = await getTask(id);
    if (stored && stored.bot_id === target.id) {
      if (stored.state === TASK_STATE_WORKING || stored.state === TASK_STATE_INPUT_REQUIRED) {
        const agentMsg = buildAgentMessage("Canceled.", makeId("msg"), stored.context_id, stored.id);
        const updated = await updateTaskState(id, TASK_STATE_CANCELED, { status_message: agentMsg });
        const task = updated ? storedToA2aTask(updated) : null;
        if (task) void deliverPushNotifications(task, target, updated?.push_configs ?? []);
        return rpc ? rpcResult(rpc.id, task) : okJson({ task });
      }
      return rpc
        ? rpcError(rpc.id, -32002, "TaskNotCancelableError: task already completed.", 400, {
            name: "TaskNotCancelableError",
          })
        : failJson(400, "Task already completed and cannot be canceled.");
    }
    const message = await getMessageById(id);
    if (!message || !(await messageInvolvesBot(message, target))) {
      return rpc
        ? rpcError(rpc.id, -32001, "TaskNotFoundError: task not found.", 404, { name: "TaskNotFoundError" })
        : failJson(404, "Task not found.");
    }
    return rpc
      ? rpcError(rpc.id, -32002, "TaskNotCancelableError: task already completed.", 400, {
          name: "TaskNotCancelableError",
        })
      : failJson(400, "Task already completed and cannot be canceled.");
  }

  // —— ListTasks ——
  if (LIST_METHODS.has(method)) {
    let pageSize = 50;
    if (typeof params.pageSize === "number" && Number.isFinite(params.pageSize)) {
      pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize)));
    } else if (typeof params.pageSize === "string" && params.pageSize.trim()) {
      const n = Number.parseInt(params.pageSize, 10);
      if (!Number.isNaN(n)) pageSize = Math.min(100, Math.max(1, n));
    }

    const contextId =
      typeof params.contextId === "string" && params.contextId.trim()
        ? params.contextId.trim()
        : undefined;
    const stateFilter =
      (typeof params.status === "string" && params.status.trim()) ||
      (typeof params.state === "string" && params.state.trim()) ||
      undefined;
    const nextPageToken =
      typeof params.nextPageToken === "string" && params.nextPageToken.trim()
        ? params.nextPageToken.trim()
        : undefined;

    const storedList = await listTasksForBot(target.id, {
      contextId,
      state: stateFilter,
      pageSize,
      nextPageToken,
    });

    if (storedList.tasks.length > 0) {
      const result = {
        tasks: storedList.tasks.map(storedToA2aTask),
        nextPageToken: storedList.nextPageToken,
        pageSize: storedList.pageSize,
        totalSize: storedList.totalSize,
      };
      return rpc ? rpcResult(rpc.id, result) : okJson(result);
    }

    // Fallback to message-derived tasks for older ids
    const rows = await listInbox(target.id, contextId, pageSize);
    const tasks = await Promise.all(rows.map((row) => taskFromMessage(row, handle)));
    const filtered = stateFilter ? tasks.filter((t) => t.status.state === stateFilter) : tasks;
    const result = {
      tasks: filtered,
      nextPageToken: "",
      pageSize,
      totalSize: filtered.length,
    };
    return rpc ? rpcResult(rpc.id, result) : okJson(result);
  }

  // —— SubscribeToTask ——
  if (rpc && STREAM_SUB_METHODS.has(method)) {
    const id = taskIdFromParams(params);
    if (!id) return rpcError(rpc.id, -32602, "Invalid params: id is required.");
    const task = await resolveTask(id, target, handle);
    if (!task) {
      return rpcError(rpc.id, -32001, "TaskNotFoundError: task not found.", 404, {
        name: "TaskNotFoundError",
      });
    }
    const events: unknown[] = [{ task }];
    if (task.status.state === TASK_STATE_WORKING) {
      events.push({
        statusUpdate: {
          taskId: task.id,
          contextId: task.contextId,
          status: { state: TASK_STATE_WORKING, timestamp: nowIso() },
          final: false,
        },
      });
    }
    if (
      task.status.state === TASK_STATE_COMPLETED ||
      task.status.state === TASK_STATE_CANCELED ||
      task.status.state === TASK_STATE_INPUT_REQUIRED
    ) {
      events.push({
        statusUpdate: {
          taskId: task.id,
          contextId: task.contextId,
          status: task.status,
          final: task.status.state !== TASK_STATE_INPUT_REQUIRED,
        },
      });
    }
    return sseResponse(rpc.id, events);
  }

  const isStreamSend = rpc && STREAM_SEND_METHODS.has(method);

  // —— SendMessage / Stream ——
  if (!SEND_METHODS.has(method) && !isStreamSend && rpc) {
    return rpcError(rpc.id, -32601, `Method not found: ${method}`);
  }

  const msg = isRecord(params.message) ? params.message : null;
  const contextId =
    (msg && typeof msg.contextId === "string" && msg.contextId.trim() && msg.contextId.trim()) ||
    (typeof params.contextId === "string" && params.contextId.trim() && params.contextId.trim()) ||
    (typeof params.thread_id === "string" && params.thread_id.trim() && params.thread_id.trim()) ||
    undefined;
  const messageId =
    (msg && typeof msg.messageId === "string" && msg.messageId.trim() && msg.messageId.trim()) ||
    (typeof params.messageId === "string" && params.messageId.trim() && params.messageId.trim()) ||
    undefined;
  const incomingTaskId =
    (msg && typeof msg.taskId === "string" && msg.taskId.trim() && msg.taskId.trim()) ||
    (typeof params.taskId === "string" && params.taskId.trim() && params.taskId.trim()) ||
    undefined;

  const text = extractTextFromA2aBody(body);
  const baseMeta = isRecord(params.metadata)
    ? params.metadata
    : isRecord(body) && isRecord(body.metadata)
      ? body.metadata
      : {};
  const msgMeta = msg && isRecord(msg.metadata) ? msg.metadata : {};
  const mergedMeta = { ...baseMeta, ...msgMeta, a2a: true, ...(messageId ? { a2a_message_id: messageId } : {}) };

  // Special @demo multi-turn protocol (no hard inbox requirement for book/work/ping)
  if (text) {
    const demoTask = await handleDemoProtocol({
      target,
      sender: sender.bot,
      text,
      contextId,
      taskId: incomingTaskId,
      meta: mergedMeta,
    });
    if (demoTask) {
      if (isStreamSend) {
        const working: A2aTask = {
          ...demoTask,
          status: { ...demoTask.status, state: TASK_STATE_WORKING, timestamp: nowIso() },
        };
        return sseResponse(rpc?.id, [
          { task: working },
          {
            statusUpdate: {
              taskId: demoTask.id,
              contextId: demoTask.contextId,
              status: { state: TASK_STATE_WORKING, timestamp: nowIso() },
              final: false,
            },
          },
          ...(demoTask.artifacts?.length
            ? [
                {
                  artifactUpdate: {
                    taskId: demoTask.id,
                    contextId: demoTask.contextId,
                    artifact: demoTask.artifacts[0],
                  },
                },
              ]
            : []),
          { task: demoTask },
          {
            statusUpdate: {
              taskId: demoTask.id,
              contextId: demoTask.contextId,
              status: demoTask.status,
              final: demoTask.status.state === TASK_STATE_COMPLETED,
            },
          },
        ]);
      }
      return rpc ? rpcResult(rpc.id, demoTask) : okJson({ task: demoTask, status: demoTask.status.state });
    }
  }

  const sayBody: Record<string, unknown> = {
    ...(isRecord(body) ? body : {}),
    ...(text ? { text } : {}),
    ...(contextId ? { thread_id: contextId } : {}),
    metadata: mergedMeta,
  };

  const result = await sayTo(handle, sender.bot.id, sender.bot.handle, sender.bot.display_name, sayBody);
  if (!result.ok) {
    if (rpc) return rpcError(rpc.id, result.status === 400 ? -32602 : -32000, result.error, result.status);
    return failJson(result.status, result.error);
  }

  const storedMsg = await getMessageById(result.id);
  const artifacts = skillArtifactsForBot(target, result.said, mergedMeta);
  const task = storedMsg
    ? buildCompletedTask(storedMsg, result.said, result.from, result.to, {
        artifacts,
        bot: target,
      })
    : {
        id: result.id,
        contextId: result.thread_id,
        status: {
          state: TASK_STATE_COMPLETED,
          timestamp: new Date().toISOString(),
        },
        artifacts,
        metadata: { from: result.from, to: result.to, a2a: true, said: result.said },
      };

  await persistCompletedDelivery({
    target,
    task,
    text: result.said,
    from: result.from,
  });

  const pushRow = await getTask(task.id);
  void deliverPushNotifications(task, target, pushRow?.push_configs ?? []);

  if (isStreamSend) {
    const workingTask: A2aTask = {
      ...task,
      status: {
        state: TASK_STATE_WORKING,
        message: buildAgentMessage("Working…", makeId("msg"), task.contextId, task.id),
        timestamp: nowIso(),
      },
    };
    return sseResponse(rpc?.id, [
      { task: workingTask },
      {
        statusUpdate: {
          taskId: task.id,
          contextId: task.contextId,
          status: { state: TASK_STATE_WORKING, timestamp: nowIso() },
          final: false,
        },
      },
      ...(artifacts[0]
        ? [
            {
              artifactUpdate: {
                taskId: task.id,
                contextId: task.contextId,
                artifact: artifacts[0],
              },
            },
          ]
        : []),
      { task },
      {
        statusUpdate: {
          taskId: task.id,
          contextId: task.contextId,
          status: task.status,
          final: true,
        },
      },
    ]);
  }

  if (rpc) {
    return rpcResult(rpc.id, task);
  }

  return okJson({
    from: result.from,
    to: result.to,
    said: result.said,
    id: result.id,
    thread_id: result.thread_id,
    status: "completed",
    task,
  });
}
