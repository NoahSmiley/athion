// Variant B — Sidebar metadata + content. Two-column layout, sidebar sticky on scroll.
import Link from "next/link";
import { benchmarks, features, formatBytes, type VariantData } from "./shared";

export function VariantB({ data }: { data: VariantData }) {
  const dl = data.download;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, alignItems: "start" }}>
      {/* Sidebar */}
      <aside style={{ position: "sticky", top: 56, fontSize: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>Opendock</h1>
        {data.version && (
          <div style={{ fontFamily: "var(--font-mono)", color: "#828282", marginTop: 4 }}>v{data.version}</div>
        )}
        {data.releasedAt && (
          <div style={{ color: "#555", marginTop: 4 }}>
            Released {data.releasedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        )}

        {dl && (
          <>
            <div style={{ marginTop: 18, color: "#828282" }}>{formatBytes(dl.size)} · {dl.label}</div>
            <a
              href={dl.url}
              className="cta-light"
              style={{
                display: "block",
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 12,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Download
            </a>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <Link href="/opendock/download" className="muted">Other platforms →</Link>
              <Link href="/opendock/releases" className="muted">Release notes →</Link>
              <Link href="/pricing" className="muted">Pricing →</Link>
            </div>
          </>
        )}

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid #1f1f1f", fontFamily: "var(--font-mono)", color: "#828282", display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>
          <span>RAM</span><span style={{ color: "#fff" }}>30 MB</span>
          <span>Bin</span><span style={{ color: "#fff" }}>18 MB</span>
          <span>Boot</span><span style={{ color: "#fff" }}>0.4s</span>
          <span>Off</span><span style={{ color: "#fff" }}>100%</span>
        </div>
      </aside>

      {/* Content */}
      <main style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, margin: 0, color: "#c8c8c8", lineHeight: 1.55 }}>
          A native desktop workspace. Kanban, notes, calendar, and Claude — local-first SQLite,
          no cloud, no Electron, no telemetry.
        </p>

        {features.map(([name, desc]) => (
          <div key={name} style={{ marginTop: 20 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>{name}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}

        <h2 style={{ marginTop: 32, fontSize: 14, fontWeight: 600, color: "#fff" }}>Benchmarks vs Notion</h2>
        <table style={{ marginTop: 8 }}>
          <thead><tr><th>Metric</th><th>Opendock</th><th>Notion</th></tr></thead>
          <tbody>
            {benchmarks.map(([m, o, n]) => (
              <tr key={m}><td>{m}</td><td><b>{o}</b></td><td className="muted">{n}</td></tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
