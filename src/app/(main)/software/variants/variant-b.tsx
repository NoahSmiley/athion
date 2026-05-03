// Variant B — Sidebar mirror. Each product card has download-side / content-side split.
import Link from "next/link";
import { formatBytes, type ProductData } from "./shared";

export function VariantB({ products }: { products: ProductData[] }) {
  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        {products.map((p) => (
          <div
            key={p.slug}
            style={{
              border: "1px solid #2a2a2a",
              padding: "20px 22px",
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: 28,
              alignItems: "start",
            }}
          >
            {/* Left: identity + download */}
            <div style={{ fontSize: 12 }}>
              <Link href={p.detailHref} style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>
                {p.name}
              </Link>
              {p.version && (
                <div style={{ fontFamily: "var(--font-mono)", color: "#828282", marginTop: 4 }}>v{p.version}</div>
              )}
              {p.downloadUrl && (
                <>
                  <div style={{ marginTop: 12, color: "#555", fontSize: 11 }}>
                    {p.downloadSize != null && formatBytes(p.downloadSize)}
                    {p.downloadLabel ? ` · ${p.downloadLabel}` : ""}
                  </div>
                  <a
                    href={p.downloadUrl}
                    className="cta-light"
                    style={{
                      display: "block",
                      marginTop: 6,
                      padding: "8px 12px",
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    Download
                  </a>
                </>
              )}
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                <Link href={p.detailHref} className="muted">Learn more →</Link>
                {p.pricingHref && <Link href={p.pricingHref} className="muted">Pricing →</Link>}
              </div>
            </div>

            {/* Right: tagline + capabilities */}
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{p.tagline}</p>
              <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282" }}>
                {p.capabilities.join(" · ")}
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "#555" }}>
                {p.footprint}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>More coming.</p>
    </>
  );
}
