// Palantir — numbered ledger. Reads like an internal asset registry.
// Mono caps, reference codes, terse codeword statuses, ISO timestamps.
import Link from "next/link";
import type { ProductData } from "./shared";

const statusCode = (s: ProductData["status"]) =>
  s === "active" ? "OPERATIONAL" : s === "beta" ? "PILOT" : "GREENFIELD";
const statusColor = (s: ProductData["status"]) =>
  s === "active" ? "#4caf50" : s === "beta" ? "#d4a017" : "#666";

export function VariantPalantir({ products }: { products: ProductData[] }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div style={{ fontFamily: "var(--font-mono)" }}>
      {/* Document header */}
      <div style={{ paddingBottom: 12, borderBottom: "1px solid #1f1f1f", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, color: "#555" }}>ATHION / SOFTWARE ASSET REGISTRY</div>
        <div style={{ fontSize: 10, letterSpacing: 1.4, color: "#555", marginTop: 4 }}>
          REV {today.replace(/-/g, "")} · {products.length} ASSETS · CLASSIFICATION INTERNAL
        </div>
      </div>

      {/* Column header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 90px 110px",
          gap: 14,
          padding: "8px 0",
          fontSize: 10,
          letterSpacing: 1.4,
          color: "#555",
          borderBottom: "1px solid #161616",
        }}
      >
        <span>REF</span>
        <span>ASSET</span>
        <span>VER</span>
        <span style={{ textAlign: "right" }}>STATUS</span>
      </div>

      {products.map((p, i) => {
        const ref = `SW-${String(i + 1).padStart(3, "0")}`;
        return (
          <Link
            key={p.slug}
            href={p.detailHref}
            style={{
              display: "block",
              padding: "20px 0 22px",
              borderBottom: "1px solid #161616",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 90px 110px", gap: 14, alignItems: "baseline" }}>
              <span style={{ color: "#555", fontSize: 11 }}>{ref}</span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: 0.2 }}>
                {p.name.toUpperCase()}
              </span>
              <span style={{ color: "#828282", fontSize: 11 }}>
                {p.version ? `v${p.version}` : "—"}
              </span>
              <span style={{ textAlign: "right", fontSize: 11, color: statusColor(p.status), letterSpacing: 1 }}>
                [{statusCode(p.status)}]
              </span>
            </div>

            <div style={{ marginTop: 12, paddingLeft: 58, fontSize: 12, color: "#c8c8c8", fontFamily: "var(--font-sans)", lineHeight: 1.55 }}>
              {p.tagline}
            </div>

            <div
              style={{
                marginTop: 10,
                paddingLeft: 58,
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                rowGap: 4,
                columnGap: 14,
                fontSize: 11,
              }}
            >
              <span style={{ color: "#555" }}>CAPS</span>
              <span style={{ color: "#828282" }}>{p.capabilities.join(", ").toUpperCase()}</span>
              <span style={{ color: "#555" }}>FOOTPRINT</span>
              <span style={{ color: "#828282" }}>{p.footprint.toUpperCase()}</span>
            </div>
          </Link>
        );
      })}

      <div style={{ marginTop: 18, fontSize: 10, color: "#444", letterSpacing: 1.2 }}>
        END OF REGISTRY · {products.length} RECORDS
      </div>
    </div>
  );
}
