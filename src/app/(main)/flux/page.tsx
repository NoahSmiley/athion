import Link from "next/link";

const features = [
  "Crystal Voice — 48kHz stereo, Opus codec, constant bitrate encoding",
  "End-to-End Encryption — ECDH P-256 key exchange, AES-256-GCM symmetric encryption",
  "Lossless Screen Share — up to 4K VP9 at 20 Mbps, six quality presets",
  "Noise Suppression — Krisp-powered AI noise cancellation",
  "Rich Messaging — emoji, file attachments, reactions, threaded replies",
  "Zero Latency — LiveKit SFU, WebRTC, sub-100ms latency",
];

const presets = [
  ["1080p60", "H.264", "6 Mbps", "60"],
  ["1080p30", "H.264", "4 Mbps", "30"],
  ["720p60", "H.264", "4 Mbps", "60"],
  ["720p30", "H.264", "2.5 Mbps", "30"],
  ["480p30", "H.264", "1.5 Mbps", "30"],
  ["Lossless", "VP9", "20 Mbps", "60"],
];

const benchmarks = [
  ["Memory (idle)", "48 MB", "320 MB"],
  ["Memory (voice)", "85 MB", "520 MB"],
  ["Binary size", "12 MB", "300 MB"],
  ["Latency (P95)", "45 ms", "120 ms"],
  ["CPU (idle)", "2.1%", "8.5%"],
];

export default function FluxPage() {
  return (
    <>
      <h1>Flux</h1>
      <p className="muted">Voice and text chat built for teams that care about privacy. Crystal-clear 48kHz Opus audio, end-to-end encryption on everything, and lossless screen share at 60fps. Built with Tauri and Rust.</p>
      <h2>Features</h2>
      <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
      <h2>Screen Share Presets</h2>
      <table>
        <thead><tr><th>Preset</th><th>Codec</th><th>Bitrate</th><th>FPS</th></tr></thead>
        <tbody>{presets.map(([p, c, b, f]) => <tr key={p}><td>{p}</td><td className="muted">{c}</td><td className="muted">{b}</td><td className="muted">{f}</td></tr>)}</tbody>
      </table>
      <h2>Benchmarks vs Discord</h2>
      <table>
        <thead><tr><th>Metric</th><th>Flux</th><th>Discord</th></tr></thead>
        <tbody>{benchmarks.map(([m, f, d]) => <tr key={m}><td>{m}</td><td><b>{f}</b></td><td className="muted">{d}</td></tr>)}</tbody>
      </table>
      <p style={{ marginTop: 16 }}><Link href="/pricing">Subscribe</Link> to get access.</p>
    </>
  );
}
