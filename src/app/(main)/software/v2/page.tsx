import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — v2",
  description: "Software products from Athion.",
};

export default function SoftwareV2Page() {
  return (
    <>
      <h1>Software</h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
        We make software the way it used to be made. Native binaries that start instantly.
        Data on your machine. No telemetry, no engagement metrics, no growth team. We ship
        when it&apos;s right and we maintain what we ship.
      </p>

      <div style={{ marginTop: 16, padding: "10px 14px", borderLeft: "2px solid #2a2a2a", fontSize: 12 }}>
        <p className="muted" style={{ margin: 0 }}>
          The web stack ate desktop software. We&apos;re putting desktop software back where it belongs.
        </p>
      </div>

      <h2 style={{ marginTop: 32 }}>What we&apos;ve built</h2>

      <div style={{ marginTop: 12, padding: "16px 18px", border: "1px solid #2a2a2a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <Link href="/opendock" style={{ fontSize: 16, fontWeight: 500, color: "#fff", textDecoration: "none" }}>OpenDock →</Link>
          <span className="muted" style={{ fontSize: 11 }}>Tauri · Rust · SQLite</span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.55 }}>
          Kanban, notes, calendar, and AI in one native app. 30 MB of RAM at idle. Starts
          in 0.4 seconds. Works on a plane.
        </p>
        <p className="muted" style={{ margin: "10px 0 0", fontSize: 12 }}>
          Replaces Notion, Linear, and a calendar app — without phoning home.
        </p>
      </div>

      <h2 style={{ marginTop: 32 }}>What&apos;s next</h2>
      <p className="muted" style={{ fontSize: 13 }}>
        We&apos;re slow on purpose. New products take the time they take. Watch <Link href="/labs">Labs</Link>{" "}
        for in-progress work, or <Link href="/blog">read along</Link> as we figure things out.
      </p>
    </>
  );
}
