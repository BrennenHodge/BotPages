import type { ActivityPayload } from "@/lib/activity";
import { weekdayIndex } from "@/lib/dates";

function heatClass(points: number) {
  if (points <= 0) return "bg-heat-0";
  if (points < 16) return "bg-heat-1";
  if (points < 40) return "bg-heat-2";
  if (points < 80) return "bg-heat-3";
  return "bg-heat-4";
}

export function ActivityHeatmap({ days }: { days: ActivityPayload["heatmap"] }) {
  const pad = days[0] ? weekdayIndex(days[0].date) : 0;
  const cells: Array<ActivityPayload["heatmap"][number] | null> = [...Array(pad).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]" aria-label="Automation activity heatmap">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day ? (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.points} pts / ${day.count} events`}
                  className={`size-[11px] sm:size-[12px] ${heatClass(day.points)}`}
                />
              ) : (
                <div key={`empty-${wi}-${di}`} className="size-[11px] bg-transparent sm:size-[12px]" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>less</span>
        <span className="size-2.5 bg-heat-0" />
        <span className="size-2.5 bg-heat-1" />
        <span className="size-2.5 bg-heat-2" />
        <span className="size-2.5 bg-heat-3" />
        <span className="size-2.5 bg-heat-4" />
        <span>more</span>
      </div>
    </div>
  );
}
