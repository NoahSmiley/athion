import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software",
  description: "Software products from Athion.",
};

const products: { name: string; href: string; tagline: string; status: string }[] = [
  {
    name: "OpenDock",
    href: "/opendock",
    tagline: "Local-first kanban, notes, calendar, and AI in a 30MB native desktop app.",
    status: "Active",
  },
];

export default function SoftwarePage() {
  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <h2>Products</h2>
      <table className="mobile-cards">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.name}>
              <td data-label="Name"><Link href={p.href}>{p.name}</Link></td>
              <td data-label="Status" className="muted">{p.status}</td>
              <td data-label="Description">{p.tagline}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted" style={{ marginTop: 16 }}>More coming. See <Link href="/labs">Labs</Link> for experiments and prototypes.</p>

      <p className="muted" style={{ marginTop: 24, fontSize: 11, borderTop: "1px solid #1a1a1a", paddingTop: 12 }}>
        Mockups for review:{" "}
        <Link href="/software/v1">v1 — Hero card</Link>{" · "}
        <Link href="/software/v2">v2 — Manifesto</Link>{" · "}
        <Link href="/software/v3">v3 — Benchmarks</Link>{" · "}
        <Link href="/software/v4">v4 — Roadmap</Link>
      </p>
    </>
  );
}
