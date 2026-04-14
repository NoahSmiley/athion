import Link from "next/link";

const features = [
  "AI-Native Editing — deep language model integration that understands your entire codebase",
  "Terminal First — built-in terminal with multiplexing, never leave the editor",
  "Minimal Interface — no visual noise, the code is the interface",
  "Blazing Performance — native Rust core, opens instantly, stays fast at any scale",
];

const benchmarks = [
  ["Cold start", "80 ms", "920 ms"],
  ["Memory (idle)", "45 MB", "550 MB"],
  ["Memory (large project)", "120 MB", "1400 MB"],
  ["CPU (idle)", "0.3%", "4.2%"],
  ["Binary size", "8 MB", "350 MB"],
  ["File open (10K lines)", "12 ms", "85 ms"],
];

export default function IDEPage() {
  return (
    <>
      <h1>Liminal IDE</h1>
      <p className="muted">A code editor that stays out of your way. AI-native intelligence meets terminal-first workflow &mdash; built entirely in Rust, opens in 80ms.</p>
      <h2>Features</h2>
      <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
      <h2>Benchmarks vs VS Code</h2>
      <table>
        <thead><tr><th>Metric</th><th>Liminal</th><th>VS Code</th></tr></thead>
        <tbody>{benchmarks.map(([m, o, v]) => <tr key={m}><td>{m}</td><td><b>{o}</b></td><td className="muted">{v}</td></tr>)}</tbody>
      </table>
      <p style={{ marginTop: 16 }}><Link href="/pricing">Subscribe</Link> to get access.</p>
    </>
  );
}
