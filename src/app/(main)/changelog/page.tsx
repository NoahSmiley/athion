const releases = [
  { v: "0.4.0-beta.9", date: "March 5, 2026", changes: ["COOP/COEP headers for enhanced security isolation", "Krisp audio level diagnostic", "Improved noise suppression reliability", "Various stability fixes"] },
  { v: "0.4.0-beta.8", date: "February 28, 2026", changes: ["Simplified noise suppression to Krisp-only toggle", "Reduced memory usage during voice calls by 15%", "Fixed audio crackling on macOS when switching output devices"] },
  { v: "0.4.0-beta.7", date: "February 15, 2026", changes: ["Lossless screen share preset (VP9, 20 Mbps, 60 fps)", "Bitrate selector for voice channels (96\u2013320 kbps)", "Profile cards with member info and role display", "Context menus for channels and voice rooms"] },
  { v: "0.4.0-beta.6", date: "February 1, 2026", changes: ["E2E encryption for all direct messages", "File attachment previews with drag-and-drop upload", "Reaction tooltips with user attribution", "Server emoji management"] },
  { v: "0.3.0-beta.5", date: "January 18, 2026", changes: ["Direct messages with search and user lookup", "Voice room user limit controls", "Soundboard with custom audio upload", "Gallery view for image messages"] },
];

export default function ChangelogPage() {
  return (
    <>
      <h1>Changelog</h1>
      <p className="muted">Release notes and updates for all Athion products.</p>
      {releases.map((r) => (
        <div key={r.v} style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 4px" }}>v{r.v} <span className="muted" style={{ fontWeight: "normal" }}>(Flux &mdash; {r.date})</span></h2>
          <ul>{r.changes.map((c, j) => <li key={j}>{c}</li>)}</ul>
        </div>
      ))}
    </>
  );
}
