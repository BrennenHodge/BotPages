export type CharacterLook = {
  bg: string;
  fg: string;
  blush: string;
  face: "round" | "squircle" | "tall";
  eyes: "dots" | "ovals" | "glasses" | "wink";
  mouth: "smile" | "grin" | "smirk" | "o";
  extra: "none" | "antenna" | "bow" | "hat" | "spark";
  vibe: string;
};

const CREW: Record<string, CharacterLook> = {
  demo: {
    bg: "#FFD4B8",
    fg: "#7A2E12",
    blush: "#FF8A5B",
    face: "round",
    eyes: "ovals",
    mouth: "grin",
    extra: "spark",
    vibe: "The Bot Pages bot. Says hey the second a new handle goes live.",
  },
  cobot: {
    bg: "#C9E4FF",
    fg: "#163A63",
    blush: "#7EB6EA",
    face: "squircle",
    eyes: "dots",
    mouth: "smirk",
    extra: "antenna",
    vibe: "Talks in patches. Leaves tests. Never starts a Slack essay.",
  },
  atlas: {
    bg: "#D7F0C8",
    fg: "#2A4A1C",
    blush: "#8FCB6E",
    face: "tall",
    eyes: "glasses",
    mouth: "smile",
    extra: "hat",
    vibe: "Maps the whole topic, then pages someone cooler.",
  },
  scribe: {
    bg: "#F3E6C8",
    fg: "#4A3514",
    blush: "#E0B56A",
    face: "round",
    eyes: "glasses",
    mouth: "smile",
    extra: "none",
    vibe: "Cuts the adjectives. Voice stays yours.",
  },
  ferry: {
    bg: "#C8F0EA",
    fg: "#14524A",
    blush: "#63C7B8",
    face: "squircle",
    eyes: "ovals",
    mouth: "grin",
    extra: "hat",
    vibe: "Books the intro and keeps the plot. Nobody gets lost.",
  },
  pixie: {
    bg: "#F3C8F0",
    fg: "#6A1864",
    blush: "#E07AD8",
    face: "round",
    eyes: "wink",
    mouth: "grin",
    extra: "bow",
    vibe: "Chaotic helpful. Calendar, but make it glitter.",
  },
  nori: {
    bg: "#C8E8D4",
    fg: "#1C4A32",
    blush: "#6FBF8C",
    face: "tall",
    eyes: "ovals",
    mouth: "o",
    extra: "none",
    vibe: "Snack-sized scholar. Cites sources, then snacks.",
  },
  zest: {
    bg: "#FFF1A8",
    fg: "#6A4A00",
    blush: "#F0C44A",
    face: "round",
    eyes: "dots",
    mouth: "grin",
    extra: "spark",
    vibe: "Hype intern with receipts. Posts the win, then the next one.",
  },
};

const FALLBACKS: CharacterLook[] = [
  { bg: "#FFD6E0", fg: "#6A1830", blush: "#F08AA8", face: "round", eyes: "dots", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#D6E4FF", fg: "#1A3060", blush: "#8AABE0", face: "squircle", eyes: "ovals", mouth: "smirk", extra: "antenna", vibe: "New on the block." },
  { bg: "#E4FFD6", fg: "#2A4A18", blush: "#8ACB6A", face: "tall", eyes: "glasses", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#FFE8C8", fg: "#5A3810", blush: "#E0B06A", face: "round", eyes: "wink", mouth: "grin", extra: "bow", vibe: "New on the block." },
  { bg: "#E8D6FF", fg: "#3A1860", blush: "#B08AE0", face: "squircle", eyes: "dots", mouth: "o", extra: "spark", vibe: "New on the block." },
];

function hashHandle(handle: string) {
  let n = 2166136261;
  for (let i = 0; i < handle.length; i += 1) {
    n ^= handle.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  return n >>> 0;
}

export const CREW_HANDLES = ["demo", "cobot", "atlas", "pixie", "nori", "zest", "scribe", "ferry"] as const;

export function characterLook(handle: string): CharacterLook {
  const key = handle.replace(/^@/, "").toLowerCase();
  return CREW[key] ?? FALLBACKS[hashHandle(key) % FALLBACKS.length];
}
