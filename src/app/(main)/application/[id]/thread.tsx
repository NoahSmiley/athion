"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

export function Thread({ applicationId, asAdmin = false, closed = false }: { applicationId: string; asAdmin?: boolean; closed?: boolean }) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    try {
      const r = await fetch(`/api/access-requests/${applicationId}/messages`, { cache: "no-store" });
      const data = await r.json();
      if (r.ok) setMessages(data.messages ?? []);
    } catch {
      // network blip — keep prior messages
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setPosting(true);
    setError(null);
    try {
      const r = await fetch(`/api/access-requests/${applicationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to send");
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPosting(false);
    }
  };

  if (messages === null) {
    return <p className="muted" style={{ fontSize: 12 }}>Loading messages…</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          maxHeight: 360,
          overflowY: "auto",
          padding: 12,
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          fontSize: 13,
          lineHeight: 1.55,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>No messages yet.</p>
        )}
        {messages.map((m) => {
          const isStaff = m.authorRole !== "applicant";
          const label = isStaff ? (m.authorName ?? "Athion") : "You";
          // Whose perspective: in admin view, "You" should be the admin. Flip the label.
          const youLabel = asAdmin ? (isStaff ? "You" : "Applicant") : (isStaff ? label : "You");
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isStaff !== asAdmin ? "flex-start" : "flex-end" }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
                {youLabel} <span style={{ marginLeft: 6 }}>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <div
                style={{
                  background: (isStaff !== asAdmin) ? "#111" : "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  padding: "8px 10px",
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {closed ? (
        <p className="muted" style={{ fontSize: 12 }}>This conversation is closed.</p>
      ) : (
        <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={asAdmin ? "Reply to applicant…" : "Write a reply…"}
            rows={3}
            style={{ resize: "vertical", fontFamily: "inherit", fontSize: 13 }}
          />
          {error && <p style={{ color: "#c44", fontSize: 12, margin: 0 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={posting || !body.trim()} style={{ padding: "6px 12px", opacity: body.trim() ? 1 : 0.5 }}>
              {posting ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
