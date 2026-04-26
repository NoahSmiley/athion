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
      <table>
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
              <td><Link href={p.href}>{p.name}</Link></td>
              <td className="muted">{p.status}</td>
              <td>{p.tagline}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted" style={{ marginTop: 16 }}>More coming. See <Link href="/labs">Labs</Link> for experiments and prototypes.</p>
    </>
  );
}
