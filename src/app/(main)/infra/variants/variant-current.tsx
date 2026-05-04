// Current — the live layout.
import { LiveStatus } from "../live-status";
import { labelOf, type ServiceData } from "./shared";

export function VariantCurrent({ services }: { services: ServiceData[] }) {
  return (
    <>
      <h1>Infra</h1>
      <p className="muted">
        Servers and services we run for members. Self-hosted on athion hardware,
        no third-party clouds.
      </p>

      {services.map((s) => (
        <div key={s.id} style={{ marginTop: 24, border: "1px solid #2a2a2a", padding: "20px 22px" }}>
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
                <span>{v}</span>
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
