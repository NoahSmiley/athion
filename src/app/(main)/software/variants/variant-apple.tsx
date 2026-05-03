// Apple — hero per product. Big oversized name, generous whitespace, center-aligned.
// One product per scroll-screen. Status hidden. CTA is a single quiet text link.
import Link from "next/link";
import type { ProductData } from "./shared";

export function VariantApple({ products }: { products: ProductData[] }) {
  return (
    <div style={{ paddingTop: 8 }}>
      {products.map((p, i) => (
        <section
          key={p.slug}
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 24px",
            borderTop: i === 0 ? "none" : "1px solid #1a1a1a",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 64,
              fontWeight: 300,
              letterSpacing: -1.8,
              color: "#fff",
              lineHeight: 1.05,
            }}
          >
            {p.name}
          </h2>
          <p style={{ margin: "20px auto 0", fontSize: 18, color: "#c8c8c8", lineHeight: 1.45, maxWidth: 540, fontWeight: 300 }}>
            {p.tagline}
          </p>
          <Link
            href={p.detailHref}
            style={{
              marginTop: 36,
              fontSize: 14,
              color: "#fff",
              textDecoration: "none",
              borderBottom: "1px solid #555",
              paddingBottom: 2,
            }}
          >
            Learn more
          </Link>
        </section>
      ))}
    </div>
  );
}
