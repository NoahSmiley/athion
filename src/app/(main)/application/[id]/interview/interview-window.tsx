"use client";

import { useEffect, useState } from "react";

type Phase = "before" | "live" | "ended";

function phaseFromTimes(now: number, start: number, end: number, closed: boolean): Phase {
  if (closed) return "ended";
  if (now < start) return "before";
  if (now > end) return "ended";
  return "live";
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSec = Math.ceil(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function InterviewWindow({
  startIso,
  endIso,
  durationMinutes,
  note,
  closed,
  children,
}: {
  startIso: string;
  endIso: string;
  durationMinutes: number;
  note: string | null;
  closed: boolean;
  children: React.ReactNode;
}) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const phase = phaseFromTimes(now, start, end, closed);

  const startLabel = new Date(start).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const endLabel = new Date(end).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          background: phase === "live" ? "#0d0d0d" : "#0a0a0a",
          border: "1px solid",
          borderColor: phase === "live" ? "#c8c8c8" : "#2a2a2a",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: phase === "live" ? "#c8c8c8" : "#828282", marginBottom: 6 }}>
          {phase === "before" && <>Starts in <b style={{ color: "#c8c8c8" }}>{formatCountdown(start - now)}</b></>}
          {phase === "live" && <><span aria-hidden="true">●</span> <b>Interview is live</b> · ends in {formatCountdown(end - now)}</>}
          {phase === "ended" && <>Interview ended{closed ? " · closed" : ""}</>}
        </div>
        <h1 style={{ margin: 0, fontSize: 18 }}>Interview</h1>
        <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
          {startLabel} → {endLabel} <span style={{ color: "#444" }}>·</span> {durationMinutes} min
        </p>
        {note && (
          <p style={{ margin: "12px 0 0", whiteSpace: "pre-wrap", fontSize: 13 }}>{note}</p>
        )}
      </div>

      {/* Pre-window: chat exists but is not writable. */}
      {phase === "before" && (
        <p className="muted" style={{ fontSize: 12 }}>
          The interview hasn&apos;t started yet. The chat opens automatically at {new Date(start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.
          Bookmark this page and come back at the scheduled time.
        </p>
      )}

      {phase === "live" && children}

      {phase === "ended" && (
        <>
          <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>The interview window has closed. Transcript below.</p>
          {children}
        </>
      )}
    </div>
  );
}
