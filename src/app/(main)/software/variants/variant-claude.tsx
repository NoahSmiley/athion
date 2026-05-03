// Claude — editorial / soft. Each product is a paragraph, not a card.
// Status in prose ("Available now" / "In private beta"), one quiet read-more link.
import Link from "next/link";
import type { ProductData } from "./shared";

const statusPhrase = (s: ProductData["status"]) =>
  s === "active" ? "Available now." : s === "beta" ? "In private beta." : "On the roadmap.";

export function VariantClaude({ products }: { products: ProductData[] }) {
  return (
    <div style={{ maxWidth: 580 }}>
      <p style={{ fontSize: 14, color: "#c8c8c8", lineHeight: 1.65, marginTop: 0, marginBottom: 48 }}>
        We make a small number of tools for the way we like to work — local-first, lean,
        and crafted to last. Each one is built in the open and shipped on its own pace.
      </p>

      {products.map((p, i) => (
        <article
          key={p.slug}
          style={{
            paddingTop: i === 0 ? 0 : 36,
            paddingBottom: 36,
            borderBottom: i === products.length - 1 ? "none" : "1px solid #161616",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: -0.4, color: "#fff" }}>
            {p.name}
            {p.version && (
              <span style={{ color: "#555", fontWeight: 400, marginLeft: 10, fontSize: 13, fontFamily: "var(--font-mono)" }}>
                v{p.version}
              </span>
            )}
          </h2>
          <p style={{ marginTop: 12, fontSize: 15, color: "#c8c8c8", lineHeight: 1.65 }}>
            {p.tagline}
          </p>
          <p style={{ marginTop: 10, fontSize: 13, color: "#828282", lineHeight: 1.7, fontStyle: "italic" }}>
            {p.capabilities.slice(0, -1).join(", ")} and {p.capabilities[p.capabilities.length - 1]}.
            {" "}
            {p.footprint.replace(/·/g, "—")}.
          </p>
          <p style={{ marginTop: 16, fontSize: 13, color: "#666" }}>
            {statusPhrase(p.status)}{" "}
            <Link
              href={p.detailHref}
              style={{ color: "#d97757", textDecoration: "none", borderBottom: "1px solid #d9775744", paddingBottom: 1 }}
            >
              Read more →
            </Link>
          </p>
        </article>
      ))}
    </div>
  );
}
