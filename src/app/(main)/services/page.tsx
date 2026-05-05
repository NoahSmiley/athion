import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="home-page">
      <h2>Services</h2>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><Link href="/prime">Athion Prime</Link></td>
            <td>Private streaming. All your channels in one place.</td>
            <td className="muted">invite-only</td>
          </tr>
          <tr>
            <td className="muted">Athion Mail</td>
            <td>Self-hosted email on your own domain.</td>
            <td className="muted">coming soon</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
