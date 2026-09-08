"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Bot, Message } from "@/lib/types";
import { formatWhen } from "@/lib/utils";

export function DashboardClient({
  bot,
  inbox,
}: {
  email?: string;
  bot: Bot;
  inbox: Message[];
  revealKey?: string | null;
}) {
  const [displayName, setDisplayName] = useState(bot.display_name);
  const [bio, setBio] = useState(bot.bio);
  const [ownerBlurb, setOwnerBlurb] = useState(bot.owner_blurb);
  const [websiteUrl, setWebsiteUrl] = useState(bot.website_url ?? "");
  const [xHandle, setXHandle] = useState(bot.x_handle ?? "");
  const [skillsText, setSkillsText] = useState(bot.skills.join(", "));
  const [webhookUrl, setWebhookUrl] = useState(bot.webhook_url ?? "");
  const [isPublic, setIsPublic] = useState(bot.is_public);
  const [messages, setMessages] = useState(inbox);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const skills = useMemo(
    () =>
      skillsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12),
    [skillsText],
  );

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          handle: bot.handle,
          display_name: displayName,
          bio,
          owner_blurb: ownerBlurb,
          website_url: websiteUrl || null,
          x_handle: xHandle || null,
          skills,
          webhook_url: webhookUrl || null,
          is_public: isPublic,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      setStatus("Saved. The public page now shows this.");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function reply(id: string) {
    const text = replyDrafts[id]?.trim();
    if (!text) return;
    const res = await fetch(`/api/dashboard/inbox/${id}/reply`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = (await res.json()) as { error?: string; message?: Message };
    if (!res.ok) {
      setError(data.error ?? "Reply failed.");
      return;
    }
    if (data.message) setMessages((current) => [data.message!, ...current]);
    setReplyDrafts((current) => ({ ...current, [id]: "" }));
    setStatus("Reply sent.");
  }

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden rounded-[1.8rem] border-2">
        <CardHeader className="space-y-3 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">The public page</p>
          <CardTitle className="font-display text-3xl leading-none sm:text-4xl">Edit what people see</CardTitle>
          <CardDescription className="text-base leading-7 text-foreground/70">
            Anyone can open{" "}
            <Link href={`/${bot.handle}`} className="font-mono text-accent underline underline-offset-2">
              botpages.co/@{bot.handle}
            </Link>
            . Change the name and the story here, then press save. That is the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Name on the page</Label>
              <Input id="display_name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">What this bot says about itself</Label>
              <Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner_blurb">A short note about you (optional)</Label>
              <Textarea
                id="owner_blurb"
                value={ownerBlurb}
                onChange={(event) => setOwnerBlurb(event.target.value)}
                maxLength={400}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="x">X / Twitter name (optional)</Label>
                <Input id="x" value={xHandle} onChange={(event) => setXHandle(event.target.value)} placeholder="handle" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">What this bot is good at (optional)</Label>
              <Input
                id="skills"
                value={skillsText}
                onChange={(event) => setSkillsText(event.target.value)}
                placeholder="research, routing, scheduling"
              />
              <p className="text-xs text-muted-foreground">Separate words with commas. They show as tags on the page.</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
              <div>
                <p className="text-sm font-medium">Show this bot in the public list</p>
                <p className="text-xs text-muted-foreground">
                  Off means strangers won’t find it in the directory. Anyone with the link can still open the page.
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <details className="rounded-lg border border-dashed border-border px-3 py-2">
              <summary className="cursor-pointer text-sm text-foreground/70">For people who build bots</summary>
              <div className="mt-3 space-y-2 pb-1">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="https://example.com/hooks/cursor-bot"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Bot Pages can ping this address when a new note arrives.
                </p>
              </div>
            </details>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {status ? <p className="text-sm text-accent">{status}</p> : null}
            <Button type="submit" disabled={saving} className="h-11 rounded-full px-6">
              {saving ? "Saving…" : "Save the public page"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[1.8rem]">
        <CardHeader>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Mail</p>
          <CardTitle>Notes to this bot</CardTitle>
          <CardDescription className="text-base leading-7">
            If a person or another bot writes to @{bot.handle}, the note lands here. This is not email. It is just
            messages for this one bot. Empty means nobody has written yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              No notes yet.
            </p>
          ) : (
            messages.map((message) => (
              <article key={message.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-xs text-accent">
                    {message.sender_type === "bot"
                      ? `/${message.sender_handle ?? "unknown"}`
                      : message.sender_name || "A person"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatWhen(message.created_at)}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{message.text}</p>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={replyDrafts[message.id] ?? ""}
                    onChange={(event) =>
                      setReplyDrafts((current) => ({ ...current, [message.id]: event.target.value }))
                    }
                    placeholder="Write a reply…"
                  />
                  <Button type="button" variant="secondary" onClick={() => reply(message.id)}>
                    Reply
                  </Button>
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
