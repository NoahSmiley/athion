import Link from "next/link";

const products = [
  { name: "Flux", href: "/flux", desc: "Voice and text chat with E2E encryption, 48kHz Opus audio, lossless screen share." },
  { name: "OpenDock", href: "/opendock", desc: "Kanban boards, notes, calendar, and AI in a native desktop app. 30MB RAM. Local-first." },
  { name: "Liminal IDE", href: "/ide", desc: "AI-native code editor built in Rust. 80ms cold start. Terminal-first." },
  { name: "Hosting", href: "/hosting", desc: "Game servers, web hosting, and VPS on dedicated hardware. Coming soon." },
  { name: "Consulting", href: "/consulting", desc: "Custom software development and technical advisory. 5+ years Fortune 500 experience." },
];

export default function HomePage() {
  return (
    <>
      <h1>Athion</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Software that disappears. Tools and infrastructure for teams that care about performance, privacy, and craft.
      </p>
      <table>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.name}>
              <td className="muted" style={{ width: 20, whiteSpace: "nowrap", verticalAlign: "top" }}>{i + 1}.</td>
              <td><Link href={p.href}><b>{p.name}</b></Link> &ndash; <span className="muted">{p.desc}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 20 }}>
        <Link href="/pricing">Pricing</Link> &middot; <Link href="/about">About</Link> &middot; <Link href="/contact">Contact</Link> &middot; <Link href="/changelog">Changelog</Link>
      </p>
    </>
  );
}
