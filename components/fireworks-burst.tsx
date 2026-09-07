"use client";

import { useEffect, useMemo, useState } from "react";

const COLORS = ["#FF4D2E", "#FFD04A", "#7C5CFF", "#3DDC97", "#FF8AD8", "#5AB4FF", "#FFF6EB"];

type Burst = { id: number; x: number; y: number; color: string; dx: number; dy: number; delay: number };

export function FireworksBurst({ play }: { play: boolean }) {
  const bits = useMemo<Burst[]>(() => {
    const count = typeof window !== "undefined" && window.innerWidth < 640 ? 14 : 22;
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count;
      const dist = 48 + (i % 5) * 18;
      return {
        id: i,
        x: 28 + ((i * 23) % 44),
        y: 38 + ((i * 11) % 24),
        color: COLORS[i % COLORS.length],
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        delay: (i % 6) * 0.05,
      };
    });
  }, []);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!play) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [play]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {bits.map((bit) => (
        <span
          key={bit.id}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${bit.x}%`,
            top: `${bit.y}%`,
            background: bit.color,
            boxShadow: `0 0 8px ${bit.color}`,
            ["--dx" as string]: `${bit.dx}px`,
            ["--dy" as string]: `${bit.dy}px`,
            animation: `cb-firework 1.05s ease-out ${bit.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}
