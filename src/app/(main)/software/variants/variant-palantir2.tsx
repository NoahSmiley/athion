// Palantir 2 — Dossier. Same intelligence-doc premise as Palantir but
// looser: REF codes in the margin, full sans-serif typography, each product
// reads as an expanded record entry rather than a ledger row.
import Link from "next/link";
import { formatBytes, type ProductData } from "./shared";

const statusCode = (s: ProductData["status"]) =>
  s === "active" ? "OPERATIONAL" : s === "beta" ? "PILOT" : "GREENFIELD";
const statusColor = (s: ProductData["status"]) =>
  s === "active" ? "#4caf50" : s === "beta" ? "#d4a017" : "#666";

export function VariantPalantir2({ products }: { products: ProductData[] }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      {/* Document header — small caps brief */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 14, borderBottom: "1px solid #2a2a2a", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 1.6, color: "#555", fontWeight: 500 }}>ATHION</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: "#fff" }}>
            Software dossier
          </h1>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, letterSpacing: 1.4, color: "#555" }}>
          <div>REV {today}</div>
          <div style={{ marginTop: 3 }}>{products.length} ENTRIES</div>
        </div>
      </div>

      {products.map((p, i) => {
        const ref = `SW-${String(i + 1).padStart(3, "0")}`;
        return (
          <Link
            key={p.slug}
            href={p.detailHref}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr",
              gap: 24,
              padding: "26px 0 28px",
              borderBottom: "1px solid #1a1a1a",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {/* REF column — sits in the margin like a footnote marker */}
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.4, color: "#555", fontWeight: 600 }}>{ref}</div>
              {p.version && (
                <div style={{ fontSize: 10, color: "#444", marginTop: 4, letterSpacing: 0.5 }}>
                  v{p.version}
                </div>
              )}
            </div>

            {/* Body */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: -0.2, color: "#fff" }}>
                  {p.name}
                </h2>
                <span style={{ fontSize: 10, letterSpacing: 1.2, color: statusColor(p.status), fontWeight: 600 }}>
                  {statusCode(p.status)}
                </span>
              </div>

              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.6 }}>
                {p.tagline}
              </p>

              <div style={{ marginTop: 14, fontSize: 11, color: "#828282", lineHeight: 1.7 }}>
                <span style={{ color: "#555", letterSpacing: 1, marginRight: 8 }}>CAPABILITIES</span>
                {p.capabilities.join(" · ")}
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: "#828282", lineHeight: 1.7 }}>
                <span style={{ color: "#555", letterSpacing: 1, marginRight: 8 }}>FOOTPRINT</span>
                {p.footprint}
              </div>
              {p.downloadSize != null && (
                <div style={{ marginTop: 4, fontSize: 11, color: "#828282", lineHeight: 1.7 }}>
                  <span style={{ color: "#555", letterSpacing: 1, marginRight: 8 }}>DOWNLOAD</span>
                  {formatBytes(p.downloadSize)}{p.downloadLabel ? ` · ${p.downloadLabel}` : ""}
                </div>
              )}
            </div>
          </Link>
        );
      })}

      <div style={{ marginTop: 20, fontSize: 10, color: "#444", letterSpacing: 1.4, textAlign: "right" }}>
        END OF DOSSIER
      </div>
    </div>
  );
}
