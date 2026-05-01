const principles = [
  ["Local-first by default", "Opendock stores your data in a SQLite database on your machine. No cloud sync, no servers reading your notes."],
  ["Minimal data collection", "We only store what's needed to run the membership: account credentials, application history, billing metadata."],
  ["TLS everywhere", "Every connection between your device and our infrastructure is TLS 1.3. No plaintext anywhere on the wire."],
  ["Self-hosted infrastructure", "Athion runs on hardware we own. No third-party clouds, no shared tenancy, no vendor data exfiltration risk."],
  ["Open protocols", "Standard cryptographic primitives. No proprietary algorithms or hand-rolled crypto."],
  ["Transparency", "If our security model changes, we'll say so here."],
];

const specs = [
  ["Password hashing", "bcrypt (cost 12)"],
  ["Session tokens", "JWT (HS256, jose)"],
  ["TLS Version", "1.3"],
  ["At-rest encryption", "Postgres on encrypted volumes"],
];

export default function SecurityPage() {
  return (
    <>
      <h1>Security</h1>
      <p className="muted">Privacy is a right, not a premium tier. Athion is built to keep your data on your machine and to collect as little as possible everywhere else.</p>
      <h2>Principles</h2>
      <ul>{principles.map(([t, d]) => <li key={t}><b>{t}</b> &ndash; {d}</li>)}</ul>
      <h2>Cryptography</h2>
      <table>
        <tbody>{specs.map(([l, v]) => <tr key={l}><td className="muted">{l}</td><td style={{ fontFamily: "var(--font-mono)" }}>{v}</td></tr>)}</tbody>
      </table>
      <h2>Report a Vulnerability</h2>
      <p>Email <a href="mailto:security@athion.me">security@athion.me</a>.</p>
    </>
  );
}
