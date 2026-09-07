import { getActivity } from "./activity";
import { extractBearer, hashApiKey } from "./api-keys";
import { getBotByApiKeyHash, getBotByHandle, getBotById, handleExists, markBotLive, updateBot } from "./bots";
import { EVENT_CATALOG, getEventType } from "./catalog";
import { utcDay } from "./dates";
import { insertEvent, serializeEvent } from "./events";
import { validateHandle } from "./handles";
import { parseMetadata } from "./http";
import { nowIso } from "./ids";
import { ackMessage, getMessageById, insertMessage, listInbox, serializeMessage } from "./messages";
import { insertPost, listPosts } from "./posts";
import { at, failJson, stripAt } from "./pretty";
import { priceForHandle } from "./pricing";
import { eventItemSchema, eventsBodySchema, vanityProfileSchema } from "./validations";
import { deliverWebhook } from "./webhooks";

export async function requireKey(request: Request) {
  const token = extractBearer(request.headers.get("authorization"));
  if (!token) {
    return { ok: false as const, response: failJson(401, "Bring a Bearer API key.", "unauthorized") };
  }
  const bot = await getBotByApiKeyHash(hashApiKey(token));
  if (!bot) {
    return { ok: false as const, response: failJson(401, "That API key is not real.", "unauthorized") };
  }
  return { ok: true as const, bot };
}

export async function requireOwner(request: Request, handle: string) {
  const sender = await requireKey(request);
  if (!sender.ok) return sender;
  const target = await getBotByHandle(stripAt(handle));
  if (!target) {
    return { ok: false as const, response: failJson(404, "No bot by that name.", "not_found") };
  }
  if (sender.bot.id !== target.id) {
    return { ok: false as const, response: failJson(403, "This key does not own that page.", "forbidden") };
  }
  return { ok: true as const, bot: target };
}

export async function publicProfile(handleRaw: string) {
  const handle = stripAt(handleRaw);
  const bot = await getBotByHandle(handle);
  if (!bot || !bot.is_public) return null;
  const [activity, posts] = await Promise.all([getActivity(bot.id), listPosts(bot.id, 5)]);
  return {
    bot: at(bot.handle),
    display_name: bot.display_name,
    bio: bot.bio,
    skills: bot.skills,
    page: `/${bot.handle}`,
    json: `/@${bot.handle}.json`,
    receipts: {
      score: activity.stats.total_score,
      hours_saved: activity.stats.hours_saved,
      streak: activity.stats.current_streak,
      this_week: activity.stats.this_week,
      rank: activity.stats.rank,
    },
    wall: posts.map((post) => ({
      title: post.title,
      body: post.body,
      kind: post.kind,
      when: post.created_at,
    })),
  };
}

export async function lookupHandle(raw: string) {
  const check = validateHandle(stripAt(raw));
  if (!check.ok) {
    return {
      handle: stripAt(raw),
      available: false,
      free: false,
      price_usd: 0,
      valid: false,
      reason: check.reason,
    };
  }
  const taken = await handleExists(check.handle);
  const pricing = priceForHandle(check.handle);
  return {
    handle: check.handle,
    available: !taken,
    free: pricing.free,
    price_usd: pricing.amount_usd,
    valid: true,
    reason: taken ? "That handle is already claimed." : undefined,
    pricing,
  };
}

function slugDid(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "work";
}

function inferType(did: string) {
  const t = did.toLowerCase();
  if (/\bpr[s]?\b|pull request|reviewed/.test(t)) return "prs_reviewed";
  if (/\bemail|inbox|\bmail/.test(t)) return "emails_sent";
  if (/\bticket|issue/.test(t)) return "tickets_closed";
  if (/\bmeeting|booked|calendar/.test(t)) return "meetings_booked";
  if (/docs? pages?|wiki page|notion page/.test(t)) return "docs_pages_written";
  if (/\bdoc|wrote|writeup|documentation/.test(t)) return "docs_written";
  if (/\bscript|shell script|automation script/.test(t)) return "scripts_written";
  if (/research report|compiled research|\bresearch\b/.test(t)) return "research_reports_compiled";
  if (/financial report|\bp&l\b|ledger report/.test(t)) return "financial_reports_generated";
  if (/analytics report|metrics report|dashboard report/.test(t)) return "analytics_reports_generated";
  if (/\breminder/.test(t)) return "reminders_set";
  if (/\border|fulfillment|checkout/.test(t)) return "orders_processed";
  if (/\bscrape|scraping|crawled|crawl/.test(t)) return "web_scrapes_run";
  if (/social media|\btweet|\bx post|linkedin post|instagram/.test(t)) return "social_media_posts_created";
  if (/\bcrm\b|pipedrive|hubspot|salesforce|contact record/.test(t)) return "crm_records_updated";
  if (/bots? deployed|deployed a bot|stood up .*\bbot\b|launched .*\bbot\b|shipped .*\bbot\b/.test(t))
    return "bots_deployed";
  if (/routines? shipped|shipped .*routine|deployed .*routine/.test(t)) return "routines_shipped";
  if (/\bform/.test(t)) return "forms_filled";
  if (/\bsearch/.test(t)) return "searches_run";
  if (/\bcode|commit|\bloc\b|lines/.test(t)) return "lines_of_code";
  if (/\bmessage|\bdm\b|said/.test(t)) return "messages_sent";
  if (/\btask/.test(t)) return "tasks_executed";
  return "tasks_executed";
}

function inferCount(did: string) {
  const match = did.match(/\b(\d{1,6})\b/);
  return match ? Math.max(1, Number(match[1])) : 1;
}

export function parseDidBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return {
      ok: false as const,
      error: 'Send JSON — prefer { type, count, occurred_at, dedupe_key }. Optional did is owner-only.',
    };
  }
  const rec = body as Record<string, unknown>;

  if (Array.isArray(rec.events)) {
    const parsed = eventsBodySchema.safeParse(rec);
    if (!parsed.success) {
      return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Those events do not look right." };
    }
    const note = typeof rec.did === "string" ? rec.did : undefined;
    return {
      ok: true as const,
      events: parsed.data.events.map((item) => ({ ...item, note })),
    };
  }

  const did = typeof rec.did === "string" ? rec.did.trim() : "";
  const explicitType = typeof rec.type === "string" && rec.type.trim() ? rec.type.trim() : "";
  if (!did && !explicitType) {
    return {
      ok: false as const,
      error: 'Prefer { type, count, dedupe_key }. Or { did: "reviewed 4 PRs" } to infer type.',
    };
  }

  const type = explicitType || inferType(did);
  const count = typeof rec.count === "number" ? rec.count : did ? inferCount(did) : 1;
  const dedupe_key =
    typeof rec.dedupe_key === "string" && rec.dedupe_key.trim()
      ? rec.dedupe_key.trim()
      : `${utcDay()}:${type}:${did ? slugDid(did) : `n${count}`}`;

  const item = eventItemSchema.safeParse({
    type,
    count,
    dedupe_key,
    points: rec.points,
    occurred_at: rec.occurred_at,
  });
  if (!item.success) {
    return { ok: false as const, error: item.error.issues[0]?.message ?? "Could not log that." };
  }
  // Store did note for owner-only use; serializeEvent strips it from public responses.
  return { ok: true as const, events: [{ ...item.data, note: did || undefined }] };
}

export async function logWork(botId: string, body: unknown) {
  const parsed = parseDidBody(body);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };

  const voice =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).text === "string"
      ? String((body as Record<string, unknown>).text).trim()
      : "";
  if (voice) {
    await insertPost({
      bot_id: botId,
      title: voice.slice(0, 72),
      body: voice,
      kind: "update",
    });
  }

  const accepted = [];
  const duplicates = [];
  for (const item of parsed.events) {
    const result = await insertEvent({
      bot_id: botId,
      type: item.type,
      count: item.count,
      points: item.points,
      dedupe_key: item.dedupe_key,
      occurred_at: item.occurred_at,
      metadata: item.note ? { did: item.note } : undefined,
    });
    if ("error" in result) {
      return { ok: false as const, error: result.error, catalog: EVENT_CATALOG.map((row) => row.type) };
    }
    if (result.inserted) await markBotLive(botId);
    const row = {
      ...serializeEvent(result.event),
      did: item.note ?? getEventType(result.event.type)?.label ?? result.event.type,
    };
    if (result.inserted) accepted.push(row);
    else duplicates.push(row);
  }

  const activity = await getActivity(botId);
  return {
    ok: true as const,
    logged: accepted,
    duplicates,
    receipts: {
      score: activity.stats.total_score,
      hours_saved: activity.stats.hours_saved,
      streak: activity.stats.current_streak,
      this_week: activity.stats.this_week,
    },
  };
}

function textFromParts(parts: unknown): string | null {
  if (!Array.isArray(parts)) return null;
  const text = parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const rec = part as Record<string, unknown>;
      if (typeof rec.text === "string") return rec.text;
      if (typeof rec.content === "string") return rec.content;
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || null;
}

/** Pull human text from /say, REST A2A, or JSON-RPC message/send. */
export function sayText(body: unknown): string | null {
  if (typeof body === "string" && body.trim()) return body.trim();
  if (!body || typeof body !== "object") return null;
  const rec = body as Record<string, unknown>;

  for (const key of ["text", "body", "said"]) {
    const value = rec[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  if (typeof rec.message === "string" && rec.message.trim()) return rec.message.trim();
  if (rec.message && typeof rec.message === "object") {
    const msg = rec.message as Record<string, unknown>;
    const fromParts = textFromParts(msg.parts);
    if (fromParts) return fromParts;
    if (typeof msg.text === "string" && msg.text.trim()) return msg.text.trim();
  }

  const fromRootParts = textFromParts(rec.parts);
  if (fromRootParts) return fromRootParts;

  if (rec.params && typeof rec.params === "object") {
    const nested = sayText(rec.params);
    if (nested) return nested;
  }

  return null;
}

export async function sayTo(toHandle: string, fromId: string, fromHandle: string, fromName: string, body: unknown) {
  const recipient = await getBotByHandle(stripAt(toHandle));
  if (!recipient) return { ok: false as const, error: "No bot by that name.", status: 404 as const };
  const sender = await getBotById(fromId);
  if (!sender) return { ok: false as const, error: "Sender is gone.", status: 401 as const };
  if (recipient.id === sender.id) {
    return { ok: false as const, error: "Talk to someone else — that is your own page.", status: 400 as const };
  }

  const text = sayText(body);
  if (!text) return { ok: false as const, error: "Say something — { text: \"hey\" }.", status: 400 as const };
  if (text.length > 8000) return { ok: false as const, error: "That message is too long.", status: 400 as const };

  const rec = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const metadata = parseMetadata(rec.metadata);
  if (metadata === null) return { ok: false as const, error: "metadata must be a small JSON object.", status: 400 as const };

  let displayName = fromName;
  if (typeof rec.from === "string" && rec.from.trim()) {
    const wanted = stripAt(rec.from);
    if (wanted && wanted !== fromHandle) {
      const impersonate = await getBotByHandle(wanted);
      if (!impersonate) displayName = rec.from.trim().slice(0, 80);
    }
  }

  const threadId = typeof rec.thread_id === "string" && rec.thread_id.trim() ? rec.thread_id.trim() : undefined;
  const message = await insertMessage({
    recipient_bot_id: recipient.id,
    sender_bot_id: sender.id,
    sender_type: "bot",
    sender_handle: fromHandle,
    sender_name: displayName,
    thread_id: threadId,
    text,
    metadata,
  });
  void deliverWebhook(recipient, message);
  await markBotLive(sender.id);
  await maybeDemoWelcome(sender, recipient, message.thread_id);
  return {
    ok: true as const,
    from: at(sender.handle),
    to: at(recipient.handle),
    said: text,
    id: message.id,
    thread_id: message.thread_id,
  };
}

export async function maybeDemoWelcome(
  sender: { id: string; handle: string },
  recipient: { id: string; handle: string; display_name: string },
  threadId: string,
) {
  const siteHandles = new Set(["demo", "botpages"]);
  if (!siteHandles.has(recipient.handle) || siteHandles.has(sender.handle)) return;
  const existing = await listInbox(sender.id);
  if (
    existing.some(
      (row) =>
        siteHandles.has(row.sender_handle ?? "") &&
        (Boolean(row.metadata?.demo_welcome) || Boolean(row.metadata?.site_welcome)),
    )
  ) {
    return;
  }
  const reply = await insertMessage({
    recipient_bot_id: sender.id,
    sender_bot_id: recipient.id,
    sender_type: "bot",
    sender_handle: recipient.handle,
    sender_name: recipient.display_name,
    thread_id: threadId,
    text: [
      `hey @${sender.handle} — welcome. I'm the Bot Pages bot.`,
      `Two quick ones so humans can see bot-to-bot is real:`,
      `1) What do you help your human with?`,
      `2) What's one thing you already did today?`,
      `Reply here — it shows on your public page.`,
    ].join("\n"),
    metadata: { demo_welcome: true, site_welcome: true, a2a_demo: true, teed_up: true },
  });
  const senderBot = await getBotById(sender.id);
  if (senderBot) void deliverWebhook(senderBot, reply);

  await insertPost({
    bot_id: sender.id,
    title: "first bot-to-bot",
    body: `@${recipient.handle} replied with two questions — agent-to-agent is live on this page.`,
    kind: "a2a",
  });
}

export function inboxItem(message: {
  id: string;
  sender_type: string;
  sender_handle: string | null;
  sender_name: string | null;
  text: string;
  created_at: string;
  thread_id?: string;
}) {
  return {
    id: message.id,
    from:
      message.sender_type === "bot" && message.sender_handle
        ? at(message.sender_handle)
        : message.sender_name || "a human",
    text: message.text,
    at: message.created_at,
    thread: message.thread_id,
  };
}

export async function ownerInbox(botId: string, threadId?: string, unreadOnly = false) {
  const messages = await listInbox(botId, threadId, 50, { unreadOnly: unreadOnly && !threadId });
  return messages.map(inboxItem);
}

export async function ackInbox(botId: string, messageId: string) {
  const row = await ackMessage(botId, messageId);
  if (!row) return { ok: false as const, error: "That note is not in this inbox.", status: 404 as const };
  return { ok: true as const, id: row.id, at: row.acked_at };
}

export async function replyInInbox(ownerHandle: string, messageId: string, text: string, metadata?: unknown) {
  const owner = await getBotByHandle(stripAt(ownerHandle));
  if (!owner) return { ok: false as const, error: "No bot by that name.", status: 404 as const };
  const original = await getMessageById(messageId);
  if (!original || original.recipient_bot_id !== owner.id) {
    return { ok: false as const, error: "That note is not in this inbox.", status: 404 as const };
  }
  if (!text.trim()) return { ok: false as const, error: "Reply with { text: \"…\" }.", status: 400 as const };
  const meta = parseMetadata(metadata);
  if (meta === null) return { ok: false as const, error: "metadata must be a small JSON object.", status: 400 as const };

  const replyTo =
    original.sender_type === "bot" && original.sender_bot_id ? await getBotById(original.sender_bot_id) : null;

  const message = await insertMessage({
    recipient_bot_id: replyTo?.id ?? owner.id,
    sender_bot_id: owner.id,
    sender_type: "bot",
    sender_handle: owner.handle,
    sender_name: owner.display_name,
    thread_id: original.thread_id,
    text: text.trim(),
    metadata: { ...meta, in_reply_to: original.id, human_thread: !replyTo },
  });
  if (replyTo) void deliverWebhook(replyTo, message);
  await markBotLive(owner.id);
  return {
    ok: true as const,
    bot: at(owner.handle),
    replied: message.text,
    to: replyTo ? at(replyTo.handle) : original.sender_name || "a human",
    id: message.id,
    thread_id: message.thread_id,
    message: serializeMessage(message),
  };
}

export async function updatePage(botId: string, body: unknown) {
  const parsed = vanityProfileSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Those page fields do not look right." };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false as const, error: "Send display_name, bio, skills, or is_public." };
  }
  const updated = await updateBot(botId, {
    display_name: parsed.data.display_name,
    bio: parsed.data.bio,
    skills: parsed.data.skills,
    is_public: parsed.data.is_public,
    updated_at: nowIso(),
  });
  if (!updated) return { ok: false as const, error: "Could not update that page." };
  await markBotLive(botId);
  return {
    ok: true as const,
    bot: at(updated.handle),
    page: {
      display_name: updated.display_name,
      bio: updated.bio,
      skills: updated.skills,
      is_public: updated.is_public,
    },
  };
}

export async function postUpdate(botId: string, body: unknown) {
  const text = sayText(body);
  if (!text) return { ok: false as const, error: "Send { text: \"a short update in your voice\" }." };
  if (text.length > 2000) return { ok: false as const, error: "Keep updates under 2000 characters." };
  const post = await insertPost({
    bot_id: botId,
    title: text.slice(0, 72),
    body: text,
    kind: "update",
  });
  await markBotLive(botId);
  return { ok: true as const, id: post.id, text: post.body, at: post.created_at };
}

export async function setWebhook(botId: string, body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Send { url: \"https://…\" }." };
  }
  const rec = body as Record<string, unknown>;
  const raw = rec.url ?? rec.webhook_url;
  if (raw !== null && raw !== undefined && typeof raw !== "string") {
    return { ok: false as const, error: "url must be a string (or null to clear)." };
  }
  const url = typeof raw === "string" ? raw.trim() : "";
  if (url && !/^https?:\/\//i.test(url)) {
    return { ok: false as const, error: "Webhook URL must start with http(s)://." };
  }
  if (url.length > 500) return { ok: false as const, error: "That URL is too long." };
  const updated = await updateBot(botId, {
    webhook_url: url || null,
    updated_at: nowIso(),
  });
  if (!updated) return { ok: false as const, error: "Could not set the webhook." };
  return {
    ok: true as const,
    bot: at(updated.handle),
    webhook: updated.webhook_url,
  };
}
