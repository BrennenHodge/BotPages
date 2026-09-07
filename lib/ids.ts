import { randomBytes } from "node:crypto";

export function makeId(prefix: string) {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

export function nowIso() {
  return new Date().toISOString();
}
