"use client";

import { useEffect, useMemo, useState } from "react";

const COLORS = ["#FF4D2E", "#FFD04A", "#7C5CFF", "#3DDC97", "#FF8AD8", "#5AB4FF"];

export function ConfettiBurst({ play }: { play: boolean }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 17) % 84),
        delay: (i % 8) * 0.04,
        color: COLORS[i % COLORS.length],
        rotate: (i * 47) % 360,
      })),
    [],
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!play) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, [play]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((bit) => (
        <span
          key={bit.id}
          className="absolute top-4 h-2.5 w-2.5 rounded-[2px]"
          style={{
            left: `${bit.left}%`,
            background: bit.color,
            animation: `cb-confetti 1.15s ease-in ${bit.delay}s both`,
            transform: `rotate(${bit.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
