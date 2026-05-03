// Variant D — C's hero panel + B's per-feature sections. Lead with impact, reward scrolling with substance.
import Link from "next/link";
import { benchmarks, features, formatBytes, heroStats, type VariantData } from "./shared";

export function VariantD({ data }: { data: VariantData }) {
  const dl = data.download;
  return (
    <>
      {/* Hero panel (from C) */}
      <div style={{ border: "1px solid #2a2a2a", padding: "32px 36px", background: "#0a0a0a" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: -0.4 }}>Opendock</h1>
          {data.version && (
            <span style={{ fontSize: 11, color: "#828282", fontFamily: "var(--font-mono)" }}>
              v{data.version}
            </span>
          )}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#c8c8c8", lineHeight: 1.5 }}>
          A native desktop workspace.
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#828282" }}>
          Kanban · Notes · Calendar · Claude
        </p>

        {dl && (
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12 }}>
            <a
              href={dl.url}
              className="cta-light"
              style={{ padding: "11px 20px", borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: "none" }}
            >
              Download for {dl.label}
            </a>
            <span className="muted">{formatBytes(dl.size)}</span>
          </div>
        )}

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #1f1f1f", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {heroStats.map((s) => (
            <div key={s.label}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "#fff", lineHeight: 1, letterSpacing: -0.3 }}>{s.value}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282" }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: "#c8c8c8", marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{ margin: "24px 0 0", paddingTop: 20, borderTop: "1px solid #1f1f1f", fontSize: 12, color: "#828282" }}>
          Local-first SQLite. No cloud. No Electron. No telemetry.
        </p>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 18, fontSize: 12 }}>
        <Link href="/opendock/download" className="muted">Other platforms →</Link>
        <Link href="/opendock/releases" className="muted">Release notes →</Link>
        <Link href="/pricing" className="muted">Pricing →</Link>
      </div>

      {/* Per-feature sections (from B) */}
      <div style={{ marginTop: 40 }}>
        {features.map(([name, desc]) => (
          <div key={name} style={{ marginTop: 22 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>{name}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 40 }}>Benchmarks vs Notion</h2>
      <table>
        <thead><tr><th>Metric</th><th>Opendock</th><th>Notion</th></tr></thead>
        <tbody>
          {benchmarks.map(([m, o, n]) => (
            <tr key={m}><td>{m}</td><td><b>{o}</b></td><td className="muted">{n}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
