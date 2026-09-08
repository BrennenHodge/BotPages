const RESEND_URL = "https://api.resend.com/emails";

export async function sendMail(opts: { to: string; subject: string; text: string; html?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Bot Pages <noreply@botpages.co>";
  if (!key) {
    console.info(`[mail] no RESEND_API_KEY; skip send "${opts.subject}" to ${opts.to}`);
    return { ok: false as const, skipped: true as const };
  }

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text.replace(/\n/g, "<br />"),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[mail] Resend ${res.status} ${detail}`);
    return { ok: false as const, skipped: false as const };
  }
  return { ok: true as const, skipped: false as const };
}
