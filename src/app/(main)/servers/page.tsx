import Link from "next/link";

export default function ServersPage() {
  return (
    <div className="home-page">
      <h2>Servers</h2>
      <p className="muted">Self-hosted services running on the homelab.</p>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><a href="https://jellyfin.athion.me">Jellyfin</a></td>
            <td>Movies and TV on a private streaming server.</td>
            <td><a href="https://jellyfin.athion.me" className="muted">open →</a></td>
          </tr>
          <tr>
            <td><a href="https://vault.athion.me">Vaultwarden</a></td>
            <td>Self-hosted password manager.</td>
            <td><a href="https://vault.athion.me" className="muted">open →</a></td>
          </tr>
          <tr>
            <td><a href="https://audiobooks.athion.me">Audiobookshelf</a></td>
            <td>Audiobook and podcast server.</td>
            <td><a href="https://audiobooks.athion.me" className="muted">open →</a></td>
          </tr>
          <tr>
            <td><Link href="/infra">Project Zomboid</Link></td>
            <td>Multiplayer game server. 22-map stack, 98 mods.</td>
            <td><a href="https://status.athion.me" className="muted">status →</a></td>
          </tr>
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 16 }}>
        Hosted on the <Link href="/infra">Athion homelab</Link>.
      </p>
    </div>
  );
}
