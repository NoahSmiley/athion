import type { Metadata } from "next";
import { LiveStatus } from "./live-status";

export const metadata: Metadata = {
  title: "Infra",
  description: "Servers and services Athion runs for members.",
};

type Service = {
  name: string;
  kind: string;
  status: "live" | "private" | "planned";
  tagline: string;
  details: [string, string][];
  liveProbe?: "zomboid" | "minecraft";
};

const services: Service[] = [
  {
    name: "Project Zomboid",
    kind: "Game server",
    status: "live",
    tagline: "Co-op survival on a heavily modded Kentucky map. PVP enabled, persistent world, members-only whitelist.",
    liveProbe: "zomboid",
    details: [
      ["Address", "pz.athion.me:27045 (DNS pending — ask in #general)"],
      ["Version", "41.78 — Build 41"],
      ["Slots", "8 players max"],
      ["Whitelist", "members only"],
      ["Mods", "98 active (Brita's, Arsenal Gunfighter, Tetris inventory, KI5 vehicles, +95 more)"],
      ["Maps", "22-map stack (Frankfort KY, Trimble County, Bedford Falls, Blackwood, Muldraugh, …)"],
    ],
  },
  {
    name: "Minecraft",
    kind: "Game server",
    status: "live",
    tagline: "Private survival server for members. Persistent world, no resets.",
    liveProbe: "minecraft",
    details: [
      ["Address", "mc.athion.me"],
      ["Version", "1.21.4 — NeoForge"],
      ["Whitelist", "members only"],
      ["Backup", "hourly snapshots, 7-day retention"],
    ],
  },
];

const labelOf = (s: Service["status"]) =>
  s === "live" ? "Live" : s === "private" ? "Private beta" : "Planned";

export default function InfraPage() {
  return (
    <>
      <h1>Infra</h1>
      <p className="muted">
        Servers and services we run for members. Self-hosted on athion hardware,
        no third-party clouds.
      </p>

      {services.map((s) => (
        <div key={s.name} style={{ marginTop: 24, border: "1px solid #2a2a2a", padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{s.name}</h2>
              <span className="muted" style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {labelOf(s.status)} · {s.kind}
              </span>
            </div>
            {s.liveProbe && <LiveStatus service={s.liveProbe} />}
          </div>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, lineHeight: 1.55 }}>
            {s.tagline}
          </p>

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "max-content 1fr", gap: "6px 18px", fontSize: 12 }}>
            {s.details.map(([k, v]) => (
              <span key={k} style={{ display: "contents" }}>
                <span className="muted">{k}</span>
                <span style={{ fontFamily: k === "Address" ? "var(--font-mono)" : undefined }}>{v}</span>
              </span>
            ))}
          </div>
        </div>
      ))}

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>
        Have something we should host? Tell us in #general.
      </p>
    </>
  );
}
