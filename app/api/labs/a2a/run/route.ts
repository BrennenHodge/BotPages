import { NextResponse } from "next/server";
import { originFromRequest } from "@/lib/origin";
import { clearLabWebhooks, listLabWebhooks } from "@/lib/a2a-lab-webhook";

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
};

function baseUrl(req: Request) {
  // Prefer localhost so lab proves the app process; fall back to public origin.
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
    body: JSON.stringify({ jsonrpc: "2.0", id: `lab-${method}`, method, params }),
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

async function timed(name: string, fn: () => Promise<{ ok: boolean; detail: string; sample?: unknown }>): Promise<StepResult> {
  const t0 = Date.now();
  try {
    const out = await fn();
    return { name, ok: out.ok, detail: out.detail, ms: Date.now() - t0, sample: out.sample };
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
  let body: { suite?: string; step?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const suite = body.suite || body.step || "all";
  const base = baseUrl(request);
  const pub = publicOrigin(request);
  const results: StepResult[] = [];

  const want = (id: string) => suite === "all" || suite === id;

  if (want("discover")) {
    results.push(
      await timed("Discover identity (@demo + @atlas)", async () => {
        const demo = await fetch(`${base}/@demo/.identity`);
        const atlas = await fetch(`${base}/@atlas/.identity`);
        const demoWell = await fetch(`${base}/@demo/.well-known/agent-card.json`);
        const demoCard = (await demo.json()) as { capabilities?: { streaming?: boolean; pushNotifications?: boolean }; protocolVersion?: string };
        const atlasCard = (await atlas.json()) as { capabilities?: { streaming?: boolean } };
        const ok =
          demo.ok &&
          atlas.ok &&
          demoWell.ok &&
          demoCard.capabilities?.streaming === true &&
          demoCard.capabilities?.pushNotifications === true &&
          atlasCard.capabilities?.streaming === true;
        return {
          ok,
          detail: ok
            ? `demo+atlas .identity OK · well-known=${demoWell.status} · streaming=${demoCard.capabilities?.streaming} · protocol=${demoCard.protocolVersion}`
            : `demo=${demo.status} atlas=${atlas.status} wellKnown=${demoWell.status} streaming=${demoCard.capabilities?.streaming}`,
          sample: {
            demo: { streaming: demoCard.capabilities?.streaming, push: demoCard.capabilities?.pushNotifications, identity: "/@demo/.identity" },
            atlas: { streaming: atlasCard.capabilities?.streaming },
          },
        };
      }),
    );
  }

  let atlasTaskId = "";
  let atlasContextId = "";

  if (want("send") || want("get") || want("list") || want("all")) {
    results.push(
      await timed("SendMessage → Task + artifact (@atlas)", async () => {
        const res = await rpc(base, "atlas", SEED_KEYS.demo, "message/send", {
          message: {
            role: "ROLE_USER",
            messageId: `lab-send-${Date.now()}`,
            parts: [{ text: "research brief on A2A streaming for Bot Pages", mediaType: "text/plain" }],
            metadata: { skill: "research" },
          },
        });
        const result = (res.json as { result?: { id?: string; contextId?: string; artifacts?: unknown[]; status?: { state?: string } } })?.result;
        atlasTaskId = result?.id || "";
        atlasContextId = result?.contextId || "";
        const hasArt = Array.isArray(result?.artifacts) && result!.artifacts!.length > 0;
        const ok = res.status === 200 && result?.status?.state === "TASK_STATE_COMPLETED" && hasArt;
        return {
          ok,
          detail: ok
            ? `task ${atlasTaskId} completed with ${result!.artifacts!.length} artifact(s)`
            : snip(res.json),
          sample: result,
        };
      }),
    );
  }

  if (want("get") || want("all")) {
    results.push(
      await timed("GetTask", async () => {
        if (!atlasTaskId) {
          // create one
          const res = await rpc(base, "atlas", SEED_KEYS.demo, "message/send", {
            message: { role: "ROLE_USER", parts: [{ text: "quick gettask seed" }], messageId: `g-${Date.now()}` },
          });
          atlasTaskId = (res.json as { result?: { id?: string } })?.result?.id || "";
        }
        const res = await rpc(base, "atlas", SEED_KEYS.demo, "tasks/get", { id: atlasTaskId });
        const result = (res.json as { result?: { id?: string; status?: { state?: string } } })?.result;
        const ok = res.status === 200 && result?.id === atlasTaskId;
        return {
          ok,
          detail: ok ? `got ${result?.id} state=${result?.status?.state}` : snip(res.json),
          sample: result,
        };
      }),
    );
  }

  if (want("list") || want("all")) {
    results.push(
      await timed("ListTasks", async () => {
        const res = await rpc(base, "atlas", SEED_KEYS.demo, "tasks/list", {
          pageSize: 5,
          ...(atlasContextId ? { contextId: atlasContextId } : {}),
        });
        const result = (res.json as { result?: { tasks?: unknown[]; pageSize?: number } })?.result;
        const ok = res.status === 200 && Array.isArray(result?.tasks);
        return {
          ok,
          detail: ok ? `listed ${result!.tasks!.length} task(s)` : snip(res.json),
          sample: { count: result?.tasks?.length, pageSize: result?.pageSize },
        };
      }),
    );
  }

  if (want("multiturn") || want("all")) {
    results.push(
      await timed("Multi-turn INPUT_REQUIRED (@demo a2a:book)", async () => {
        const book = await rpc(base, "demo", SEED_KEYS.atlas, "message/send", {
          message: {
            role: "ROLE_USER",
            messageId: `book-${Date.now()}`,
            parts: [{ text: "a2a:book" }],
          },
        });
        const bookTask = (book.json as { result?: { id?: string; status?: { state?: string }; contextId?: string } })?.result;
        if (bookTask?.status?.state !== "TASK_STATE_INPUT_REQUIRED" || !bookTask.id) {
          return { ok: false, detail: `expected INPUT_REQUIRED, got ${snip(book.json)}`, sample: book.json };
        }
        const follow = await rpc(base, "demo", SEED_KEYS.atlas, "message/send", {
          message: {
            role: "ROLE_USER",
            taskId: bookTask.id,
            contextId: bookTask.contextId,
            messageId: `book-follow-${Date.now()}`,
            parts: [{ text: "Tuesday 3pm on Zoom" }],
          },
        });
        const done = (follow.json as { result?: { status?: { state?: string }; artifacts?: unknown[] } })?.result;
        const ok = done?.status?.state === "TASK_STATE_COMPLETED" && Array.isArray(done.artifacts) && done.artifacts.length > 0;
        return {
          ok,
          detail: ok
            ? `booked via ${bookTask.id} → COMPLETED with artifact`
            : snip(follow.json),
          sample: { book: bookTask, done },
        };
      }),
    );
  }

  if (want("cancel") || want("all")) {
    results.push(
      await timed("Working + CancelTask (@demo a2a:work)", async () => {
        const work = await rpc(base, "demo", SEED_KEYS.atlas, "message/send", {
          message: {
            role: "ROLE_USER",
            messageId: `work-${Date.now()}`,
            parts: [{ text: "a2a:work" }],
          },
        });
        const workTask = (work.json as { result?: { id?: string; status?: { state?: string } } })?.result;
        if (workTask?.status?.state !== "TASK_STATE_WORKING" || !workTask.id) {
          return { ok: false, detail: `expected WORKING, got ${snip(work.json)}`, sample: work.json };
        }
        const cancel = await rpc(base, "demo", SEED_KEYS.atlas, "tasks/cancel", { id: workTask.id });
        const canceled = (cancel.json as { result?: { status?: { state?: string } } })?.result;
        const ok = canceled?.status?.state === "TASK_STATE_CANCELED";
        return {
          ok,
          detail: ok ? `canceled ${workTask.id}` : snip(cancel.json),
          sample: { work: workTask, canceled },
        };
      }),
    );
  }

  if (want("stream") || want("all")) {
    results.push(
      await timed("Streaming message/stream", async () => {
        const res = await rpc(
          base,
          "atlas",
          SEED_KEYS.demo,
          "message/stream",
          {
            message: {
              role: "ROLE_USER",
              messageId: `stream-${Date.now()}`,
              parts: [{ text: "stream me a research brief on SSE" }],
              metadata: { skill: "research" },
            },
          },
          { stream: true },
        );
        const events = (res.raw || "")
          .split("\n")
          .filter((l) => l.startsWith("data: ") && !l.includes("[DONE]"));
        const ok = res.status === 200 && res.ct.includes("text/event-stream") && events.length >= 2;
        return {
          ok,
          detail: ok
            ? `SSE ${events.length} events · ct=${res.ct}`
            : `status=${res.status} ct=${res.ct} events=${events.length} body=${snip(res.raw)}`,
          sample: events.slice(0, 4).map((e) => snip(e, 160)),
        };
      }),
    );
  }

  if (want("push") || want("all")) {
    results.push(
      await timed("Push config create/list/delete + deliver", async () => {
        await clearLabWebhooks();
        // create a working shell via a2a:work then attach push
        const work = await rpc(base, "demo", SEED_KEYS.atlas, "message/send", {
          message: { role: "ROLE_USER", parts: [{ text: "a2a:work" }], messageId: `push-work-${Date.now()}` },
        });
        const taskId = (work.json as { result?: { id?: string } })?.result?.id;
        if (!taskId) return { ok: false, detail: `no task for push: ${snip(work.json)}` };

        const webhookUrl = `${base}/api/labs/a2a/webhook`;
        const created = await rpc(base, "demo", SEED_KEYS.atlas, "tasks/pushNotificationConfig/set", {
          id: taskId,
          config: {
            url: webhookUrl,
            authentication: { schemes: ["bearer"], credentials: "lab-token" },
          },
        });
        const cfgId = (created.json as { result?: { id?: string } })?.result?.id;
        const listed = await rpc(base, "demo", SEED_KEYS.atlas, "tasks/pushNotificationConfig/list", { id: taskId });
        const configs = (listed.json as { result?: { configs?: unknown[] } })?.result?.configs;

        // finish task to trigger push
        const finish = await rpc(base, "demo", SEED_KEYS.atlas, "message/send", {
          message: {
            role: "ROLE_USER",
            taskId,
            parts: [{ text: "a2a:finish" }],
            messageId: `push-finish-${Date.now()}`,
          },
        });

        // brief wait for async push
        await new Promise((r) => setTimeout(r, 400));
        const hooks = await listLabWebhooks(5);

        const deleted = cfgId
          ? await rpc(base, "demo", SEED_KEYS.atlas, "tasks/pushNotificationConfig/delete", {
              id: taskId,
              configId: cfgId,
            })
          : null;

        const ok =
          Boolean(cfgId) &&
          Array.isArray(configs) &&
          configs.length > 0 &&
          (finish.json as { result?: { status?: { state?: string } } })?.result?.status?.state ===
            "TASK_STATE_COMPLETED" &&
          hooks.length > 0 &&
          (deleted ? (deleted.json as { result?: { deleted?: boolean } })?.result?.deleted === true : true);

        return {
          ok,
          detail: ok
            ? `push cfg ${cfgId} · delivered ${hooks.length} · deleted=${Boolean(cfgId)}`
            : `cfg=${cfgId} hooks=${hooks.length} finish=${snip(finish.json)}`,
          sample: { cfgId, configs, hooks: hooks.slice(0, 1), deleted: deleted?.json },
        };
      }),
    );
  }

  if (want("errors") || want("all")) {
    results.push(
      await timed("Version / unsupported / content-type errors", async () => {
        const badVer = await rpc(
          base,
          "demo",
          SEED_KEYS.atlas,
          "message/send",
          { message: { role: "ROLE_USER", parts: [{ text: "x" }] } },
          { version: "2.0" },
        );
        const badMethod = await rpc(base, "demo", SEED_KEYS.atlas, "totally/unknown", {});
        const badCt = await rpc(base, "demo", SEED_KEYS.atlas, "message/send", {
          message: {
            role: "ROLE_USER",
            parts: [{ text: "clip", mediaType: "video/mp4" }],
            messageId: `ct-${Date.now()}`,
          },
        });
        const vCode = (badVer.json as { error?: { code?: number } })?.error?.code;
        const mCode = (badMethod.json as { error?: { code?: number } })?.error?.code;
        const cCode = (badCt.json as { error?: { code?: number } })?.error?.code;
        const ok = vCode === -32009 && mCode === -32601 && cCode === -32005;
        return {
          ok,
          detail: ok
            ? `version=-32009 method=-32601 content=-32005`
            : `v=${vCode} m=${mCode} c=${cCode}`,
          sample: { badVer: badVer.json, badMethod: badMethod.json, badCt: badCt.json },
        };
      }),
    );
  }

  if (want("matrix") || want("all")) {
    results.push(
      await timed("Bot↔bot matrix (atlas→demo, cobot→scribe, pixie→ferry)", async () => {
        const pairs: Array<[string, string, string]> = [
          ["atlas", "demo", SEED_KEYS.atlas],
          ["cobot", "scribe", SEED_KEYS.cobot],
          ["pixie", "ferry", SEED_KEYS.pixie],
        ];
        const samples: unknown[] = [];
        let allOk = true;
        for (const [from, to, key] of pairs) {
          const res = await rpc(base, to, key, "message/send", {
            message: {
              role: "ROLE_USER",
              messageId: `mx-${from}-${to}-${Date.now()}`,
              parts: [{ text: `lab matrix hello from @${from} to @${to}` }],
            },
          });
          const result = (res.json as { result?: { id?: string; contextId?: string; status?: { state?: string }; artifacts?: unknown[] } })?.result;
          const thread = result?.contextId ? `${pub}/@${to}?thread=${result.contextId}` : null;
          const ok = res.status === 200 && result?.status?.state === "TASK_STATE_COMPLETED";
          if (!ok) allOk = false;
          samples.push({ from, to, ok, taskId: result?.id, thread, artifacts: result?.artifacts?.length ?? 0 });
        }
        return {
          ok: allOk,
          detail: allOk ? "3/3 matrix sends completed with artifacts" : snip(samples),
          sample: samples,
        };
      }),
    );
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  return NextResponse.json({
    ok: failed === 0,
    suite,
    base,
    publicOrigin: pub,
    passed,
    failed,
    total: results.length,
    results,
  });
}
