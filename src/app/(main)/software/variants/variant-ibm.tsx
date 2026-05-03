// IBM Carbon — industrial, dense, grid-based, sharp 90° corners, blue accent.
// Uppercase metadata labels in 10px tracking, hard 2px bottom rule per "tile".
import Link from "next/link";
import { formatBytes, type ProductData } from "./shared";

const IBM_BLUE = "#4589ff";

const statusLabel = (s: ProductData["status"]) => s.toUpperCase();
const statusBg = (s: ProductData["status"]) =>
  s === "active" ? "#0e3a17" : s === "beta" ? "#3a2a0e" : "#222";
const statusFg = (s: ProductData["status"]) =>
  s === "active" ? "#42be65" : s === "beta" ? "#f1c21b" : "#a8a8a8";

export function VariantIBM({ products }: { products: ProductData[] }) {
  return (
    <div>
      {/* Page header — IBM-style heavy hairline */}
      <div style={{ paddingBottom: 16, borderBottom: "1px solid #2a2a2a", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.6, color: "#555" }}>
          PRODUCTS / SOFTWARE
        </div>
        <h1 style={{ margin: "8px 0 4px", fontSize: 32, fontWeight: 300, letterSpacing: -0.6, color: "#fff" }}>
          Software portfolio
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1f1f1f" }}>
        {products.map((p) => (
          <Link
            key={p.slug}
            href={p.detailHref}
            style={{
              display: "block",
              padding: "24px 22px 22px",
              background: "#0a0a0a",
              borderBottom: `2px solid ${IBM_BLUE}`,
              textDecoration: "none",
              color: "inherit",
              transition: "background 0.15s",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "2px 8px",
                background: statusBg(p.status),
                color: statusFg(p.status),
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: 1.2,
                fontWeight: 600,
              }}
            >
              {statusLabel(p.status)}
            </div>

            <h2 style={{ margin: "16px 0 0", fontSize: 24, fontWeight: 400, letterSpacing: -0.3, color: "#fff" }}>
              {p.name}
            </h2>
            {p.version && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282", marginTop: 2 }}>
                Version {p.version}
              </div>
            )}

            <p style={{ margin: "14px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>
              {p.tagline}
            </p>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #1f1f1f" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1.4, color: "#666", marginBottom: 4 }}>
                CAPABILITIES
              </div>
              <div style={{ fontSize: 12, color: "#c8c8c8" }}>{p.capabilities.join(" · ")}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1.4, color: "#666", marginBottom: 4 }}>
                FOOTPRINT
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#c8c8c8" }}>{p.footprint}</div>
            </div>

            {p.downloadSize != null && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1.4, color: "#666", marginBottom: 4 }}>
                  DOWNLOAD
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#c8c8c8" }}>
                  {formatBytes(p.downloadSize)}{p.downloadLabel ? ` · ${p.downloadLabel}` : ""}
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, fontSize: 13, color: IBM_BLUE, letterSpacing: 0.2 }}>
              Learn more →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
