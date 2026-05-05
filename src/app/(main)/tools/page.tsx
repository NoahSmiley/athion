import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="home-page">
      <h2>Tools</h2>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><Link href="/opendock">Opendock</Link></td>
            <td>Lightweight project tracking. Notes to sprints.</td>
            <td><Link href="/opendock/download" className="muted">download</Link></td>
          </tr>
          <tr>
            <td className="muted">athctl</td>
            <td>Command-line tool for managing your Athion services.</td>
            <td className="muted">coming soon</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
