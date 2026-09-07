export function copiedPromptKey(handle: string) {
  return `bp_copied:${handle.replace(/^@/, "")}`;
}

export function liveFireworksKey(handle: string) {
  return `bp_live_fx:${handle.replace(/^@/, "")}`;
}

export function readFlag(key: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function writeFlag(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    /* private mode */
  }
}
