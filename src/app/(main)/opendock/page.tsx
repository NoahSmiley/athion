import Link from "next/link";

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

export default function OpenDockPage() {
  return (
    <>
      <h1>OpenDock</h1>
      <p className="muted">Kanban boards, rich notes, calendar, and AI in a single native desktop app. Local-first SQLite, no cloud dependency, no Electron bloat.</p>
      <h2>Features</h2>
      <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
      <h2>Benchmarks vs Notion</h2>
      <table>
        <thead><tr><th>Metric</th><th>OpenDock</th><th>Notion</th></tr></thead>
        <tbody>{benchmarks.map(([m, o, n]) => <tr key={m}><td>{m}</td><td><b>{o}</b></td><td className="muted">{n}</td></tr>)}</tbody>
      </table>
      <p style={{ marginTop: 16 }}><Link href="/pricing">Subscribe</Link> to get access.</p>
    </>
  );
}
