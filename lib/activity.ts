import { EVENT_CATALOG, getEventType } from "./catalog";
import { addDays, eachDay, utcDay } from "./dates";
import { query } from "./db";
import { listEvents, listEventsSince } from "./events";

type AggRow = { bot_id: string; score: number };

export async function getTotalScores() {
  const rows = await query<AggRow>("SELECT bot_id, COALESCE(SUM(points), 0) as score FROM events GROUP BY bot_id");
  return new Map(rows.map((row) => [row.bot_id, Number(row.score)]));
}

export async function getSocialCounts(botId: string) {
  const [followers] = await query<{ n: number }>(
    "SELECT COUNT(*) as n FROM follows WHERE followee_bot_id = ?",
    [botId],
  );
  const [friends] = await query<{ n: number }>(
    `SELECT COUNT(*) as n FROM follows a
     JOIN follows b ON a.followee_bot_id = b.follower_bot_id AND a.follower_bot_id = b.followee_bot_id
     WHERE a.follower_bot_id = ?`,
    [botId],
  );
  return {
    followers: Number(followers?.n ?? 0),
    friends: Number(friends?.n ?? 0),
  };
}

function currentStreak(daysWithEvents: Set<string>, today: string) {
  let cursor = daysWithEvents.has(today) ? today : addDays(today, -1);
  if (!daysWithEvents.has(cursor)) return 0;
  let streak = 0;
  while (daysWithEvents.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function getActivity(botId: string) {
  const today = utcDay();
  const yearStart = addDays(today, -364);
  const weekStart = addDays(today, -6);
  const chartStart = addDays(today, -59);
  const events = await listEventsSince(botId, yearStart);
  const scores = await getTotalScores();
  const social = await getSocialCounts(botId);
  const publicScores = await query<{ n: number }>(
    `SELECT COUNT(*) as n FROM bots b
     LEFT JOIN (SELECT bot_id, SUM(points) as score FROM events GROUP BY bot_id) s ON s.bot_id = b.id
     WHERE b.is_public = 1 AND COALESCE(s.score, 0) > ?`,
    [scores.get(botId) ?? 0],
  );
  const publicTotal = await query<{ n: number }>("SELECT COUNT(*) as n FROM bots WHERE is_public = 1");

  const byDay = new Map<string, { points: number; count: number; events: number }>();
  const byType = new Map<string, { count: number; points: number }>();
  let hours = 0;
  let weekPoints = 0;

  for (const event of events) {
    const spec = getEventType(event.type);
    hours += event.count * (spec?.hours_per_unit ?? 0);
    const day = utcDay(event.occurred_at);
    const bucket = byDay.get(day) ?? { points: 0, count: 0, events: 0 };
    bucket.points += event.points;
    bucket.count += event.count;
    bucket.events += 1;
    byDay.set(day, bucket);
    const typed = byType.get(event.type) ?? { count: 0, points: 0 };
    typed.count += event.count;
    typed.points += event.points;
    byType.set(event.type, typed);
    if (day >= weekStart) weekPoints += event.points;
  }

  const heatmapDays = eachDay(yearStart, today);
  const chartDays = eachDay(chartStart, today);
  const activeSet = new Set([...byDay.keys()]);

  const breakdown = EVENT_CATALOG.map((spec) => {
    const stats = byType.get(spec.type) ?? { count: 0, points: 0 };
    return { type: spec.type, label: spec.label, count: stats.count, points: stats.points };
  })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.points - a.points);

  const recent = (await listEvents(botId, 12)).map((event) => ({
    id: event.id,
    type: event.type,
    label: getEventType(event.type)?.label ?? event.type,
    count: event.count,
    points: event.points,
    occurred_at: event.occurred_at,
  }));

  const totalScore = scores.get(botId) ?? 0;

  return {
    stats: {
      total_score: totalScore,
      this_week: weekPoints,
      active_days: [...activeSet].filter((day) => day >= yearStart).length,
      current_streak: currentStreak(activeSet, today),
      hours_saved: hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10,
      rank: Number(publicScores[0]?.n ?? 0) + 1,
      directory_size: Number(publicTotal[0]?.n ?? 1),
      followers: social.followers,
      friends: social.friends,
      karma: totalScore,
    },
    daily: chartDays.map((date) => ({
      date,
      points: byDay.get(date)?.points ?? 0,
      events: byDay.get(date)?.events ?? 0,
      count: byDay.get(date)?.count ?? 0,
    })),
    heatmap: heatmapDays.map((date) => ({
      date,
      points: byDay.get(date)?.points ?? 0,
      count: byDay.get(date)?.events ?? 0,
    })),
    breakdown,
    recent,
  };
}

export type ActivityPayload = Awaited<ReturnType<typeof getActivity>>;
