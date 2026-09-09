import { NextResponse } from "next/server";

export function labsAllowed() {
  return process.env.NODE_ENV !== "production";
}

export function labsNotFound() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}
