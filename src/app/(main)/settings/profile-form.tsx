"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input: React.CSSProperties = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" };

export function ProfileForm({ initial }: { initial: { username: string; displayName: string } }) {
  const router = useRouter();
  const [username, setUsername] = useState(initial.username);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dirty =
    username !== initial.username || displayName !== initial.displayName;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Save failed");
      setSavedAt(new Date().toLocaleTimeString());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label>
        <span className="muted" style={{ fontSize: 11 }}>Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="lowercase, hyphens ok"
          style={{ ...input, fontFamily: "var(--font-mono)" }}
          required
          minLength={2}
          maxLength={32}
          pattern="[a-z0-9][a-z0-9_-]{1,30}"
        />
      </label>
      <label>
        <span className="muted" style={{ fontSize: 11 }}>Display name</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          style={input}
          maxLength={64}
        />
      </label>
      {error && <p style={{ color: "#c44", fontSize: 12, margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" disabled={saving || !dirty} style={{ padding: "6px 12px", opacity: dirty && !saving ? 1 : 0.5 }}>
          {saving ? "Saving…" : "Save"}
        </button>
        {savedAt && <span className="muted" style={{ fontSize: 11 }}>saved {savedAt}</span>}
      </div>
    </form>
  );
}
