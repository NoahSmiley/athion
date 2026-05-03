"use client";
import { useEffect, useState } from "react";

type Status = {
  online: boolean;
  players?: number;
  maxPlayers?: number;
  uptimeSeconds?: number;
  error?: string;
  checkedAt: number;
};

type Payload = {
  zomboid?: Status;
  minecraft?: Status;
};

function formatUptime(seconds?: number): string | null {
  if (!seconds || seconds < 0) return null;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function LiveStatus({ service }: { service: "zomboid" | "minecraft" }) {
  const [data, setData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch("/api/infra/status", { cache: "no-store" });
        const j: Payload = await r.json();
        if (!cancelled) { setData(j[service] ?? null); setLoading(false); }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [service]);

  if (loading) {
    return <span className="muted" style={{ fontSize: 11 }}>checking…</span>;
  }
  if (!data || !data.online) {
    return (
      <span style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c44" }} />
        Offline
      </span>
    );
  }
  const uptime = formatUptime(data.uptimeSeconds);
  const players = data.maxPlayers != null ? `${data.players}/${data.maxPlayers}` : `${data.players}`;
  return (
    <span style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 6px #4caf5066" }} />
      <span>Online · {players} players{uptime ? ` · up ${uptime}` : ""}</span>
    </span>
  );
}
