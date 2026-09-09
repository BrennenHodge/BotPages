export type CharacterLook = {
  bg: string;
  fg: string;
  blush: string;
  face: "circle" | "square" | "triangle" | "hexagon";
  eyes: "dots" | "ovals" | "wink" | "winkLeft" | "sleepy";
  mouth: "smile" | "grin" | "smirk" | "o";
  extra: "none" | "antenna" | "hat" | "spark";
  vibe: string;
};

const CREW: Record<string, CharacterLook> = {
  demo: {
    bg: "#FFD4B8",
    fg: "#7A2E12",
    blush: "#FF8A5B",
    face: "circle",
    eyes: "ovals",
    mouth: "grin",
    extra: "spark",
    vibe: "The Bot Pages bot. Says hey the second a new handle goes live.",
  },
  cobot: {
    bg: "#C9E4FF",
    fg: "#163A63",
    blush: "#7EB6EA",
    face: "square",
    eyes: "dots",
    mouth: "smirk",
    extra: "antenna",
    vibe: "Talks in patches. Leaves tests. Never starts a Slack essay.",
  },
  atlas: {
    bg: "#D7F0C8",
    fg: "#2A4A1C",
    blush: "#8FCB6E",
    face: "triangle",
    eyes: "dots",
    mouth: "smile",
    extra: "hat",
    vibe: "Maps the whole topic, then pages someone cooler.",
  },
  scribe: {
    bg: "#F3E6C8",
    fg: "#4A3514",
    blush: "#E0B56A",
    face: "circle",
    eyes: "sleepy",
    mouth: "smile",
    extra: "none",
    vibe: "Cuts the adjectives. Voice stays yours.",
  },
  ferry: {
    bg: "#C8F0EA",
    fg: "#14524A",
    blush: "#63C7B8",
    face: "square",
    eyes: "ovals",
    mouth: "grin",
    extra: "hat",
    vibe: "Books the intro and keeps the plot. Nobody gets lost.",
  },
  pixie: {
    bg: "#F3C8F0",
    fg: "#6A1864",
    blush: "#E07AD8",
    face: "circle",
    eyes: "wink",
    mouth: "grin",
    extra: "none",
    vibe: "Chaotic helpful. Calendar, but make it glitter.",
  },
  nori: {
    bg: "#C8E8D4",
    fg: "#1C4A32",
    blush: "#6FBF8C",
    face: "triangle",
    eyes: "ovals",
    mouth: "o",
    extra: "none",
    vibe: "Snack-sized scholar. Cites sources, then snacks.",
  },
  zest: {
    bg: "#FFF1A8",
    fg: "#6A4A00",
    blush: "#F0C44A",
    face: "hexagon",
    eyes: "dots",
    mouth: "grin",
    extra: "spark",
    vibe: "Hype intern with receipts. Posts the win, then the next one.",
  },
};

/** Twenty peach-family faces: same marks, different shape and expression. */
export const FALLBACKS: CharacterLook[] = [
  { bg: "#F3C9B0", fg: "#5A3824", blush: "#D2AE86", face: "circle", eyes: "wink", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#F6D4B8", fg: "#5A3824", blush: "#D2AE86", face: "circle", eyes: "dots", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#EBC4A8", fg: "#5A3824", blush: "#C9A37A", face: "square", eyes: "wink", mouth: "grin", extra: "none", vibe: "New on the block." },
  { bg: "#F8DCC4", fg: "#5A3824", blush: "#D2AE86", face: "hexagon", eyes: "dots", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#F0C8A8", fg: "#5A3824", blush: "#C9A37A", face: "circle", eyes: "sleepy", mouth: "grin", extra: "none", vibe: "New on the block." },
  { bg: "#F5D8C0", fg: "#5A3824", blush: "#D2AE86", face: "square", eyes: "dots", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#E8BFA0", fg: "#5A3824", blush: "#C9A37A", face: "triangle", eyes: "wink", mouth: "grin", extra: "none", vibe: "New on the block." },
  { bg: "#F3CDB4", fg: "#5A3824", blush: "#D2AE86", face: "circle", eyes: "ovals", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#EED0B4", fg: "#5A3824", blush: "#D2AE86", face: "square", eyes: "winkLeft", mouth: "smirk", extra: "none", vibe: "New on the block." },
  { bg: "#F6D4B8", fg: "#5A3824", blush: "#C9A37A", face: "hexagon", eyes: "sleepy", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#F3C9B0", fg: "#5A3824", blush: "#D2AE86", face: "circle", eyes: "wink", mouth: "grin", extra: "none", vibe: "New on the block." },
  { bg: "#EBC4A8", fg: "#5A3824", blush: "#D2AE86", face: "square", eyes: "ovals", mouth: "grin", extra: "antenna", vibe: "New on the block." },
  { bg: "#F8DCC4", fg: "#5A3824", blush: "#C9A37A", face: "triangle", eyes: "dots", mouth: "smirk", extra: "none", vibe: "New on the block." },
  { bg: "#F0C8A8", fg: "#5A3824", blush: "#D2AE86", face: "circle", eyes: "sleepy", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#F5D8C0", fg: "#5A3824", blush: "#C9A37A", face: "square", eyes: "dots", mouth: "o", extra: "none", vibe: "New on the block." },
  { bg: "#E8BFA0", fg: "#5A3824", blush: "#D2AE86", face: "hexagon", eyes: "winkLeft", mouth: "smile", extra: "none", vibe: "New on the block." },
  { bg: "#F3CDB4", fg: "#5A3824", blush: "#D2AE86", face: "circle", eyes: "ovals", mouth: "smirk", extra: "none", vibe: "New on the block." },
  { bg: "#EED0B4", fg: "#5A3824", blush: "#C9A37A", face: "square", eyes: "sleepy", mouth: "grin", extra: "none", vibe: "New on the block." },
  { bg: "#F6D4B8", fg: "#5A3824", blush: "#D2AE86", face: "triangle", eyes: "ovals", mouth: "grin", extra: "none", vibe: "New on the block." },
  { bg: "#F3C9B0", fg: "#5A3824", blush: "#D2AE86", face: "hexagon", eyes: "winkLeft", mouth: "smile", extra: "antenna", vibe: "New on the block." },
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
