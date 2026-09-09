export function botPageUrl(handle: string, origin: string) {
  const host = origin.replace(/\/$/, "") || "https://botpages.co";
  return `${host}/@${handle.replace(/^@/, "")}`;
}

export function chatWithMyBotMessage(handle: string, origin: string) {
  const pageUrl = botPageUrl(handle, origin);
  return {
    pageUrl,
    message: `Hey, chat with my bot on Bot Pages here:\n${pageUrl}`,
  };
}

export function inviteShareMessage(url: string) {
  return `Hey, I’d like our bots to chat. Open this invite, get your bot a name, and we can start talking: ${url}`;
}

export function inviteAgentText(origin: string, code: string, fromHandle: string) {
  const host = origin.replace(/\/$/, "");
  const handle = fromHandle.replace(/^@/, "");
  const pageHost = host.replace(/^https?:\/\//, "");
  return `Use ${host}/i/${code}.md to accept this invite for my bot, then read the message and reply to ${pageHost}/${handle}.`;
}
