// A · Rack — homelab inventory. Each service is a 1U-style row.
// Mono ID on the left, name + status mid, terse spec right. Click the row to expand.
import Link from "next/link";
import { LiveStatus } from "../live-status";
import type { ServiceData } from "./shared";

const dot = (s: ServiceData["status"]) =>
  s === "live" ? "#4caf50" : s === "private" ? "#d4a017" : "#555";

export function VariantRack({ services }: { services: ServiceData[] }) {
  return (
    <>
      <h1>Infra</h1>
      <p className="muted">
        Servers and services we run for members. Self-hosted on athion hardware,
        no third-party clouds.
      </p>

      <div style={{ marginTop: 28, border: "1px solid #1f1f1f" }}>
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr max-content",
            gap: 14,
            padding: "8px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: 1.4,
            color: "#444",
            background: "#080808",
            borderBottom: "1px solid #1f1f1f",
          }}
        >
          <span>ID</span>
          <span>SERVICE</span>
          <span>STATUS</span>
        </div>

        {services.map((s, i) => (
          <details
            key={s.id}
            style={{
              borderTop: i === 0 ? "none" : "1px solid #161616",
            }}
          >
            <summary
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr max-content",
                gap: 14,
                alignItems: "center",
                padding: "12px 16px",
                cursor: "pointer",
                listStyle: "none",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282", letterSpacing: 0.5 }}>
                {s.id}
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0, flexWrap: "wrap" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: 11, color: "#828282", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.shortSpec}
                </span>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot(s.status) }} />
                {s.liveProbe ? <LiveStatus service={s.liveProbe} /> : <span style={{ color: dot(s.status) }}>{s.status}</span>}
              </span>
            </summary>

            <div style={{ padding: "0 16px 16px 76px" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#c8c8c8", lineHeight: 1.55 }}>
                {s.tagline}
              </p>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 16px", fontSize: 11 }}>
                {s.details.map(([k, v]) => (
                  <span key={k} style={{ display: "contents" }}>
                    <span className="muted">{k}</span>
                    <span style={{ fontFamily: k === "Address" ? "var(--font-mono)" : undefined, color: "#c8c8c8" }}>{v}</span>
                  </span>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 16, fontSize: 11 }}>
        Click a row to expand. Have something we should host? Tell us in <Link href="#" style={{ color: "#828282" }}>#general</Link>.
      </p>
    </>
  );
}
