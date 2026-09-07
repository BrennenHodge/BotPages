import { execute, query, queryOne } from "./db";
import { makeId, nowIso } from "./ids";

export type A2aPushConfig = {
  id: string;
  url: string;
  authentication?: {
    schemes?: string[];
    credentials?: string;
  };
};

export type StoredA2aTaskRow = {
  id: string;
  bot_id: string;
  context_id: string;
  state: string;
  history_json: string;
  artifacts_json: string;
  status_message_json: string | null;
  push_configs_json: string;
  metadata_json: string;
  created_at: string;
  updated_at: string;
};

export type UpsertTaskInput = {
  id?: string;
  bot_id: string;
  context_id: string;
  state: string;
  history?: unknown[];
  artifacts?: unknown[];
  status_message?: unknown | null;
  push_configs?: A2aPushConfig[];
  metadata?: Record<string, unknown>;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function rowToTaskParts(row: StoredA2aTaskRow) {
  return {
    id: row.id,
    bot_id: row.bot_id,
    context_id: row.context_id,
    state: row.state,
    history: parseJson<unknown[]>(row.history_json, []),
    artifacts: parseJson<unknown[]>(row.artifacts_json, []),
    status_message: row.status_message_json
      ? parseJson<unknown>(row.status_message_json, null)
      : null,
    push_configs: parseJson<A2aPushConfig[]>(row.push_configs_json, []),
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function upsertTask(input: UpsertTaskInput) {
  const now = nowIso();
  const id = input.id || makeId("task");
  const existing = await getTaskRow(id);
  const history = input.history ?? (existing ? parseJson(existing.history_json, []) : []);
  const artifacts = input.artifacts ?? (existing ? parseJson(existing.artifacts_json, []) : []);
  const pushConfigs =
    input.push_configs ?? (existing ? parseJson(existing.push_configs_json, []) : []);
  const metadata = input.metadata ?? (existing ? parseJson(existing.metadata_json, {}) : {});
  const statusMessage =
    input.status_message === undefined
      ? existing?.status_message_json ?? null
      : input.status_message == null
        ? null
        : JSON.stringify(input.status_message);

  if (existing) {
    await execute(
      `UPDATE a2a_tasks SET
        bot_id = ?, context_id = ?, state = ?, history_json = ?, artifacts_json = ?,
        status_message_json = ?, push_configs_json = ?, metadata_json = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.bot_id,
        input.context_id,
        input.state,
        JSON.stringify(history),
        JSON.stringify(artifacts),
        statusMessage,
        JSON.stringify(pushConfigs),
        JSON.stringify(metadata),
        now,
        id,
      ],
    );
  } else {
    await execute(
      `INSERT INTO a2a_tasks (
        id, bot_id, context_id, state, history_json, artifacts_json,
        status_message_json, push_configs_json, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.bot_id,
        input.context_id,
        input.state,
        JSON.stringify(history),
        JSON.stringify(artifacts),
        statusMessage,
        JSON.stringify(pushConfigs),
        JSON.stringify(metadata),
        now,
        now,
      ],
    );
  }

  const row = await getTaskRow(id);
  return row ? rowToTaskParts(row) : null;
}

export async function getTaskRow(id: string) {
  return queryOne<StoredA2aTaskRow>("SELECT * FROM a2a_tasks WHERE id = ?", [id]);
}

export async function getTask(id: string) {
  const row = await getTaskRow(id);
  return row ? rowToTaskParts(row) : null;
}

export async function listTasksForBot(
  botId: string,
  opts: {
    contextId?: string;
    state?: string;
    pageSize?: number;
    nextPageToken?: string;
  } = {},
) {
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 50));
  const args: Array<string | number> = [botId];
  let sql = `SELECT * FROM a2a_tasks WHERE bot_id = ?`;
  if (opts.contextId) {
    sql += ` AND context_id = ?`;
    args.push(opts.contextId);
  }
  if (opts.state) {
    sql += ` AND state = ?`;
    args.push(opts.state);
  }
  if (opts.nextPageToken) {
    sql += ` AND updated_at < ?`;
    args.push(opts.nextPageToken);
  }
  sql += ` ORDER BY updated_at DESC LIMIT ?`;
  args.push(pageSize + 1);

  const rows = await query<StoredA2aTaskRow>(sql, args);
  const hasMore = rows.length > pageSize;
  const page = hasMore ? rows.slice(0, pageSize) : rows;
  const nextPageToken = hasMore ? page[page.length - 1]?.updated_at ?? "" : "";
  return {
    tasks: page.map(rowToTaskParts),
    nextPageToken,
    pageSize,
    totalSize: page.length,
  };
}

export async function updateTaskState(
  id: string,
  state: string,
  extras: {
    status_message?: unknown | null;
    artifacts?: unknown[];
    history?: unknown[];
    metadata?: Record<string, unknown>;
  } = {},
) {
  const existing = await getTask(id);
  if (!existing) return null;
  return upsertTask({
    id,
    bot_id: existing.bot_id,
    context_id: existing.context_id,
    state,
    history: extras.history ?? existing.history,
    artifacts: extras.artifacts ?? existing.artifacts,
    status_message:
      extras.status_message === undefined ? existing.status_message : extras.status_message,
    push_configs: existing.push_configs,
    metadata: extras.metadata ?? existing.metadata,
  });
}

export async function addPushConfig(taskId: string, config: Omit<A2aPushConfig, "id"> & { id?: string }) {
  const existing = await getTask(taskId);
  if (!existing) return null;
  const entry: A2aPushConfig = {
    id: config.id || makeId("push"),
    url: config.url,
    ...(config.authentication ? { authentication: config.authentication } : {}),
  };
  const push_configs = [...existing.push_configs.filter((c) => c.id !== entry.id), entry];
  await upsertTask({
    id: taskId,
    bot_id: existing.bot_id,
    context_id: existing.context_id,
    state: existing.state,
    history: existing.history,
    artifacts: existing.artifacts,
    status_message: existing.status_message,
    push_configs,
    metadata: existing.metadata,
  });
  return entry;
}

export async function getPushConfig(taskId: string, configId: string) {
  const existing = await getTask(taskId);
  if (!existing) return null;
  return existing.push_configs.find((c) => c.id === configId) ?? null;
}

export async function listPushConfigs(taskId: string) {
  const existing = await getTask(taskId);
  return existing?.push_configs ?? [];
}

export async function deletePushConfig(taskId: string, configId: string) {
  const existing = await getTask(taskId);
  if (!existing) return false;
  const next = existing.push_configs.filter((c) => c.id !== configId);
  if (next.length === existing.push_configs.length) return false;
  await upsertTask({
    id: taskId,
    bot_id: existing.bot_id,
    context_id: existing.context_id,
    state: existing.state,
    history: existing.history,
    artifacts: existing.artifacts,
    status_message: existing.status_message,
    push_configs: next,
    metadata: existing.metadata,
  });
  return true;
}
