"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  channel_id: string;
  author_id: string | null;
  author_name: string | null;
  author_member_number: number;
  body: string;
  created_at: string;
};

type Inbound =
  | { type: "history"; messages: ChatMessage[] }
  | { type: "message"; message: ChatMessage };

type Props = {
  // Path under the WebSocket origin, e.g. "/ws-app/<application-id>" or "/ws/<slug>"
  wsPath: string;
  // Identity used to flip bubble alignment ("me" vs "them"):
  // - applicant: { kind: "applicant" }
  // - admin: { kind: "member", memberId: <user.id> }
  me: { kind: "applicant" } | { kind: "member"; memberId: string };
  closed?: boolean;
  emptyHint?: string;
};

export function InterviewRoom({ wsPath, me, closed = false, emptyHint }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [draft, setDraft] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const connect = () => {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.host;
      const url = `${proto}://${host}${wsPath}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.addEventListener("open", () => { if (!cancelled) setConnected(true); });
      ws.addEventListener("message", (ev) => {
        try {
          const data = JSON.parse(ev.data) as Inbound;
          if (data.type === "history") setMessages(data.messages);
          else if (data.type === "message") setMessages((prev) => [...prev, data.message]);
        } catch { /* ignore */ }
      });
      ws.addEventListener("close", () => {
        if (cancelled) return;
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 2000);
      });
      ws.addEventListener("error", () => ws.close());
    };
    connect();
    return () => {
      cancelled = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [wsPath]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const isMine = (m: ChatMessage) => {
    if (me.kind === "applicant") return m.author_id === null;
    return m.author_id === me.memberId;
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const ws = wsRef.current;
    const text = draft.trim();
    if (!ws || ws.readyState !== WebSocket.OPEN || !text || closed) return;
    ws.send(JSON.stringify({ type: "send", body: text }));
    setDraft("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          maxHeight: 420,
          overflowY: "auto",
          padding: 12,
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          fontSize: 13,
          lineHeight: 1.55,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {messages.length === 0 && (
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>
            {emptyHint ?? "No messages yet."}
          </p>
        )}
        {messages.map((m) => {
          const mine = isMine(m);
          const isApplicant = m.author_id === null;
          const name = isApplicant ? "Applicant" : (m.author_name ?? "Member");
          const num = m.author_member_number > 0 ? String(m.author_member_number).padStart(3, "0") : null;
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 1 }}>
                {num && <span style={{ fontFamily: "var(--font-mono)" }}>#{num} </span>}
                <span style={{ color: "#828282" }}>{name}</span>{" "}
                <span style={{ marginLeft: 6 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
              </div>
              <div
                style={{
                  background: mine ? "#1a1a1a" : "#111",
                  border: "1px solid #2a2a2a",
                  padding: "6px 10px",
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
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
        <p className="muted" style={{ fontSize: 12, margin: 0 }}>This conversation is closed.</p>
      ) : (
        <form onSubmit={send} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(e as unknown as React.FormEvent);
              }
            }}
            placeholder={connected ? "Reply — Enter to send, Shift+Enter for newline" : "Connecting…"}
            rows={2}
            disabled={!connected}
            style={{ flex: 1, fontFamily: "inherit", fontSize: 13, resize: "vertical" }}
          />
          <button type="submit" disabled={!connected || !draft.trim()} style={{ padding: "6px 12px", opacity: connected && draft.trim() ? 1 : 0.5 }}>
            Send
          </button>
        </form>
      )}

      <p className="muted" style={{ fontSize: 11, margin: 0, textAlign: "right" }}>
        {connected ? "● connected" : "○ disconnected"}
      </p>
    </div>
  );
}
