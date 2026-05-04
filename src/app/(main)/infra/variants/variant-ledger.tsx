// B · Ledger — current card pattern, but tighter. Long lists collapse via <details>.
import Link from "next/link";
import { LiveStatus } from "../live-status";
import { labelOf, type ServiceData } from "./shared";

// Threshold above which a value collapses behind a <details> toggle.
const COLLAPSE_LEN = 60;

export function VariantLedger({ services }: { services: ServiceData[] }) {
  return (
    <>
      <h1>Infra</h1>
      <p className="muted">
        Servers and services we run for members. Self-hosted on athion hardware,
        no third-party clouds.
      </p>

      {services.map((s) => (
        <div key={s.id} style={{ marginTop: 24, border: "1px solid #2a2a2a", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{s.name}</h2>
              <span className="muted" style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                {labelOf(s.status)} · {s.kind}
              </span>
            </div>
            {s.liveProbe && <LiveStatus service={s.liveProbe} />}
          </div>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 13, lineHeight: 1.55 }}>
            {s.tagline}
          </p>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 16px", fontSize: 12 }}>
            {s.details.map(([k, v]) => (
              <span key={k} style={{ display: "contents" }}>
                <span className="muted">{k}</span>
                {v.length > COLLAPSE_LEN ? (
                  <details>
                    <summary style={{ cursor: "pointer", color: "#c8c8c8", listStyle: "none" }}>
                      {v.slice(0, COLLAPSE_LEN).replace(/[,(].*$/, "").trim()}
                      <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>show all →</span>
                    </summary>
                    <div style={{ marginTop: 4, color: "#c8c8c8", fontFamily: k === "Address" ? "var(--font-mono)" : undefined }}>{v}</div>
                  </details>
                ) : (
                  <span style={{ fontFamily: k === "Address" ? "var(--font-mono)" : undefined, color: "#c8c8c8" }}>{v}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>
        Have something we should host? Tell us in <Link href="#" style={{ color: "#828282" }}>#general</Link>.
      </p>
    </>
  );
}
