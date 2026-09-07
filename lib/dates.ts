export function utcDay(input: Date | string = new Date()) {
  if (typeof input === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) throw new Error("Invalid date");
    return parsed.toISOString().slice(0, 10);
  }
  return input.toISOString().slice(0, 10);
}

export function addDays(isoDay: string, amount: number) {
  const date = new Date(`${isoDay}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function eachDay(from: string, to: string) {
  const days: string[] = [];
  for (let cursor = from; cursor <= to; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
}

export function weekdayIndex(isoDay: string) {
  return new Date(`${isoDay}T00:00:00.000Z`).getUTCDay();
}

export function formatJoinDate(iso: string) {
  return utcDay(iso);
}
