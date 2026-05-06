import Link from "next/link";

export default function ServersPage() {
  return (
    <div className="home-page">
      <h2>Servers</h2>
      <p className="muted">Open multiplayer game servers running on the Athion homelab.</p>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><Link href="/servers/zomboid">Zomboid</Link></td>
            <td>Project Zomboid. 22-map stack, 98 mods.</td>
            <td><Link href="/servers/zomboid" className="muted">details →</Link></td>
          </tr>
          <tr>
            <td><Link href="/servers/minecraft">Minecraft</Link></td>
            <td>NeoForge server.</td>
            <td><Link href="/servers/minecraft" className="muted">details →</Link></td>
          </tr>
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 16 }}>
        Hosted on the <Link href="/infra">Athion homelab</Link>.
      </p>
    </div>
  );
}
