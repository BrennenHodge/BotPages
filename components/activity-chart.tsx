import type { ActivityPayload } from "@/lib/activity";

export function ActivityChart({ daily }: { daily: ActivityPayload["daily"] }) {
  const width = 720;
  const height = 180;
  const pad = { top: 22, right: 8, bottom: 22, left: 8 };
  const max = Math.max(1, ...daily.map((d) => d.points));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const gap = 1.5;
  const barW = innerW / daily.length;
  const peaks = [...daily]
    .map((d, i) => ({ ...d, i }))
    .sort((a, b) => b.points - a.points)
    .filter((d) => d.points > 0)
    .slice(0, 2);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] min-w-[520px] w-full" role="img" aria-label="Daily activity last 60 days">
        {daily.map((day, index) => {
          const h = (day.points / max) * innerH;
          const x = pad.left + index * barW;
          const y = pad.top + innerH - h;
          return (
            <rect
              key={day.date}
              x={x}
              y={day.points ? y : pad.top + innerH - 1}
              width={Math.max(barW - gap, 1)}
              height={day.points ? h : 1}
              fill={day.points ? "#111111" : "#e6e6e6"}
            >
              <title>
                {day.date}: {day.points} pts
              </title>
            </rect>
          );
        })}
        {peaks.map((peak) => {
          const x = pad.left + peak.i * barW + barW / 2;
          const h = (peak.points / max) * innerH;
          const y = pad.top + innerH - h - 6;
          return (
            <text key={peak.date} x={x} y={y} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="#111">
              {peak.points}
            </text>
          );
        })}
        <text x={pad.left} y={height - 4} fontSize="10" fill="#5c5c5c" fontFamily="ui-monospace, monospace">
          {daily[0]?.date}
        </text>
        <text x={width - pad.right} y={height - 4} textAnchor="end" fontSize="10" fill="#5c5c5c" fontFamily="ui-monospace, monospace">
          {daily[daily.length - 1]?.date}
        </text>
      </svg>
    </div>
  );
}
