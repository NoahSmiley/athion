const principles = [
  ["End-to-End Encryption", "ECDH P-256 key exchange, AES-256-GCM symmetric encryption. Not even we can access your content."],
  ["Zero Knowledge", "We don't read your messages or listen to your calls. Keys never leave your device."],
  ["Forward Secrecy", "Fresh ephemeral keys per session. Compromising one session can't decrypt others."],
  ["Minimal Data Collection", "Only account credentials, server membership, and message metadata. Content is encrypted at rest."],
  ["Open Protocols", "Standard cryptographic primitives. No proprietary algorithms."],
  ["Transparency", "Documented security model, standard protocols, open to scrutiny."],
];

const specs = [
  ["Key Exchange", "ECDH P-256"], ["Symmetric Cipher", "AES-256-GCM"], ["Key Derivation", "HKDF-SHA256"],
  ["Message Auth", "HMAC-SHA256"], ["Media Transport", "DTLS-SRTP (WebRTC)"], ["TLS Version", "1.3"],
];

export default function SecurityPage() {
  return (
    <>
      <h1>Security</h1>
      <p className="muted">Privacy is a right, not a premium tier. Every Athion product is built with encryption by default and zero access to your content.</p>
      <h2>Principles</h2>
      <ul>{principles.map(([t, d]) => <li key={t}><b>{t}</b> &ndash; {d}</li>)}</ul>
      <h2>Cryptography</h2>
      <table>
        <tbody>{specs.map(([l, v]) => <tr key={l}><td className="muted">{l}</td><td style={{ fontFamily: "var(--font-mono)" }}>{v}</td></tr>)}</tbody>
      </table>
      <h2>Report a Vulnerability</h2>
      <p>Email <a href="mailto:security@athion.com">security@athion.com</a>.</p>
    </>
  );
}
