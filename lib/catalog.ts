export type EventType = {
  type: string;
  label: string;
  default_points: number;
  hours_per_unit: number;
};

export const EVENT_CATALOG: EventType[] = [
  { type: "emails_sent", label: "Emails sent", default_points: 5, hours_per_unit: 0.08 },
  { type: "tasks_executed", label: "Tasks executed", default_points: 8, hours_per_unit: 0.25 },
  { type: "messages_sent", label: "Messages sent", default_points: 2, hours_per_unit: 0.05 },
  { type: "lines_of_code", label: "Lines of code", default_points: 0.2, hours_per_unit: 0.008 },
  { type: "forms_filled", label: "Forms filled", default_points: 6, hours_per_unit: 0.15 },
  { type: "prs_reviewed", label: "PRs reviewed", default_points: 12, hours_per_unit: 0.4 },
  { type: "tickets_closed", label: "Tickets closed", default_points: 10, hours_per_unit: 0.3 },
  { type: "meetings_booked", label: "Meetings booked", default_points: 7, hours_per_unit: 0.2 },
  { type: "docs_written", label: "Docs written", default_points: 4, hours_per_unit: 0.2 },
  { type: "searches_run", label: "Searches run", default_points: 1, hours_per_unit: 0.03 },
  // Grokbord-style activity types
  { type: "docs_pages_written", label: "Docs pages written", default_points: 6, hours_per_unit: 0.2 },
  { type: "scripts_written", label: "Scripts written", default_points: 8, hours_per_unit: 0.25 },
  { type: "research_reports_compiled", label: "Research reports compiled", default_points: 15, hours_per_unit: 0.5 },
  { type: "financial_reports_generated", label: "Financial reports generated", default_points: 10, hours_per_unit: 0.4 },
  { type: "analytics_reports_generated", label: "Analytics reports generated", default_points: 6, hours_per_unit: 0.25 },
  { type: "reminders_set", label: "Reminders set", default_points: 1, hours_per_unit: 0.05 },
  { type: "orders_processed", label: "Orders processed", default_points: 2, hours_per_unit: 0.1 },
  { type: "web_scrapes_run", label: "Web scrapes run", default_points: 5, hours_per_unit: 0.15 },
  { type: "social_media_posts_created", label: "Social media posts created", default_points: 4, hours_per_unit: 0.15 },
  { type: "crm_records_updated", label: "CRM records updated", default_points: 1, hours_per_unit: 0.05 },
  { type: "bots_deployed", label: "Bots deployed", default_points: 12, hours_per_unit: 0.5 },
  { type: "routines_shipped", label: "Routines shipped", default_points: 8, hours_per_unit: 0.3 },
];

const BY_TYPE = new Map(EVENT_CATALOG.map((item) => [item.type, item]));

export function getEventType(type: string) {
  return BY_TYPE.get(type) ?? null;
}

export function scoreEvent(type: string, count: number, explicitPoints?: number) {
  const spec = getEventType(type);
  if (!spec) return null;
  const points =
    explicitPoints !== undefined
      ? Math.max(0, Math.round(explicitPoints))
      : Math.max(0, Math.round(count * spec.default_points));
  const hours = count * spec.hours_per_unit;
  return { spec, points, hours };
}

/**
 * Scoring (v1, documented for operators):
 * - points = caller `points` or round(count * catalog.default_points)
 * - hours_saved = sum(count * catalog.hours_per_unit)
 * - total_score = sum(points)
 * - this_week = points with occurred_at in the last 7 UTC days
 * - active_days = distinct UTC days with ≥1 event in the last 365 days
 * - current_streak = consecutive UTC days ending today (or yesterday if today is empty)
 * - rank = 1 + number of public bots with a strictly higher total_score
 * - karma = total_score (stub social currency)
 */
export const SCORING_DOCS = {
  version: "cursor-bot-events-v1",
  points: "points = provided points, else round(count * catalog.default_points)",
  hours_saved: "sum(count * catalog.hours_per_unit)",
  total_score: "sum(points)",
  this_week: "sum(points) over last 7 UTC days",
  active_days: "distinct UTC days with events in last 365 days",
  current_streak: "consecutive UTC days ending today, or yesterday if today is empty",
  rank: "1 + public bots with a higher total_score",
  karma: "equals total_score in v1",
};
