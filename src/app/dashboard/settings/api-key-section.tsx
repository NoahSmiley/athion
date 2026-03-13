"use client";

import { useState, useEffect } from "react";

export function ApiKeySection() {
  const [keyHint, setKeyHint] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings/api-key")
      .then((res) => res.json())
      .then((data) => { if (data.keyHint) setKeyHint(data.keyHint); })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/settings/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: newKey }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Failed to save API key");
    } else {
      const data = await res.json();
      setKeyHint(data.keyHint);
      setNewKey("");
      setMessage("API key saved.");
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    const res = await fetch("/api/settings/api-key", { method: "DELETE" });
    if (res.ok) {
      setKeyHint(null);
      setMessage("API key removed.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8">
      <p className="text-xs text-foreground-muted uppercase tracking-wider">
        Liminal IDE
      </p>
      <p className="text-sm text-foreground-muted">
        Add your Anthropic API key to use with Liminal IDE.
      </p>

      {message && (
        <div className="p-3 border border-accent/30 text-accent text-sm">
          {message}
        </div>
      )}

      {keyHint && (
        <div className="flex items-center justify-between p-3 border border-border bg-background-elevated">
          <span className="text-sm text-foreground-muted">
            sk-ant-...{keyHint}
          </span>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="flex gap-3">
        <input
          type="password"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={keyHint ? "Replace API key" : "sk-ant-..."}
          className="flex-1 px-4 py-3 bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !newKey}
          className="px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          Save
        </button>
      </form>
    </div>
  );
}
