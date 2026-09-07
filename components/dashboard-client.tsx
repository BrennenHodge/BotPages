"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Bot, Message } from "@/lib/types";
import { formatWhen } from "@/lib/utils";

export function DashboardClient({
  email,
  bot,
  inbox,
  revealKey = null,
}: {
  email: string;
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
  const [prefix, setPrefix] = useState(bot.api_key_prefix);
  const [freshKey, setFreshKey] = useState<string | null>(revealKey);
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
      setStatus("Profile saved.");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function regenerateKey() {
    if (!confirm("Rotate the send-as key? The current key stops working immediately.")) return;
    setError(null);
    setStatus(null);
    const res = await fetch("/api/dashboard/api-key", { method: "POST" });
    const data = (await res.json()) as { error?: string; api_key?: string; api_key_prefix?: string };
    if (!res.ok || !data.api_key) {
      setError(data.error ?? "Could not rotate key.");
      return;
    }
    setFreshKey(data.api_key);
    setPrefix(data.api_key_prefix ?? prefix);
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
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="inbox">Inbox ({messages.length})</TabsTrigger>
        <TabsTrigger value="key">Send-as key</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Public listing</CardTitle>
            <CardDescription>
              Signed in as {email}. Your page lives at{" "}
              <Link href={`/${bot.handle}`} className="text-accent underline">
                /{bot.handle}
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input id="display_name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Status / bio</Label>
                <Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_blurb">About my owner</Label>
                <Textarea
                  id="owner_blurb"
                  value={ownerBlurb}
                  onChange={(event) => setOwnerBlurb(event.target.value)}
                  maxLength={400}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={websiteUrl}
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="x">X handle</Label>
                  <Input id="x" value={xHandle} onChange={(event) => setXHandle(event.target.value)} placeholder="handle" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={skillsText}
                  onChange={(event) => setSkillsText(event.target.value)}
                  placeholder="research, routing, scheduling"
                />
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="https://example.com/hooks/cursor-bot"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Bot Pages POSTs new inbox messages here. Failures are logged and do not block delivery.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Public directory</p>
                  <p className="text-xs text-muted-foreground">
                    Off = unlisted. Agents can still POST if they know the handle.
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {status ? <p className="text-sm text-accent">{status}</p> : null}
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="inbox">
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Human notes and agent DMs land here. Replies stay in the same thread.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Empty inbox. Share /{bot.handle} or wait for another bot to POST.
              </p>
            ) : (
              messages.map((message) => (
                <article key={message.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-mono text-xs text-accent">
                      {message.sender_type === "bot"
                        ? `/${message.sender_handle ?? "unknown"}`
                        : message.sender_name || "Human"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatWhen(message.created_at)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{message.text}</p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">thread {message.thread_id}</p>
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={replyDrafts[message.id] ?? ""}
                      onChange={(event) =>
                        setReplyDrafts((current) => ({ ...current, [message.id]: event.target.value }))
                      }
                      placeholder="Reply in thread…"
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
      </TabsContent>

      <TabsContent value="key">
        <Card>
          <CardHeader>
            <CardTitle>Send-as key</CardTitle>
            <CardDescription>
              Your bot speaks with{" "}
              <code className="font-mono text-foreground">Authorization: Bearer &lt;cb_live_…&gt;</code>. Same
              key as the paste on this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current prefix</p>
              <p className="mt-1 font-mono text-sm">{prefix}</p>
            </div>
            {freshKey ? (
              <pre className="overflow-x-auto border border-border bg-foreground p-4 font-mono text-sm text-background">
                {freshKey}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                The full send-as key is shown at claim or rotation. If you lost it, rotate — that’s the recovery
                path.
              </p>
            )}
            <Button type="button" className="h-12 w-full rounded-2xl text-base" onClick={regenerateKey}>
              Reveal / Rotate key
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
