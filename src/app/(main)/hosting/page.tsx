import Link from "next/link";

export default function HostingPage() {
  return (
    <>
      <h1>Hosting</h1>
      <p className="muted">Game servers, web hosting, and VPS &mdash; all running on dedicated hardware. No shared tenancy, no noisy neighbors, no surprises.</p>
      <p className="muted" style={{ fontStyle: "italic" }}>Coming soon.</p>
      <h2>Tiers</h2>
      <ul>
        <li><b>Game Servers</b> &ndash; Always-online private game servers with modpack support and one-click setup.</li>
        <li><b>Web & App Hosting</b> &ndash; Deploy web apps, APIs, and static sites with zero-downtime deploys and custom domains.</li>
        <li><b>VPS</b> &ndash; Full root access to a virtual private server. Run anything, configure everything.</li>
      </ul>
      <h2>Features</h2>
      <ul>
        <li>Always On &mdash; 24/7 uptime on dedicated hardware, no cold starts, no sleep timers</li>
        <li>Custom Domains &mdash; automatic SSL provisioning via Let&apos;s Encrypt</li>
        <li>Daily Backups &mdash; automated snapshots with one-click restore</li>
        <li>SSH Access &mdash; full terminal access for advanced configuration</li>
        <li>Private Network &mdash; isolated VLAN for internal service communication</li>
        <li>Monitoring &mdash; real-time metrics, uptime alerts, resource dashboards</li>
      </ul>
      <p style={{ marginTop: 16 }}><Link href="/pricing">Pricing</Link> &middot; <Link href="/contact">Contact us</Link></p>
    </>
  );
}
