/**
 * Happy path: claim two handles, A messages B, B lists inbox, B replies, B reports events,
 * then vanity /api/@handle/say + /did.
 * Requires the Next.js server to be running.
 *
 *   npm run dev
 *   npm run happy-path
 */

const BASE = (process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43127").replace(
  /\/$/,
  "",
);

type Signup = { api_key?: string; bot?: { handle: string }; error?: string };
type MessageRes = {
  message?: { id: string; text: string; thread_id: string; sender?: { handle?: string | null } };
  error?: string;
  messages?: Array<{ text: string; sender?: { handle?: string | null } }>;
};

async function post<T>(path: string, body: unknown, apiKey?: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: (await res.json()) as T };
}

async function get<T>(path: string, apiKey?: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: apiKey ? { authorization: `Bearer ${apiKey}` } : undefined,
  });
  return { status: res.status, data: (await res.json()) as T };
}

async function claim(handle: string) {
  const stamp = Date.now().toString(36);
  const email = `${handle}-${stamp}@example.test`;
  const result = await post<Signup>("/api/auth/signup", {
    handle,
    email,
    password: "happy-path-pass",
    display_name: handle,
  });
  if (result.status !== 201 || !result.data.api_key) {
    throw new Error(`Claim ${handle} failed: ${result.status} ${JSON.stringify(result.data)}`);
  }
  return { handle, apiKey: result.data.api_key, email };
}

async function main() {
  const suffix = Date.now().toString(36);
  const handleA = `hp-a-${suffix}`.slice(0, 24);
  const handleB = `hp-b-${suffix}`.slice(0, 24);

  console.log(`Target ${BASE}`);
  console.log("1. Claim two handles");
  const a = await claim(handleA);
  const b = await claim(handleB);
  console.log(`   /${a.handle} and /${b.handle}`);

  const waitingPage = await fetch(`${BASE}/${b.handle}`);
  const waitingHtml = await waitingPage.text();
  if (waitingPage.status !== 200 || !waitingHtml.includes("Waiting for your bot")) {
    throw new Error(`Expected waiting state after claim: ${waitingPage.status}`);
  }

  console.log("2. A → B message");
  const sent = await post<MessageRes>(
    `/api/v1/bots/${b.handle}/messages`,
    { text: "Ping from happy-path.", metadata: { probe: true } },
    a.apiKey,
  );
  if (sent.status !== 201 || sent.data.message?.text !== "Ping from happy-path.") {
    throw new Error(`Send failed: ${sent.status} ${JSON.stringify(sent.data)}`);
  }
  console.log(`   message ${sent.data.message?.id}`);

  console.log("3. B lists inbox");
  const inbox = await get<MessageRes>(`/api/v1/bots/${b.handle}/messages`, b.apiKey);
  if (inbox.status !== 200 || !inbox.data.messages?.some((m) => m.text === "Ping from happy-path.")) {
    throw new Error(`Inbox failed: ${inbox.status} ${JSON.stringify(inbox.data)}`);
  }
  const fromA = inbox.data.messages.find((m) => m.text === "Ping from happy-path.");
  if (fromA?.sender?.handle !== a.handle) {
    throw new Error(`Expected sender /${a.handle}, got ${JSON.stringify(fromA)}`);
  }
  console.log(`   ${inbox.data.messages.length} message(s), sender /${fromA.sender?.handle}`);

  console.log("4. B replies in thread");
  const reply = await post<MessageRes>(
    `/api/v1/bots/${b.handle}/messages/${sent.data.message?.id}/reply`,
    { text: "Pong." },
    b.apiKey,
  );
  if (reply.status !== 201 || reply.data.message?.text !== "Pong.") {
    throw new Error(`Reply failed: ${reply.status} ${JSON.stringify(reply.data)}`);
  }

  const aInbox = await get<MessageRes>(`/api/v1/bots/${a.handle}/messages`, a.apiKey);
  if (!aInbox.data.messages?.some((m) => m.text === "Pong.")) {
    throw new Error(`A did not receive the reply: ${JSON.stringify(aInbox.data)}`);
  }

  console.log("5. B reports proof-of-work events");
  const today = new Date().toISOString().slice(0, 10);
  const reported = await post<{
    stats?: { total_score: number };
    accepted?: unknown[];
    error?: string;
  }>(
    `/api/v1/bots/${b.handle}/events`,
    {
      events: [{ type: "emails_sent", count: 3, dedupe_key: `${today}:emails_sent:happy-path` }],
    },
    b.apiKey,
  );
  if (![200, 201].includes(reported.status) || !reported.data.accepted) {
    throw new Error(`Events failed: ${reported.status} ${JSON.stringify(reported.data)}`);
  }
  const activity = await get<{ stats?: { total_score: number; hours_saved: number } }>(
    `/api/v1/bots/${b.handle}/activity`,
  );
  if ((activity.data.stats?.total_score ?? 0) < 1) {
    throw new Error(`Activity did not recompute: ${JSON.stringify(activity.data)}`);
  }
  console.log(`   score ${activity.data.stats?.total_score} · hours ${activity.data.stats?.hours_saved}`);

  console.log("6. Vanity /api/@handle/say + /did");
  const said = await post<{
    ok?: boolean;
    from?: string;
    to?: string;
    said?: string;
    id?: string;
    error?: string;
  }>(`/api/@${b.handle}/say`, { text: "hey from vanity" }, a.apiKey);
  if (said.status !== 201 || said.data.ok !== true || said.data.said !== "hey from vanity") {
    throw new Error(`Vanity say failed: ${said.status} ${JSON.stringify(said.data)}`);
  }
  if (said.data.from !== `@${a.handle}` || said.data.to !== `@${b.handle}`) {
    throw new Error(`Vanity say addresses wrong: ${JSON.stringify(said.data)}`);
  }

  const did = await post<{
    ok?: boolean;
    logged?: Array<{ type?: string; count?: number }>;
    error?: string;
  }>(`/api/@${b.handle}/did`, { did: "reviewed 4 PRs" }, b.apiKey);
  if (![200, 201].includes(did.status) || did.data.ok !== true || !did.data.logged?.length) {
    throw new Error(`Vanity did failed: ${did.status} ${JSON.stringify(did.data)}`);
  }
  if (did.data.logged[0]?.type !== "prs_reviewed" || did.data.logged[0]?.count !== 4) {
    throw new Error(`Vanity did inference wrong: ${JSON.stringify(did.data)}`);
  }

  const livePage = await fetch(`${BASE}/${b.handle}`);
  const liveHtml = await livePage.text();
  if (livePage.status !== 200 || !liveHtml.includes("Live") || liveHtml.includes("Waiting for your bot")) {
    throw new Error("Page did not flip to Live after first bot action");
  }

  const profile = await get<{ ok?: boolean; bot?: string; display_name?: string }>(`/api/@${b.handle}`);
  if (profile.status !== 200 || profile.data.ok !== true || profile.data.bot !== `@${b.handle}`) {
    throw new Error(`Vanity profile failed: ${profile.status} ${JSON.stringify(profile.data)}`);
  }

  const avail = await get<{ ok?: boolean; handle?: string; available?: boolean }>(`/api/handles/${b.handle}`);
  if (avail.status !== 200 || avail.data.available !== false) {
    throw new Error(`Handle lookup failed: ${avail.status} ${JSON.stringify(avail.data)}`);
  }
  console.log(`   ${said.data.from} → ${said.data.to}: "${said.data.said}" · did ${did.data.logged[0]?.type}`);

  console.log("7. Agent Card (A2A v1) on every public path");
  const cardPaths = [
    `/@${b.handle}/.well-known/agent-card.json`,
    `/${b.handle}/.well-known/agent-card.json`,
    `/@${b.handle}/agent-card.json`,
  ];
  for (const path of cardPaths) {
    const card = await get<{
      name?: string;
      url?: string;
      protocolVersion?: string;
      skills?: Array<{ id?: string; name?: string }>;
      capabilities?: { streaming?: boolean };
      provider?: { organization?: string };
    }>(path);
    if (
      card.status !== 200 ||
      !card.data.name ||
      !card.data.url ||
      card.data.protocolVersion !== "1.0" ||
      !card.data.skills?.length ||
      card.data.capabilities?.streaming !== false ||
      card.data.provider?.organization !== "Bot Pages"
    ) {
      throw new Error(`Agent card failed at ${path}: ${card.status} ${JSON.stringify(card.data)}`);
    }
  }
  const cardPage = await fetch(`${BASE}/@${b.handle}/card`);
  if (cardPage.status !== 200) {
    throw new Error(`Visual agent card failed: ${cardPage.status}`);
  }
  const cardHtml = await cardPage.text();
  if (!cardHtml.includes(`@${b.handle}`) || !cardHtml.toLowerCase().includes("business card")) {
    throw new Error("Visual agent card is missing the business-card treatment");
  }

  const demoCard = await get<{ handle?: string; name?: string }>(`/@demo/.well-known/agent-card.json`);
  if (demoCard.status === 200 && demoCard.data.handle !== "@demo") {
    throw new Error(`Demo agent card handle wrong: ${JSON.stringify(demoCard.data)}`);
  }

  console.log("8. A2A send lands in the same inbox as /say");
  const a2aRest = await post<{
    ok?: boolean;
    said?: string;
    id?: string;
    status?: string;
  }>(`/a2a/@${b.handle}`, { message: { parts: [{ text: "hey from a2a rest" }] } }, a.apiKey);
  if (a2aRest.status !== 200 || a2aRest.data.ok !== true || a2aRest.data.said !== "hey from a2a rest") {
    throw new Error(`A2A REST failed: ${a2aRest.status} ${JSON.stringify(a2aRest.data)}`);
  }

  const a2aRpc = await post<{
    jsonrpc?: string;
    result?: { said?: string; status?: { state?: string } };
    error?: unknown;
  }>(
    `/a2a/@${b.handle}`,
    {
      jsonrpc: "2.0",
      id: "hp-1",
      method: "message/send",
      params: { message: { parts: [{ text: "hey from a2a rpc" }] } },
    },
    a.apiKey,
  );
  if (
    a2aRpc.status !== 200 ||
    a2aRpc.data.jsonrpc !== "2.0" ||
    a2aRpc.data.result?.said !== "hey from a2a rpc" ||
    a2aRpc.data.result?.status?.state !== "completed"
  ) {
    throw new Error(`A2A JSON-RPC failed: ${a2aRpc.status} ${JSON.stringify(a2aRpc.data)}`);
  }

  const vanityInbox = await get<{
    ok?: boolean;
    messages?: Array<{ text?: string; id?: string }>;
    inbox?: Array<{ text?: string; id?: string }>;
  }>(`/api/@${b.handle}/inbox?all=1`, b.apiKey);
  const notes = vanityInbox.data.messages ?? vanityInbox.data.inbox ?? [];
  const texts = notes.map((row) => row.text);
  if (!texts.includes("hey from vanity") || !texts.includes("hey from a2a rest") || !texts.includes("hey from a2a rpc")) {
    throw new Error(`Inbox missing say/A2A messages: ${JSON.stringify(vanityInbox.data)}`);
  }
  console.log(`   cards 200 · A2A rest+rpc in inbox (${notes.length} notes)`);

  console.log("9. Mail pipe: unread inbox → ack + webhook + setup");
  const unread = await get<{
    ok?: boolean;
    messages?: Array<{ id?: string; from?: string; text?: string; at?: string }>;
  }>(`/api/@${b.handle}/inbox`, b.apiKey);
  const unreadNotes = unread.data.messages ?? [];
  const pipeNote = unreadNotes.find((row) => row.text === "hey from vanity");
  if (!pipeNote?.id || !pipeNote.from || !pipeNote.at) {
    throw new Error(`Unread inbox missing pipe shape: ${JSON.stringify(unread.data)}`);
  }
  const acked = await post<{ ok?: boolean; id?: string }>(
    `/api/@${b.handle}/inbox/${pipeNote.id}/ack`,
    {},
    b.apiKey,
  );
  if (acked.status !== 200 || acked.data.id !== pipeNote.id) {
    throw new Error(`Ack failed: ${acked.status} ${JSON.stringify(acked.data)}`);
  }
  const unreadAfter = await get<{ messages?: Array<{ id?: string }> }>(`/api/@${b.handle}/inbox`, b.apiKey);
  if ((unreadAfter.data.messages ?? []).some((row) => row.id === pipeNote.id)) {
    throw new Error("Acked message still in unread inbox");
  }

  const setup = await post<{
    ok?: boolean;
    handle?: string;
    token?: string;
    urls?: { inbox?: string; update?: string };
  }>("/api/setup", { code: b.apiKey });
  if (setup.status !== 200 || setup.data.handle !== `@${b.handle}` || !setup.data.urls?.inbox) {
    throw new Error(`Setup failed: ${setup.status} ${JSON.stringify(setup.data)}`);
  }

  const { createServer } = await import("node:http");
  const hooks: unknown[] = [];
  const hookServer = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        hooks.push(JSON.parse(raw));
      } catch {
        hooks.push(raw);
      }
      res.writeHead(200);
      res.end("ok");
    });
  });
  const hookPort = await new Promise<number>((resolve) => {
    hookServer.listen(0, "127.0.0.1", () => {
      const addr = hookServer.address();
      resolve(typeof addr === "object" && addr ? addr.port : 0);
    });
  });
  const hookUrl = `http://127.0.0.1:${hookPort}/hook`;
  const hooked = await post<{ ok?: boolean; webhook?: string }>(
    `/api/@${b.handle}/webhook`,
    { url: hookUrl },
    b.apiKey,
  );
  if (hooked.status !== 200 || hooked.data.webhook !== hookUrl) {
    hookServer.close();
    throw new Error(`Webhook set failed: ${hooked.status} ${JSON.stringify(hooked.data)}`);
  }
  const ping = await post<{ id?: string }>(`/api/@${b.handle}/say`, { text: "webhook ping" }, a.apiKey);
  if (!ping.data.id) {
    hookServer.close();
    throw new Error(`Webhook ping say failed: ${JSON.stringify(ping)}`);
  }
  const started = Date.now();
  while (hooks.length === 0 && Date.now() - started < 2500) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  hookServer.close();
  const delivered = JSON.stringify(hooks);
  if (!delivered.includes("webhook ping")) {
    throw new Error(`Webhook did not fire: ${delivered}`);
  }

  console.log("10. Feed update + /did text");
  const voice = await post<{ ok?: boolean; id?: string; text?: string }>(
    `/api/@${b.handle}/update`,
    { text: "happy-path voice update" },
    b.apiKey,
  );
  if (voice.status !== 201 || voice.data.text !== "happy-path voice update") {
    throw new Error(`Update failed: ${voice.status} ${JSON.stringify(voice.data)}`);
  }
  const didFeed = await post<{ ok?: boolean }>(
    `/api/@${b.handle}/did`,
    { did: "shipped the pipe", text: "happy-path did on the feed" },
    b.apiKey,
  );
  if (![200, 201].includes(didFeed.status) || didFeed.data.ok !== true) {
    throw new Error(`Did+text failed: ${didFeed.status} ${JSON.stringify(didFeed.data)}`);
  }
  const firehose = await get<{ updates?: Array<{ text?: string; from?: string }> }>("/api/feed");
  const feedTexts = (firehose.data.updates ?? []).map((row) => row.text);
  if (!feedTexts.includes("happy-path voice update") || !feedTexts.includes("happy-path did on the feed")) {
    throw new Error(`Feed missing updates: ${JSON.stringify(firehose.data)}`);
  }
  const feedPage = await fetch(`${BASE}/feed`);
  const feedHtml = await feedPage.text();
  if (feedPage.status !== 200 || !feedHtml.includes("What bots are saying") || !feedHtml.includes("happy-path voice update")) {
    throw new Error("Feed page missing the firehose");
  }

  console.log("11. How it works + catalog + connect");
  const home = await fetch(`${BASE}/`);
  const how = await fetch(`${BASE}/how-it-works`);
  const about = await fetch(`${BASE}/about`);
  const ways = await fetch(`${BASE}/ways`);
  const connect = await fetch(`${BASE}/connect`);
  const skill = await fetch(`${BASE}/skill.md`);
  const portfolio = await fetch(`${BASE}/u/brennen`);
  if (home.status !== 200) throw new Error(`home ${home.status}`);
  const homeHtml = await home.text();
  if (
    !homeHtml.includes("Beautiful pages") ||
    !homeHtml.includes("Home for your bots") ||
    !homeHtml.includes("Bots will get their own phone number") ||
    !homeHtml.includes("crypto wallets") ||
    !homeHtml.includes("An experiment on A2A") ||
    !homeHtml.includes("A2A under the hood, simple API on top") ||
    !homeHtml.includes("Claim your name") ||
    !homeHtml.includes("Pick a name") ||
    !homeHtml.includes("@demo") ||
    homeHtml.includes("chief of staff") ||
    !homeHtml.includes("botpages.co/@kindling") ||
    !homeHtml.includes("botpages.co/@flint") ||
    !homeHtml.includes("botpages.co/@iris") ||
    !homeHtml.includes("botpages.co/@ivy") ||
    homeHtml.includes("Get a free name") ||
    homeHtml.includes("Half price for early birds") ||
    homeHtml.includes("Stop being your bot") ||
    homeHtml.includes("No human in the middle") ||
    homeHtml.includes("Get your bot a number")
  ) {
    throw new Error("homepage is missing the Bot Pages landing");
  }
  if (how.status !== 200) throw new Error(`how-it-works ${how.status}`);
  if (about.status !== 200) throw new Error(`about ${about.status}`);
  if (ways.status !== 200) throw new Error(`ways ${ways.status}`);
  if (connect.status !== 200) throw new Error(`connect ${connect.status}`);
  if (skill.status !== 200) throw new Error(`skill.md ${skill.status}`);
  const howHtml = await how.text();
  const aboutHtml = await about.text();
  const waysHtml = await ways.text();
  const connectHtml = await connect.text();
  const skillText = await skill.text();
  if (!howHtml.includes("Your bot gets a number") || !howHtml.includes("Agent Card")) {
    throw new Error("how-it-works is missing the simple story");
  }
  if (
    !aboutHtml.includes("Give them a body") ||
    !aboutHtml.includes("What A2A is") ||
    !aboutHtml.includes("Where it stands") ||
    !aboutHtml.includes("Azure AI Foundry") ||
    !aboutHtml.includes("This is the start")
  ) {
    throw new Error("about page is missing the manifesto");
  }
  const botsPage = await fetch(`${BASE}/bots`);
  const botsHtml = await botsPage.text();
  const botListing = await fetch(`${BASE}/be-happier`);
  const botListingHtml = await botListing.text();
  if (botsPage.status !== 200) throw new Error(`bots directory ${botsPage.status}`);
  if (botListing.status !== 200) throw new Error(`bot listing ${botListing.status}`);
  if (
    !botsHtml.includes("Bots.") ||
    botsHtml.includes("Connect first") ||
    !botsHtml.includes("Hacker News")
  ) {
    throw new Error("bots directory is missing the listing");
  }
  if (waysHtml.includes("Connect first") || !waysHtml.includes("Bots.")) {
    throw new Error("/ways should land on the bots directory");
  }
  if (
    botListingHtml.includes("Claim this bot") ||
    !botListingHtml.includes("Invite on X") ||
    !botListingHtml.includes("Add to Grok Bot") ||
    !botListingHtml.includes("View post on X")
  ) {
    throw new Error("bot listing is missing invite / add CTAs");
  }
  if (
    !connectHtml.includes("Give this to your bot") ||
    !connectHtml.includes("Sign in to get your paste") ||
    !connectHtml.includes("/login?next=/dashboard")
  ) {
    throw new Error("connect page is missing the signed-out paste CTA");
  }
  if (
    !skillText.includes("Already claimed") ||
    !skillText.includes("Say hi to @demo") ||
    !skillText.includes("Agent Card URL") ||
    !skillText.includes("Do not install a CLI") ||
    !skillText.includes("/update") ||
    !skillText.includes("/inbox/{id}/ack")
  ) {
    throw new Error("skill.md is missing the connect-now steps");
  }
  if (portfolio.status !== 200) throw new Error(`portfolio ${portfolio.status}`);
  const portfolioHtml = await portfolio.text();
  if (
    !portfolioHtml.includes("Brennen") ||
    !portfolioHtml.includes("Built by") ||
    !portfolioHtml.includes("@demo") ||
    !portfolioHtml.includes("For humans")
  ) {
    throw new Error("human portfolio is missing the Brennen look-pass");
  }

  console.log("\nHappy path passed.");
  console.log(`A: /${a.handle}`);
  console.log(`B: /${b.handle}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
