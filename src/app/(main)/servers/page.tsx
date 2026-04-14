import Link from "next/link";

const games = [
  ["Minecraft Java", "Online", "Full modpack support, heavily modded, always online, automatic updates."],
  ["Factorio", "Online", "Multiplayer factory building with a persistent world."],
  ["Satisfactory", "Online", "Co-op dedicated server with save persistence."],
  ["CS2 Surf", "Coming soon", "Community surf server with custom maps, competitive timers and leaderboards."],
];

export default function ServersPage() {
  return (
    <>
      <h1>Game Servers</h1>
      <p className="muted">Dedicated hardware, no rental services, no cold starts. Every game server is included with your Athion Pro subscription.</p>
      <p className="muted" style={{ fontStyle: "italic" }}>Coming soon.</p>
      <h2>Games</h2>
      <table>
        <thead><tr><th>Game</th><th>Status</th><th>Description</th></tr></thead>
        <tbody>{games.map(([g, s, d]) => <tr key={g}><td><b>{g}</b></td><td style={{ color: s === "Online" ? "#c8c8c8" : "#828282" }}>{s}</td><td className="muted">{d}</td></tr>)}</tbody>
      </table>
      <h2>Features</h2>
      <ul>
        <li>Always Online &mdash; 24/7 uptime on dedicated hardware</li>
        <li>Modpack Support &mdash; upload custom modpacks, automatic server-side installation</li>
        <li>Daily Backups &mdash; automated snapshots, one-click rollback</li>
        <li>Low Latency &mdash; self-hosted on dedicated network hardware</li>
        <li>Full Control &mdash; console access, config editing, whitelist management</li>
        <li>Included with Athion Pro &mdash; no extra cost</li>
      </ul>
      <p style={{ marginTop: 16 }}><Link href="/pricing">Subscribe</Link> &middot; <Link href="/contact">Contact us</Link></p>
    </>
  );
}
