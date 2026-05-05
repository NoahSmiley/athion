import Link from "next/link";

export default function ServersPage() {
  return (
    <div className="home-page">
      <h2>Servers</h2>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><Link href="/infra">Homelab</Link></td>
            <td>Game servers, media, file sync. Behind the scenes.</td>
            <td><a href="https://status.athion.me" className="muted">status →</a></td>
          </tr>
          <tr>
            <td className="muted">Game servers</td>
            <td>Project Zomboid live. Minecraft, Valheim coming.</td>
            <td className="muted">expanding</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
