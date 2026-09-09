import type { CharacterLook } from "@/lib/characters";

function roundedPolygonPath(pts: Array<[number, number]>, radius: number): string {
  const n = pts.length;
  const parts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const prev = pts[(i + n - 1) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const d1 = Math.hypot(curr[0] - prev[0], curr[1] - prev[1]) || 1;
    const d2 = Math.hypot(next[0] - curr[0], next[1] - curr[1]) || 1;
    const rr = Math.min(radius, d1 / 2.4, d2 / 2.4);
    const p1: [number, number] = [
      curr[0] - ((curr[0] - prev[0]) / d1) * rr,
      curr[1] - ((curr[1] - prev[1]) / d1) * rr,
    ];
    const p2: [number, number] = [
      curr[0] + ((next[0] - curr[0]) / d2) * rr,
      curr[1] + ((next[1] - curr[1]) / d2) * rr,
    ];
    if (i === 0) parts.push(`M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`);
    else parts.push(`L ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`);
    parts.push(`Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

function hexPoints(): Array<[number, number]> {
  const r = 36;
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return [40 + r * Math.cos(a), 40 + r * Math.sin(a)] as [number, number];
  });
}

function FaceShape({ look }: { look: CharacterLook }) {
  if (look.face === "circle") {
    return <circle cx="40" cy="40" r="38" fill={look.bg} />;
  }
  if (look.face === "square") {
    return <rect x="4" y="4" width="72" height="72" rx="18" fill={look.bg} />;
  }
  if (look.face === "hexagon") {
    return <path d={roundedPolygonPath(hexPoints(), 10)} fill={look.bg} />;
  }
  return <path d={roundedPolygonPath([[40, 8], [73, 70], [7, 70]], 12)} fill={look.bg} />;
}

function Eyes({ look, cy }: { look: CharacterLook; cy: number }) {
  const stroke = { fill: "none" as const, stroke: look.fg, strokeWidth: 3, strokeLinecap: "round" as const };
  if (look.eyes === "wink") {
    return (
      <>
        <circle cx="28" cy={cy} r="4.5" fill={look.fg} />
        <path d={`M46 ${cy} Q52 ${cy - 5} 58 ${cy}`} {...stroke} />
      </>
    );
  }
  if (look.eyes === "winkLeft") {
    return (
      <>
        <path d={`M22 ${cy} Q28 ${cy - 5} 34 ${cy}`} {...stroke} />
        <circle cx="52" cy={cy} r="4.5" fill={look.fg} />
      </>
    );
  }
  if (look.eyes === "sleepy") {
    return (
      <>
        <path d={`M22 ${cy + 1} Q28 ${cy - 5} 34 ${cy + 1}`} {...stroke} />
        <path d={`M46 ${cy + 1} Q52 ${cy - 5} 58 ${cy + 1}`} {...stroke} />
      </>
    );
  }
  if (look.eyes === "ovals") {
    return (
      <>
        <ellipse cx="28" cy={cy} rx="5" ry="7" fill={look.fg} />
        <ellipse cx="52" cy={cy} rx="5" ry="7" fill={look.fg} />
      </>
    );
  }
  return (
    <>
      <circle cx="28" cy={cy} r="4.5" fill={look.fg} />
      <circle cx="52" cy={cy} r="4.5" fill={look.fg} />
    </>
  );
}

function Mouth({ look, cy }: { look: CharacterLook; cy: number }) {
  const stroke = { fill: "none" as const, stroke: look.fg, strokeWidth: 3, strokeLinecap: "round" as const };
  if (look.mouth === "grin") {
    return <path d={`M26 ${cy} Q40 ${cy + 14} 54 ${cy}`} {...stroke} />;
  }
  if (look.mouth === "smirk") {
    return <path d={`M34 ${cy + 2} Q46 ${cy + 8} 54 ${cy - 2}`} {...stroke} />;
  }
  if (look.mouth === "o") {
    return <ellipse cx="40" cy={cy + 2} rx="5" ry="6" fill={look.fg} />;
  }
  return <path d={`M30 ${cy + 2} Q40 ${cy + 8} 50 ${cy + 2}`} {...stroke} />;
}

export function CharacterFace({
  look,
  size = 80,
  className,
  title,
}: {
  look: CharacterLook;
  size?: number;
  className?: string;
  title?: string;
}) {
  const low = look.face === "triangle";
  const eyeY = low ? 42 : 36;
  const blushY = low ? 54 : 48;
  const mouthY = low ? 58 : 54;
  const antennaTop = low ? 2 : 6;

  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} aria-hidden>
      {title ? <title>{title}</title> : null}
      <FaceShape look={look} />
      {look.extra === "antenna" ? (
        <>
          <line x1="40" y1={antennaTop + 10} x2="40" y2={antennaTop + 18} stroke={look.fg} strokeWidth="3" />
          <circle cx="40" cy={antennaTop + 7} r="4" fill={look.blush} />
        </>
      ) : null}
      {look.extra === "hat" && look.face !== "triangle" ? (
        <path d="M18 18 C28 8, 52 8, 62 18 L58 22 H22 Z" fill={look.fg} />
      ) : null}
      {look.extra === "hat" && look.face === "triangle" ? (
        <path d="M30 16 Q40 4 50 16 Z" fill={look.fg} />
      ) : null}
      {look.extra === "spark" ? (
        <path d="M66 14 L68 22 L76 24 L68 26 L66 34 L64 26 L56 24 L64 22 Z" fill={look.blush} />
      ) : null}
      <Eyes look={look} cy={eyeY} />
      <ellipse cx="22" cy={blushY} rx="6" ry="3.5" fill={look.blush} opacity="0.9" />
      <ellipse cx="58" cy={blushY} rx="6" ry="3.5" fill={look.blush} opacity="0.9" />
      <Mouth look={look} cy={mouthY} />
    </svg>
  );
}
