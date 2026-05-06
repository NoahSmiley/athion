import Link from "next/link";

export default function ServersPage() {
  return (
    <div className="home-page">
      <h2>Servers</h2>
      <p className="muted">Public-facing infrastructure run by Athion.</p>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><Link href="/infra">Project Zomboid</Link></td>
            <td>Open multiplayer game server. 22-map stack, 98 mods.</td>
            <td><a href="https://status.athion.me" className="muted">status →</a></td>
          </tr>
          <tr>
            <td><Link href="/infra">athion.me</Link></td>
            <td>This site. Hosted on the Athion homelab, fronted by Cloudflare.</td>
            <td className="muted">live</td>
          </tr>
          <tr>
            <td><a href="https://status.athion.me">Status</a></td>
            <td>Live uptime for everything Athion runs.</td>
            <td><a href="https://status.athion.me" className="muted">open →</a></td>
          </tr>
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 16 }}>
        Behind these is the <Link href="/infra">Athion homelab</Link> &mdash; a single Proxmox box at home.
      </p>
    </div>
  );
}
