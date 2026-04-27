import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — v1 Document",
  description: "Software products from Athion.",
};

const products = [
  {
    name: "OpenDock",
    href: "/opendock",
    tagline: "Local-first kanban, notes, calendar, and AI in a 30MB native desktop app.",
    status: "Active",
  },
];

const principles = [
  ["Local-first", "Your data lives on your machine. Cloud is optional, never required."],
  ["Native, not Electron", "Tauri + Rust. A 30MB binary, not 380MB."],
  ["Offline by default", "Every feature works without a network. Sync is an enhancement, not a dependency."],
  ["No telemetry", "Nothing leaves your machine without you asking."],
  ["Built to outlast us", "SQLite on disk, plain-text export, open formats. If we vanish, your data doesn't."],
];

const statuses = [
  ["Active", "Shipping. Updated regularly, supported, paid."],
  ["Beta", "Feature-complete, public, still rough at the edges."],
  ["In design", "Scoped and prototyped, not yet shipping."],
  ["Planned", "On the roadmap, not started."],
  ["Archived", "We stopped working on it. Source available, no further updates."],
];

const budget = [
  ["Memory (idle)", "≤ 50 MB"],
  ["Memory (active)", "≤ 100 MB"],
  ["Binary size", "≤ 25 MB"],
  ["Cold start", "≤ 0.5 s"],
  ["CPU (idle)", "< 1 %"],
  ["Offline support", "100 %"],
];

const stack = [
  ["Language", "Rust"],
  ["Runtime", "Tauri"],
  ["Storage", "SQLite"],
  ["UI", "React + TypeScript"],
  ["Sync", "Optional, end-to-end encrypted"],
  ["Distribution", "Direct download, signed binaries"],
];

const faq = [
  ["How do I get it?", <>Subscribe on <Link href="/pricing">/pricing</Link>, then download from <Link href="/opendock">/opendock</Link>. Members only.</>],
  ["Does it phone home?", "No. Telemetry is off by default and there's nothing to opt into. Sync, when you turn it on, is end-to-end encrypted."],
  ["What if Athion shuts down?", "Your data is a local SQLite file. Plain-text export is a click. Open the file with any SQLite client and it's all there."],
  ["Why so few products?", "We'd rather ship one thing that lasts than five that don't. New products only enter Active when they hold the budget above on real hardware."],
];

export default function SoftwareV1() {
  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build, ship, and support. Local-first, lean, and crafted for the long term — Labs is for experiments, this list is for things you can rely on.</p>

      <h2>Principles</h2>
      <ul>{principles.map(([t, d]) => <li key={t}><b>{t}</b> &ndash; {d}</li>)}</ul>

      <h2>Products</h2>
      <table className="mobile-cards">
        <thead>
          <tr><th>Name</th><th>Status</th><th>Description</th></tr>
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
      <p className="muted" style={{ marginTop: 8 }}>One product, on purpose. New ones graduate from <Link href="/labs">Labs</Link> only after they hold the budget below.</p>

      <h2>Status</h2>
      <ul>{statuses.map(([t, d]) => <li key={t}><b>{t}</b> &ndash; {d}</li>)}</ul>

      <h2>Performance budget</h2>
      <p className="muted">Every Active product is held to these targets on commodity hardware. Miss any and it doesn&apos;t graduate.</p>
      <table>
        <tbody>
          {budget.map(([l, v]) => (
            <tr key={l}>
              <td className="muted">{l}</td>
              <td style={{ fontFamily: "var(--font-mono)" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Stack</h2>
      <table>
        <tbody>
          {stack.map(([l, v]) => (
            <tr key={l}>
              <td className="muted">{l}</td>
              <td style={{ fontFamily: "var(--font-mono)" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Questions</h2>
      {faq.map(([q, a], i) => (
        <div key={i} style={{ marginTop: 8 }}>
          <p><b>{q}</b></p>
          <p className="muted" style={{ marginTop: 2 }}>{a}</p>
        </div>
      ))}

      <h2>Related</h2>
      <ul>
        <li><Link href="/labs">Labs</Link> &ndash; experiments and prototypes</li>
        <li><Link href="/security">Security</Link> &ndash; how we protect your data</li>
        <li><Link href="/about">About</Link> &ndash; what Athion is</li>
      </ul>
    </>
  );
}
