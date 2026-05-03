// Current — the live layout (per-product mini-manifest cards, whole card is link).
import Link from "next/link";
import { formatBytes, type ProductData } from "./shared";

const statusColor = (s: ProductData["status"]) =>
  s === "active" ? "#4caf50" : s === "beta" ? "#d4a017" : "#555";

export function VariantCurrent({ products }: { products: ProductData[] }) {
  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 22 }}>
        {products.map((p) => (
          <Link
            key={p.slug}
            href={p.detailHref}
            className="software-card"
            style={{ display: "block", border: "1px solid #1f1f1f", textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 18px",
                background: "#0a0a0a",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{p.name}</span>
                {p.version && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282" }}>
                    v{p.version}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(p.status) }} />
                  <span style={{ color: statusColor(p.status), textTransform: "capitalize" }}>{p.status}</span>
                </span>
              </div>
              <span className="software-card-arrow muted" style={{ fontSize: 12 }}>→</span>
            </div>

            <p style={{ margin: 0, padding: "16px 18px 4px", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>
              {p.tagline}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                rowGap: 6,
                columnGap: 18,
                padding: "10px 18px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#555" }}>Capabilities</span>
              <span style={{ color: "#c8c8c8" }}>{p.capabilities.join(" · ")}</span>

              <span style={{ color: "#555" }}>Footprint</span>
              <span style={{ color: "#c8c8c8" }}>{p.footprint}</span>

              {p.downloadSize != null && (
                <>
                  <span style={{ color: "#555" }}>Download</span>
                  <span style={{ color: "#c8c8c8" }}>
                    {formatBytes(p.downloadSize)}
                    {p.downloadLabel ? ` · ${p.downloadLabel}` : ""}
                  </span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>More coming.</p>
    </>
  );
}
