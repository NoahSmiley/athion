// Variant C — Manifest table. Looks like a release manifest or `kubectl get`.
import Link from "next/link";
import { formatBytes, type ProductData } from "./shared";

const statusColor = (s: ProductData["status"]) =>
  s === "active" ? "#4caf50" : s === "beta" ? "#d4a017" : "#555";

export function VariantC({ products }: { products: ProductData[] }) {
  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 28, border: "1px solid #1f1f1f", overflow: "hidden" }}>
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 0.7fr 0.6fr 1.1fr 0.9fr",
            gap: 14,
            padding: "10px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "#555",
            background: "#0a0a0a",
            borderBottom: "1px solid #1f1f1f",
          }}
        >
          <span>Product</span>
          <span>Version</span>
          <span>Status</span>
          <span>Footprint</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {products.map((p, i) => (
          <div
            key={p.slug}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 0.7fr 0.6fr 1.1fr 0.9fr",
              gap: 14,
              padding: "16px 16px",
              alignItems: "center",
              fontSize: 13,
              borderTop: i === 0 ? "none" : "1px solid #161616",
            }}
          >
            <div>
              <Link href={p.detailHref} style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                {p.name}
              </Link>
              <div style={{ marginTop: 3, fontSize: 12, color: "#828282", lineHeight: 1.4 }}>
                {p.tagline}
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#c8c8c8" }}>
              {p.version ? `v${p.version}` : <span style={{ color: "#444" }}>—</span>}
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(p.status) }} />
              <span style={{ color: statusColor(p.status), textTransform: "capitalize" }}>{p.status}</span>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282" }}>
              {p.footprint}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, fontSize: 12, alignItems: "center" }}>
              {p.downloadUrl ? (
                <a
                  href={p.downloadUrl}
                  className="cta-light"
                  style={{ padding: "6px 12px", borderRadius: 4, fontWeight: 600, fontSize: 11, textDecoration: "none" }}
                >
                  Download
                </a>
              ) : (
                <Link href={p.detailHref} className="muted" style={{ fontSize: 12 }}>Open →</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.some((p) => p.downloadSize != null) && (
        <p className="muted" style={{ marginTop: 14, fontSize: 11, fontFamily: "var(--font-mono)", textAlign: "right" }}>
          {products
            .filter((p) => p.downloadSize != null)
            .map((p) => `${p.name} ${formatBytes(p.downloadSize!)}`)
            .join(" · ")}
        </p>
      )}

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>More coming.</p>
    </>
  );
}
