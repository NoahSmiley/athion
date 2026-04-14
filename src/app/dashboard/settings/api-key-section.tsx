"use client";

import { useState, useEffect } from "react";

export function ApiKeySection() {
  const [keyHint, setKeyHint] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings/api-key").then((r) => r.json()).then((d) => { if (d.keyHint) setKeyHint(d.keyHint); }).catch(() => {});
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    const res = await fetch("/api/settings/api-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: newKey }) });
    if (res.ok) { const d = await res.json(); setKeyHint(d.keyHint); setNewKey(""); setMessage("API key saved."); } else { setMessage((await res.json()).error || "Failed"); }
    setLoading(false);
  };

  const remove = async () => {
    setLoading(true);
    if ((await fetch("/api/settings/api-key", { method: "DELETE" })).ok) { setKeyHint(null); setMessage("API key removed."); }
    setLoading(false);
  };

  const input = { fontFamily: "inherit", fontSize: 13, padding: "2px 4px", width: 240 } as const;

  return (
    <>
      <h2>Liminal IDE API Key</h2>
      <p className="muted">Add your Anthropic API key to use with Liminal IDE.</p>
      {message && <p style={{ color: "#c44", marginTop: 4 }}>{message}</p>}
      {keyHint && (
        <p style={{ marginTop: 4 }}>
          <span className="muted" style={{ fontFamily: "var(--font-mono)" }}>sk-ant-...{keyHint}</span>
          {" "}<button onClick={remove} disabled={loading} style={{ fontFamily: "inherit", fontSize: 11, color: "#c44", background: "none", border: "none", cursor: "pointer", padding: 0 }}>remove</button>
        </p>
      )}
      <form onSubmit={save} style={{ marginTop: 8 }}>
        <input type="password" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder={keyHint ? "Replace API key" : "sk-ant-..."} style={input} />
        {" "}<button type="submit" disabled={loading || !newKey} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>Save</button>
      </form>
    </>
  );
}
