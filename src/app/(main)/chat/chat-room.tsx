"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  channel_id: string;
  author_id: string;
  author_name: string | null;
  author_member_number: number;
  body: string;
  created_at: string;
};

type Inbound =
  | { type: "history"; messages: ChatMessage[] }
  | { type: "message"; message: ChatMessage };

export function ChatRoom({
  channelSlug,
  me,
}: {
  channelSlug: string;
  me: { id: string; displayName: string | null };
}) {
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
      const url = `${proto}://${host}/ws/${channelSlug}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        if (cancelled) return;
        setConnected(true);
      });

      ws.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data) as Inbound;
          if (data.type === "history") {
            setMessages(data.messages);
          } else if (data.type === "message") {
            setMessages((prev) => [...prev, data.message]);
          }
        } catch {
          // ignore malformed
        }
      });

      ws.addEventListener("close", () => {
        if (cancelled) return;
        setConnected(false);
        // Reconnect with backoff
        reconnectRef.current = setTimeout(connect, 2000);
      });

      ws.addEventListener("error", () => {
        ws.close();
      });
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [channelSlug]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const ws = wsRef.current;
    const text = draft.trim();
    if (!ws || ws.readyState !== WebSocket.OPEN || !text) return;
    ws.send(JSON.stringify({ type: "send", body: text }));
    setDraft("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
      <div
        style={{
          height: 480,
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
        {messages.length === 0 && <p className="muted" style={{ margin: 0, fontSize: 12 }}>No messages yet. Be the first.</p>}
        {messages.map((m) => {
          const mine = m.author_id === me.id;
          const name = m.author_name ?? "Member";
          const num = String(m.author_member_number).padStart(3, "0");
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 1 }}>
                <span style={{ fontFamily: "var(--font-mono)" }}>#{num}</span>{" "}
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
          placeholder={connected ? "Message #general — Enter to send, Shift+Enter for newline" : "Connecting…"}
          rows={2}
          disabled={!connected}
          style={{ flex: 1, fontFamily: "inherit", fontSize: 13, resize: "vertical" }}
        />
        <button type="submit" disabled={!connected || !draft.trim()} style={{ padding: "6px 12px", opacity: connected && draft.trim() ? 1 : 0.5 }}>
          Send
        </button>
      </form>

      <p className="muted" style={{ fontSize: 11, margin: 0, textAlign: "right" }}>
        {connected ? <>● connected as <b>{me.displayName ?? "you"}</b></> : "○ disconnected"}
      </p>
    </div>
  );
}
