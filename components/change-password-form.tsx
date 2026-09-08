"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not change password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setStatus("Password updated.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="current_password">Current password</Label>
        <Input
          id="current_password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new_password">New password</Label>
        <Input
          id="new_password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          minLength={8}
          autoComplete="new-password"
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status ? <p className="text-sm text-accent">{status}</p> : null}
      <Button type="submit" variant="secondary" disabled={loading}>
        {loading ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
