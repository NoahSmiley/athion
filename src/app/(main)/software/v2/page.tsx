import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — v2 Catalog",
  description: "Software products from Athion.",
};

const benchmarks: [string, string, string][] = [
  ["Memory (idle)", "30 MB", "450 MB"],
  ["Memory (active)", "65 MB", "680 MB"],
  ["Binary size", "18 MB", "380 MB"],
  ["Startup", "0.4 s", "3.2 s"],
  ["CPU (idle)", "0.3 %", "4.5 %"],
  ["Offline", "100 %", "20 %"],
];

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      padding: "1px 6px",
      border: "1px solid #2a2a2a",
      color: "#c8c8c8",
      marginLeft: 8,
      verticalAlign: "1px",
    }}>
      {children}
    </span>
  );
}

export default function SoftwareV2() {
  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build, ship, and support. One catalog entry per product — when there are more, there will be more entries.</p>

      <h2 style={{ marginTop: 24 }}>
        <Link href="/opendock">OpenDock</Link>
        <StatusPill>Active</StatusPill>
      </h2>
      <p className="muted">v0.1 &middot; macOS, Windows, Linux &middot; Tauri + Rust + SQLite</p>
      <p style={{ marginTop: 8 }}>
        Local-first kanban, notes, calendar, and AI in a single native desktop app. SQLite on
        your machine, no cloud dependency, no Electron bloat. Claude is built in and reads your
        boards, notes, and calendar — privately, on your terms.
      </p>

      <h3 style={{ fontSize: 13, fontWeight: 600, margin: "16px 0 4px" }}>Benchmarks vs Notion</h3>
      <table>
        <thead><tr><th>Metric</th><th>OpenDock</th><th>Notion</th></tr></thead>
        <tbody>
          {benchmarks.map(([m, o, n]) => (
            <tr key={m}>
              <td>{m}</td>
              <td><b>{o}</b></td>
              <td className="muted">{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 8 }}>
        <Link href="/opendock">Read more</Link> &middot; <Link href="/pricing">Subscribe</Link>
      </p>

      <h2 style={{ marginTop: 32 }}>In design</h2>
      <p className="muted">Nothing yet. When something graduates from <Link href="/labs">Labs</Link>, it appears here first — scoped and prototyped, not yet shipping.</p>

      <h2 style={{ marginTop: 24 }}>Archived</h2>
      <p className="muted">None. Every product we&apos;ve started is still active.</p>

      <h2 style={{ marginTop: 32 }}>What every entry commits to</h2>
      <ul>
        <li><b>Local-first</b> &ndash; data on your machine, cloud optional</li>
        <li><b>Native</b> &ndash; Tauri + Rust, never Electron</li>
        <li><b>Lean</b> &ndash; ≤ 25 MB binary, ≤ 50 MB RAM idle, ≤ 0.5 s cold start</li>
        <li><b>Offline</b> &ndash; every feature, every time</li>
        <li><b>Durable</b> &ndash; plain SQLite on disk, plain-text export, open formats</li>
        <li><b>No telemetry</b> &ndash; nothing leaves without your say</li>
      </ul>

      <p className="muted" style={{ marginTop: 16 }}>
        Looking for experiments and prototypes? See <Link href="/labs">Labs</Link>.
      </p>
    </>
  );
}
