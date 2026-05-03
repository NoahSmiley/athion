import Link from "next/link";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";
import { DownloadPrimary } from "./download/download-primary";

export const dynamic = "force-dynamic";

const features: [string, string][] = [
  ["Boards", "Kanban with sprints, epics, labels, and drag-and-drop ticket organization."],
  ["Notes", "Markdown editor with collections, folders, and tags. Full-text search."],
  ["Calendar", "Event scheduling linked to tickets, deadlines, sprints, and meetings."],
  ["Claude AI", "Built-in assistant that understands your boards, notes, and calendar."],
  ["Native Desktop", "Tauri-powered. ~30 MB RAM, no Electron, no browser engine."],
  ["Local-First", "SQLite on your machine. Works fully offline. Your data never leaves."],
];

const benchmarks = [
  ["Memory (idle)", "30 MB", "450 MB"],
  ["Memory (active)", "65 MB", "680 MB"],
  ["Binary size", "18 MB", "380 MB"],
  ["Startup time", "0.4s", "3.2s"],
  ["CPU (idle)", "0.3%", "4.5%"],
  ["Offline support", "100%", "20%"],
];

const heroStats: { value: string; unit: string; label: string; compare: string }[] = [
  { value: "30", unit: "MB", label: "RAM idle", compare: "vs 450 MB Notion" },
  { value: "0.4", unit: "s", label: "startup", compare: "vs 3.2s Notion" },
  { value: "100", unit: "%", label: "offline", compare: "vs 20% Notion" },
];

export default async function OpenDockPage() {
  const [latest] = await listChannelReleases("stable", 1);
  const artifacts = latest ? await getArtifactsForRelease(latest.id) : [];

  const downloadOptions = artifacts.map((a) => ({
    target: a.target,
    label: TARGET_LABELS[a.target as TargetId],
    url: a.installerUrl ?? a.url,
    size: a.sizeBytes,
  }));

  return (
    <div className="tall-page">
      {/* Hero */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            border: "1px solid #3a3a3a",
            borderRadius: 5,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 16,
            fontWeight: 600,
            color: "#c8c8c8",
            lineHeight: 1,
          }}
        >
          O
        </span>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: -0.3 }}>Opendock</h1>
        {latest && (
          <span style={{ fontSize: 11, color: "#828282", fontFamily: "var(--font-mono)" }}>
            v{latest.version}
          </span>
        )}
      </div>
      <p className="muted" style={{ fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        Kanban boards, rich notes, calendar, and AI in a single native desktop app.
        Local-first SQLite, no cloud dependency, no Electron bloat.
      </p>

      {/* Hero stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
        {heroStats.map((s) => (
          <div key={s.label} style={{ border: "1px solid #2a2a2a", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "#fff", letterSpacing: -0.3, lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#828282" }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: "#c8c8c8", marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{s.compare}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {downloadOptions.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 36, fontSize: 12 }}>
          <DownloadPrimary options={downloadOptions} />
          {latest && (
            <span className="muted" style={{ fontSize: 11 }}>
              released {latest.pubDate.toLocaleDateString()}
            </span>
          )}
          <Link href="/opendock/download" className="muted" style={{ fontSize: 12 }}>All platforms</Link>
          <Link href="/opendock/releases" className="muted" style={{ fontSize: 12 }}>Release notes</Link>
        </div>
      ) : (
        <p className="muted" style={{ marginBottom: 32 }}>No releases yet. Check back soon.</p>
      )}

      {/* Features grid */}
      <h2 style={{ marginBottom: 12 }}>Features</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "#1f1f1f", border: "1px solid #1f1f1f" }}>
        {features.map(([title, desc]) => (
          <div key={title} style={{ background: "#060606", padding: "16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#c8c8c8", lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Benchmarks */}
      <h2 style={{ marginTop: 32 }}>Benchmarks vs Notion</h2>
      <table>
        <thead><tr><th>Metric</th><th>Opendock</th><th>Notion</th></tr></thead>
        <tbody>
          {benchmarks.map(([m, o, n]) => (
            <tr key={m}><td>{m}</td><td><b>{o}</b></td><td className="muted">{n}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Footer CTA */}
      {downloadOptions.length > 0 && (
        <div style={{ marginTop: 40, padding: "20px 22px", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Ready to try it?</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Free to download. Your data stays on your machine.</div>
          </div>
          <DownloadPrimary options={downloadOptions} />
        </div>
      )}
    </div>
  );
}
