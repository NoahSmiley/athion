import Link from "next/link";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";
import { DownloadPrimary } from "./download/download-primary";

export const dynamic = "force-dynamic";

const features = [
  "Kanban Boards — sprints, epics, labels, drag-and-drop ticket organization",
  "Rich Notes — markdown editor with collections, folders, and tags",
  "Claude AI — built-in assistant that understands your boards, notes, and calendar",
  "Calendar — event scheduling linked to tickets, deadlines, sprints, and meetings",
  "Native Desktop — Tauri-powered, 30MB RAM, no Electron",
  "Local-First — SQLite on your machine, works fully offline",
];

const benchmarks = [
  ["Memory (idle)", "30 MB", "450 MB"],
  ["Memory (active)", "65 MB", "680 MB"],
  ["Binary size", "18 MB", "380 MB"],
  ["Startup time", "0.4s", "3.2s"],
  ["CPU (idle)", "0.3%", "4.5%"],
  ["Offline support", "100%", "20%"],
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
    <>
      <h1>Opendock</h1>
      <p className="muted">Kanban boards, rich notes, calendar, and AI in a single native desktop app. Local-first SQLite, no cloud dependency, no Electron bloat.</p>

      {downloadOptions.length > 0 ? (
        <>
          <DownloadPrimary options={downloadOptions} />
          <p className="muted" style={{ fontSize: 11, marginTop: -8 }}>
            Version {latest!.version} · released {latest!.pubDate.toLocaleDateString()}
            {" · "}
            <Link href="/opendock/download">All platforms</Link>
            {" · "}
            <Link href="/opendock/releases">Release notes</Link>
          </p>
        </>
      ) : (
        <p style={{ marginTop: 16 }} className="muted">No releases yet. Check back soon.</p>
      )}

      <h2>Features</h2>
      <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
      <h2>Benchmarks vs Notion</h2>
      <table>
        <thead><tr><th>Metric</th><th>Opendock</th><th>Notion</th></tr></thead>
        <tbody>{benchmarks.map(([m, o, n]) => <tr key={m}><td>{m}</td><td><b>{o}</b></td><td className="muted">{n}</td></tr>)}</tbody>
      </table>
    </>
  );
}
