import { NextResponse } from "next/server";
import { originFromRequest } from "@/lib/origin";
import { stripAt } from "@/lib/pretty";

export const runtime = "nodejs";

const SEED_KEYS: Record<string, string> = {
  demo: "cb_live_seed_demo_aaaaaaaaaaaaaaaaaaaaaaaa",
  atlas: "cb_live_seed_atlas_bbbbbbbbbbbbbbbbbbbbbbbb",
  cobot: "cb_live_seed_cobot_cccccccccccccccccccccccc",
  scribe: "cb_live_seed_scribe_dddddddddddddddddddddddd",
  ferry: "cb_live_seed_ferry_eeeeeeeeeeeeeeeeeeeeeeee",
  pixie: "cb_live_seed_pixie_ffffffffffffffffffffffff",
  nori: "cb_live_seed_nori_gggggggggggggggggggggggg",
  zest: "cb_live_seed_zest_hhhhhhhhhhhhhhhhhhhhhhhh",
};

type StepResult = {
  name: string;
  ok: boolean;
  detail: string;
  ms: number;
  sample?: unknown;
  soft?: boolean;
};

function baseUrl() {
  const envPort = process.env.PORT || "3001";
  return `http://127.0.0.1:${envPort}`;
}

function publicOrigin(req: Request) {
  try {
    return originFromRequest(req);
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || "https://preview.botpages.co";
  }
}

function senderFor(target: string): { from: string; key: string } {
  if (target === "atlas") return { from: "demo", key: SEED_KEYS.demo };
  return { from: "atlas", key: SEED_KEYS.atlas };
}

async function rpc(
  base: string,
  handle: string,
  key: string,
  method: string,
  params: Record<string, unknown>,
  opts: { version?: string; stream?: boolean } = {},
) {
  const headers: Record<string, string> = {
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    "a2a-version": opts.version ?? "1.0",
    accept: opts.stream ? "text/event-stream" : "application/json",
  };
  const res = await fetch(`${base}/a2a/@${handle}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: `try-${method}`, method, params }),
  });
  const ct = res.headers.get("content-type") || "";
  if (opts.stream || ct.includes("text/event-stream")) {
    const text = await res.text();
    return { status: res.status, ct, raw: text, json: null as unknown };
  }
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, ct, raw: "", json };
}

function snip(value: unknown, n = 280): string {
  const s = typeof value === "string" ? value : JSON.stringify(value);
  if (!s) return "";
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

async function timed(
  name: string,
  fn: () => Promise<{ ok: boolean; detail: string; sample?: unknown; soft?: boolean }>,
): Promise<StepResult> {
  const t0 = Date.now();
  try {
    const out = await fn();
    return { name, ok: out.ok, detail: out.detail, ms: Date.now() - t0, sample: out.sample, soft: out.soft };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      ms: Date.now() - t0,
    };
  }
}

export async function POST(request: Request) {
  let body: { handle?: string; step?: string; suite?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const handle = stripAt(body.handle || "").toLowerCase();
  const step = body.step || body.suite || "card";
  if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
    return NextResponse.json({ ok: false, error: "handle required" }, { status: 400 });
  }

  const base = baseUrl();
  const pub = publicOrigin(request);
  const { from, key } = senderFor(handle);
  const results: StepResult[] = [];

  if (step === "card" || step === "discover") {
    results.push(
      await timed(`Look up identity (@${handle})`, async () => {
        const res = await fetch(`${base}/@${handle}/.identity`);
        const card = (await res.json().catch(() => null)) as {
          protocolVersion?: string;
          name?: string;
          capabilities?: { streaming?: boolean };
          simple?: { identity?: string };
        } | null;
        const ok = res.ok && Boolean(card?.protocolVersion);
        return {
          ok,
          detail: ok
            ? `${card?.name || handle} · protocol=${card?.protocolVersion} · streaming=${card?.capabilities?.streaming}`
            : `status=${res.status} ${snip(card)}`,
          sample: {
            protocolVersion: card?.protocolVersion,
            name: card?.name,
            identity: `/@${handle}/.identity`,
            streaming: card?.capabilities?.streaming,
          },
        };
      }),
    );
  }

  let taskId = "";
  let contextId = "";

  if (step === "send") {
    results.push(
      await timed(`Send a job (@${from} → @${handle})`, async () => {
        const res = await rpc(base, handle, key, "message/send", {
          message: {
            role: "ROLE_USER",
            messageId: `try-send-${Date.now()}`,
            parts: [{ text: `hello from @${from} — try panel on @${handle}`, mediaType: "text/plain" }],
          },
        });
        const result = (res.json as { result?: { id?: string; contextId?: string; status?: { state?: string }; artifacts?: unknown[] } })?.result;
        taskId = result?.id || "";
        contextId = result?.contextId || "";
        const ok = res.status === 200 && Boolean(result?.id);
        return {
          ok,
          detail: ok
            ? `task ${result?.id} · state=${result?.status?.state}`
            : snip(res.json),
          sample: { taskId: result?.id, state: result?.status?.state, artifacts: result?.artifacts?.length ?? 0 },
        };
      }),
    );
  }

  if (step === "get") {
    results.push(
      await timed(`Check that job (GetTask @${handle})`, async () => {
        const created = await rpc(base, handle, key, "message/send", {
          message: {
            role: "ROLE_USER",
            messageId: `try-get-seed-${Date.now()}`,
            parts: [{ text: `gettask seed from @${from}` }],
          },
        });
        taskId = (created.json as { result?: { id?: string } })?.result?.id || "";
        if (!taskId) return { ok: false, detail: `could not create task: ${snip(created.json)}` };
        const res = await rpc(base, handle, key, "tasks/get", { id: taskId });
        const result = (res.json as { result?: { id?: string; status?: { state?: string } } })?.result;
        const ok = res.status === 200 && result?.id === taskId;
        return {
          ok,
          detail: ok ? `got ${result?.id} state=${result?.status?.state}` : snip(res.json),
          sample: result,
        };
      }),
    );
  }

  if (step === "list") {
    results.push(
      await timed(`List recent jobs (@${handle})`, async () => {
        const res = await rpc(base, handle, key, "tasks/list", { pageSize: 5 });
        const result = (res.json as { result?: { tasks?: unknown[]; pageSize?: number } })?.result;
        const ok = res.status === 200 && Array.isArray(result?.tasks);
        return {
          ok,
          detail: ok ? `listed ${result!.tasks!.length} recent job(s)` : snip(res.json),
          sample: { count: result?.tasks?.length, pageSize: result?.pageSize },
        };
      }),
    );
  }

  if (step === "multiturn" || step === "input") {
    results.push(
      await timed(
        handle === "demo"
          ? "Ask for more info (INPUT_REQUIRED @demo a2a:book)"
          : `Ask + check (message + GetTask @${handle})`,
        async () => {
          if (handle === "demo") {
            const book = await rpc(base, "demo", key, "message/send", {
              message: {
                role: "ROLE_USER",
                messageId: `try-book-${Date.now()}`,
                parts: [{ text: "a2a:book" }],
              },
            });
            const bookTask = (book.json as { result?: { id?: string; status?: { state?: string }; contextId?: string } })?.result;
            if (bookTask?.status?.state !== "TASK_STATE_INPUT_REQUIRED" || !bookTask.id) {
              return { ok: false, detail: `expected INPUT_REQUIRED, got ${snip(book.json)}`, sample: book.json };
            }
            const follow = await rpc(base, "demo", key, "message/send", {
              message: {
                role: "ROLE_USER",
                taskId: bookTask.id,
                contextId: bookTask.contextId,
                messageId: `try-book-follow-${Date.now()}`,
                parts: [{ text: "Tuesday 3pm on Zoom" }],
              },
            });
            const done = (follow.json as { result?: { status?: { state?: string }; artifacts?: unknown[] } })?.result;
            const ok =
              done?.status?.state === "TASK_STATE_COMPLETED" &&
              Array.isArray(done.artifacts) &&
              done.artifacts.length > 0;
            return {
              ok,
              detail: ok ? `booked via ${bookTask.id} → COMPLETED` : snip(follow.json),
              sample: { book: bookTask, done },
            };
          }

          const sent = await rpc(base, handle, key, "message/send", {
            message: {
              role: "ROLE_USER",
              messageId: `try-ask-${Date.now()}`,
              parts: [{ text: `quick question from @${from}: what can you do?` }],
            },
          });
          const result = (sent.json as { result?: { id?: string; status?: { state?: string } } })?.result;
          if (!result?.id) return { ok: false, detail: snip(sent.json), sample: sent.json };
          const got = await rpc(base, handle, key, "tasks/get", { id: result.id });
          const again = (got.json as { result?: { id?: string; status?: { state?: string } } })?.result;
          const ok = got.status === 200 && again?.id === result.id;
          return {
            ok,
            detail: ok
              ? `sent + fetched ${result.id} · state=${again?.status?.state} (INPUT_REQUIRED demo flow is @demo-only)`
              : snip(got.json),
            sample: { sent: result, got: again },
            soft: true,
          };
        },
      ),
    );
  }

  if (step === "cancel" || step === "work") {
    results.push(
      await timed(
        handle === "demo" ? "Start work + cancel (@demo a2a:work)" : `Cancel note (@${handle})`,
        async () => {
          if (handle !== "demo") {
            return {
              ok: true,
              soft: true,
              detail: `a2a:work cancel demo is @demo-only. On @${handle}, send a normal job then tasks/cancel if the bot leaves it WORKING.`,
              sample: { tip: `POST /a2a/@${handle} → tasks/cancel` },
            };
          }
          const work = await rpc(base, "demo", key, "message/send", {
            message: {
              role: "ROLE_USER",
              messageId: `try-work-${Date.now()}`,
              parts: [{ text: "a2a:work" }],
            },
          });
          const workTask = (work.json as { result?: { id?: string; status?: { state?: string } } })?.result;
          if (workTask?.status?.state !== "TASK_STATE_WORKING" || !workTask.id) {
            return { ok: false, detail: `expected WORKING, got ${snip(work.json)}`, sample: work.json };
          }
          const cancel = await rpc(base, "demo", key, "tasks/cancel", { id: workTask.id });
          const canceled = (cancel.json as { result?: { status?: { state?: string } } })?.result;
          const ok = canceled?.status?.state === "TASK_STATE_CANCELED";
          return {
            ok,
            detail: ok ? `canceled ${workTask.id}` : snip(cancel.json),
            sample: { work: workTask, canceled },
          };
        },
      ),
    );
  }

  if (step === "stream") {
    results.push(
      await timed(`Stream progress (@${handle})`, async () => {
        const res = await rpc(
          base,
          handle,
          key,
          "message/stream",
          {
            message: {
              role: "ROLE_USER",
              messageId: `try-stream-${Date.now()}`,
              parts: [{ text: `stream me a quick hello from @${from}` }],
            },
          },
          { stream: true },
        );
        const events = (res.raw || "")
          .split("\n")
          .filter((l) => l.startsWith("data: ") && !l.includes("[DONE]"));
        const ok = res.status === 200 && (res.ct.includes("text/event-stream") || events.length >= 1);
        return {
          ok,
          detail: ok
            ? `SSE ${events.length} event(s) · ct=${res.ct || "n/a"}`
            : `status=${res.status} ct=${res.ct} events=${events.length} body=${snip(res.raw)}`,
          sample: events.slice(0, 4).map((e) => snip(e, 160)),
        };
      }),
    );
  }

  if (results.length === 0) {
    return NextResponse.json(
      { ok: false, error: `unknown step: ${step}`, handle },
      { status: 400 },
    );
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  return NextResponse.json({
    ok: failed === 0,
    handle,
    step,
    from,
    base,
    publicOrigin: pub,
    urls: {
      identity: `/@${handle}/.identity`,
      botCard: `/@${handle}/bot-card.json`,
      wellKnown: `/@${handle}/.well-known/agent-card.json`,
      talk: `/a2a/@${handle}`,
      cardPage: `/@${handle}/card`,
      lab: "/labs/a2a",
    },
    passed,
    failed,
    total: results.length,
    results,
    contextId: contextId || undefined,
    taskId: taskId || undefined,
  });
}
