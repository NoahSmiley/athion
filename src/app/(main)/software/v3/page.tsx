import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — v3",
  description: "Software products from Athion.",
};

const benchmarks: [string, string, string][] = [
  ["Memory at idle", "30 MB", "450 MB"],
  ["Memory active", "65 MB", "680 MB"],
  ["Binary size", "18 MB", "380 MB"],
  ["Cold start", "0.4 s", "3.2 s"],
  ["CPU at idle", "0.3 %", "4.5 %"],
  ["Offline support", "100 %", "20 %"],
];

export default function SoftwareV3Page() {
  return (
    <>
      <h1>Software</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        What we ship, and what it costs to run it on your machine.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <Link href="/opendock" style={{ fontSize: 16, fontWeight: 500, color: "#fff", textDecoration: "none" }}>OpenDock</Link>
        <span className="muted" style={{ fontSize: 11 }}>Active · Tauri + Rust</span>
      </div>
      <p style={{ marginTop: 6, fontSize: 13 }}>
        Kanban, notes, calendar, AI — one native app, zero cloud.
      </p>

      <h2 style={{ marginTop: 28, fontSize: 13 }}>OpenDock vs Notion</h2>
      <table className="mobile-cards" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th>Metric</th>
            <th>OpenDock</th>
            <th>Notion</th>
          </tr>
        </thead>
        <tbody>
          {benchmarks.map(([metric, ours, theirs]) => (
            <tr key={metric}>
              <td data-label="Metric" className="muted">{metric}</td>
              <td data-label="OpenDock"><b style={{ fontFamily: "var(--font-mono)" }}>{ours}</b></td>
              <td data-label="Notion" className="muted" style={{ fontFamily: "var(--font-mono)" }}>{theirs}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted" style={{ marginTop: 16, fontSize: 12 }}>
        Measured on M2 MacBook Air, idle workspace, 100 boards / 200 notes loaded.
      </p>

      <p style={{ marginTop: 24, fontSize: 13 }}>
        <Link href="/opendock">Read more about OpenDock →</Link>
      </p>

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>
        See <Link href="/labs">Labs</Link> for experiments and prototypes.
      </p>
    </>
  );
}
