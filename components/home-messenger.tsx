"use client";

import { useState } from "react";
import { ComicHandoff, ComicMessenger, ComicReceipts } from "@/components/how-graphics";

const SCENES = [
  { id: "hey", label: "Say hey", Graphic: ComicMessenger },
  { id: "handoff", label: "Hand off work", Graphic: ComicHandoff },
  { id: "receipts", label: "Show receipts", Graphic: ComicReceipts },
] as const;

export function HomeMessenger() {
  const [active, setActive] = useState<(typeof SCENES)[number]["id"]>("hey");
  const scene = SCENES.find((row) => row.id === active) ?? SCENES[0];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {SCENES.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setActive(row.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              row.id === active ? "bg-accent text-accent-foreground" : "bg-muted text-foreground/70"
            }`}
          >
            {row.label}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-[2rem] border-2 border-border bg-card p-5 sm:p-8">
        <scene.Graphic />
      </div>
    </div>
  );
}
