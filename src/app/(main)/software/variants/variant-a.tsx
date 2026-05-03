// Variant A — Index list. No borders, no cards. Each product is a row.
import Link from "next/link";
import { formatBytes, type ProductData } from "./shared";

export function VariantA({ products }: { products: ProductData[] }) {
  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 28 }}>
        {products.map((p, i) => (
          <div
            key={p.slug}
            style={{
              padding: "20px 0",
              borderTop: i === 0 ? "1px solid #1f1f1f" : "none",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <Link href={p.detailHref} style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>
                {p.name}
              </Link>
              {p.version && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282" }}>v{p.version}</span>
              )}
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#555" }}>{p.footprint}</span>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>
              {p.tagline}
            </p>
            <div style={{ marginTop: 10, display: "flex", gap: 14, fontSize: 12, alignItems: "center", flexWrap: "wrap" }}>
              {p.downloadUrl && (
                <>
                  <a href={p.downloadUrl} style={{ color: "#fff", fontWeight: 500 }}>
                    Download{p.downloadLabel ? ` for ${p.downloadLabel}` : ""}
                  </a>
                  {p.downloadSize != null && <span style={{ color: "#555", fontSize: 11 }}>{formatBytes(p.downloadSize)}</span>}
                  <span style={{ color: "#333" }}>·</span>
                </>
              )}
              <Link href={p.detailHref} className="muted">Learn more →</Link>
              {p.pricingHref && (
                <>
                  <span style={{ color: "#333" }}>·</span>
                  <Link href={p.pricingHref} className="muted">Pricing</Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>More coming.</p>
    </>
  );
}
