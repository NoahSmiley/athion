import type { Metadata } from "next";
import { LiveStatus } from "./live-status";
import { ConnectButton } from "./connect-button";
import { LiveClock } from "./live-clock";

export const metadata: Metadata = {
  title: "Infra",
  description: "Servers and services Athion runs for members.",
};

type Service = {
  id: string;
  name: string;
  status: "live" | "private" | "planned";
  shortSpec: string;
  liveProbe?: "zomboid" | "minecraft";
  address?: string;
};

const services: Service[] = [
  {
    id: "PZ-01",
    name: "Project Zomboid",
    status: "live",
    shortSpec: "v41.78 · 8 slots · 98 mods",
    liveProbe: "zomboid",
    address: "pz.athion.me:27045",
  },
  {
    id: "MC-01",
    name: "Minecraft",
    status: "live",
    shortSpec: "v1.21.4 · NeoForge",
    liveProbe: "minecraft",
    address: "mc.athion.me",
  },
];

const labelOf = (s: Service["status"]) =>
  s === "live" ? "Live" : s === "private" ? "Private beta" : "Planned";

const dot = (s: Service["status"]) =>
  s === "live" ? "#4caf50" : s === "private" ? "#d4a017" : "#555";

export default function InfraPage() {
  const liveCount = services.filter((s) => s.status === "live").length;

  return (
    <>
      <h1>Infra</h1>
      <p className="muted">Live operations panel. Self-hosted on athion hardware.</p>

      {/* Aggregate header */}
      <div
        style={{
          marginTop: 24,
          padding: "12px 16px",
          border: "1px solid #1f1f1f",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 11,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 6px #4caf5066" }} />
          <span style={{ color: "#fff" }}>{services.length} services</span>
          <span style={{ color: "#555" }}>·</span>
          <span style={{ color: "#4caf50" }}>{liveCount} online</span>
          <span style={{ color: "#555" }}>·</span>
          <span style={{ color: "#828282" }}>0 issues</span>
        </span>
        <LiveClock />
      </div>

      {/* Service rows */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {services.map((s) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "max-content 1fr max-content",
              alignItems: "center",
              gap: 16,
              padding: "14px 18px",
              border: "1px solid #1f1f1f",
              background: "#0a0a0a",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: dot(s.status),
                  boxShadow: s.status === "live" ? `0 0 6px ${dot(s.status)}66` : "none",
                }}
              />
            </span>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: 11, color: "#828282" }}>{s.shortSpec}</span>
                <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>
                  {labelOf(s.status)}
                </span>
              </div>
              <div style={{ marginTop: 4, fontSize: 11 }}>
                {s.liveProbe ? <LiveStatus service={s.liveProbe} dotless /> : <span className="muted">no live probe</span>}
              </div>
            </div>

            <ConnectButton address={s.address} />
          </div>
        ))}
      </div>

    </>
  );
}
