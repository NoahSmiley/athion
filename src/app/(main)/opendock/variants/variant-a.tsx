// Variant A — Documentation/spec sheet. No cards. Pure typographic columns.
import Link from "next/link";
import { benchmarks, features, formatBytes, type VariantData } from "./shared";

export function VariantA({ data }: { data: VariantData }) {
  const dl = data.download;
  return (
    <>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.2 }}>Opendock</h1>
        {data.version && (
          <span style={{ fontSize: 11, color: "#828282", fontFamily: "var(--font-mono)" }}>
            v{data.version} · stable
          </span>
        )}
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, marginBottom: 24 }}>
        A native desktop workspace for kanban, notes, calendar, and Claude.
      </p>

      {dl && (
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12 }}>
          <a
            href={dl.url}
            className="cta-light"
            style={{ padding: "10px 18px", borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: "none" }}
          >
            Download for {dl.label}
          </a>
          <span className="muted">{formatBytes(dl.size)}</span>
          <Link href="/opendock/download" className="muted">Other platforms</Link>
          <Link href="/opendock/releases" className="muted">Release notes</Link>
        </div>
      )}

      <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#828282", margin: "32px 0 12px", fontWeight: 500 }}>
        § Capabilities
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "10px 24px", fontSize: 13 }}>
        {features.map(([name, desc]) => (
          <div key={name} style={{ display: "contents" }}>
            <span style={{ fontWeight: 600, color: "#fff" }}>{name}</span>
            <span style={{ color: "#c8c8c8" }}>{desc}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#828282", margin: "40px 0 12px", fontWeight: 500 }}>
        § Footprint
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr max-content max-content", gap: "8px 24px", fontSize: 13, fontFamily: "var(--font-mono)" }}>
        {benchmarks.map(([metric, ours, theirs]) => (
          <div key={metric} style={{ display: "contents" }}>
            <span style={{ color: "#c8c8c8" }}>{metric}</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{ours}</span>
            <span style={{ color: "#555" }}>Notion: {theirs}</span>
          </div>
        ))}
      </div>
    </>
  );
}
