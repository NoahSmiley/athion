// C · Console — Datadog-style live operations panel. Aggregate header pinned at top,
// service rows below with live counts and a copy-to-clipboard Connect action.
"use client";
import { useEffect, useState } from "react";
import { LiveStatus } from "../live-status";
import { labelOf, type ServiceData } from "./shared";

const dot = (s: ServiceData["status"]) =>
  s === "live" ? "#4caf50" : s === "private" ? "#d4a017" : "#555";

function ConnectButton({ address }: { address?: string }) {
  const [copied, setCopied] = useState(false);
  if (!address) return null;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(address.replace(/\s\(.*\)$/, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      style={{
        background: copied ? "#1e3a1e" : "#0e0e0e",
        border: `1px solid ${copied ? "#2a4a2a" : "#1f1f1f"}`,
        color: copied ? "#4caf50" : "#c8c8c8",
        padding: "6px 12px",
        fontSize: 11,
        cursor: "pointer",
        borderRadius: 3,
        transition: "all 0.15s",
      }}
    >
      {copied ? "✓ copied" : ">_ connect"}
    </button>
  );
}

export function VariantConsole({ services }: { services: ServiceData[] }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const liveCount = services.filter((s) => s.status === "live").length;

  return (
    <>
      <h1>Infra</h1>
      <p className="muted">
        Live operations panel. Self-hosted on athion hardware.
      </p>

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
        <span style={{ color: "#555" }}>{now} UTC</span>
      </div>

      {/* Service rows */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {services.map((s) => {
          const address = s.details.find(([k]) => k === "Address")?.[1];
          return (
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
                  <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>{labelOf(s.status)}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 11 }}>
                  {s.liveProbe ? <LiveStatus service={s.liveProbe} /> : <span className="muted">no live probe</span>}
                </div>
              </div>

              <ConnectButton address={address} />
            </div>
          );
        })}
      </div>

      <p className="muted" style={{ marginTop: 16, fontSize: 11 }}>
        polling every 30s · click connect to copy address
      </p>
    </>
  );
}
