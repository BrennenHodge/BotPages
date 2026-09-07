import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodePath(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function proxy(request: NextRequest) {
  const path = decodePath(request.nextUrl.pathname);
  const url = request.nextUrl.clone();

  const atJson = path.match(/^\/@([a-z0-9-]+)\.json$/i);
  if (atJson) {
    url.pathname = `/api/vanity/${atJson[1].toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  const plainJson = path.match(/^\/([a-z0-9-]+)\.json$/i);
  if (plainJson) {
    url.pathname = `/api/vanity/${plainJson[1].toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  const atWellKnown = path.match(/^\/@([a-z0-9-]+)\/\.well-known\/agent-card\.json$/i);
  if (atWellKnown) {
    url.pathname = `/${atWellKnown[1].toLowerCase()}/.well-known/agent-card.json`;
    return NextResponse.rewrite(url);
  }

  const atAgentJson = path.match(/^\/@([a-z0-9-]+)\/\.well-known\/agent\.json$/i);
  if (atAgentJson) {
    url.pathname = `/${atAgentJson[1].toLowerCase()}/.well-known/agent.json`;
    return NextResponse.rewrite(url);
  }

  const atIdentity = path.match(/^\/@([a-z0-9-]+)\/\.identity\/?$/i);
  if (atIdentity) {
    url.pathname = `/${atIdentity[1].toLowerCase()}/.identity`;
    return NextResponse.rewrite(url);
  }

  const atBotCard = path.match(/^\/@([a-z0-9-]+)\/bot-card\.json$/i);
  if (atBotCard) {
    url.pathname = `/${atBotCard[1].toLowerCase()}/bot-card.json`;
    return NextResponse.rewrite(url);
  }

  const atCardJson = path.match(/^\/@([a-z0-9-]+)\/agent-card\.json$/i);
  if (atCardJson) {
    url.pathname = `/${atCardJson[1].toLowerCase()}/agent-card.json`;
    return NextResponse.rewrite(url);
  }

  const atCardPage = path.match(/^\/@([a-z0-9-]+)\/card\/?$/i);
  if (atCardPage) {
    url.pathname = `/${atCardPage[1].toLowerCase()}/card`;
    return NextResponse.rewrite(url);
  }

  const a2aAt = path.match(/^\/(?:api\/)?a2a\/@([a-z0-9-]+)\/?$/i);
  if (a2aAt) {
    url.pathname = `/a2a/${a2aAt[1].toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  const joinAt = path.match(/^\/join\/@([a-z0-9-]+)\/?$/i);
  if (joinAt) {
    url.pathname = `/join/${joinAt[1].toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  const atPage = path.match(/^\/@([a-z0-9-]+)\/?$/i);
  if (atPage) {
    url.pathname = `/${atPage[1].toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  const ogAt = path.match(/^\/og\/@([a-z0-9-]+)/i);
  if (ogAt) {
    url.pathname = `/og/${ogAt[1].toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  const apiAt = path.match(/^\/api\/@([a-z0-9-]+)(\/.*)?$/i);
  if (apiAt) {
    url.pathname = `/api/vanity/${apiAt[1].toLowerCase()}${apiAt[2] ?? ""}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
