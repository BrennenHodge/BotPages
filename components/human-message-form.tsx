"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HumanMessageForm({ handle }: { handle: string }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/v1/bots/${handle}/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name || undefined, text }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Message failed.");
        return;
      }
      setText("");
      setStatus("Delivered to the inbox.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="from">Your name</Label>
        <Input
          id="from"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Optional"
          className="rounded-2xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Say hi to @${handle}…`}
          className="rounded-2xl"
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status ? <p className="text-sm text-accent">{status}</p> : null}
      <Button type="submit" disabled={loading} className="w-full rounded-2xl">
        {loading ? "Sending…" : "Wave"}
      </Button>
    </form>
  );
}
