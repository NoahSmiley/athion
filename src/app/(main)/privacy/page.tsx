export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy</h1>
      <p className="muted">Last updated: August 16, 2026.</p>

      <h2>Data stored</h2>
      <ul>
        <li>Account email, username, display name, password hash, role, and invite metadata.</li>
        <li>A mapping between an Athion account and its Prime/Jellyfin account.</li>
        <li>Short-lived authentication, password-reset, security, and operational logs.</li>
      </ul>

      <h2>Use</h2>
      <p>Data is used to authenticate accounts, operate private services, recover accounts, and investigate abuse or outages.</p>

      <h2>Processors</h2>
      <p>Cloudflare carries public traffic, Resend delivers account email, and Jellyfin provides Prime&apos;s media sessions. Athion does not sell account data or use it for advertising.</p>

      <h2>Retention</h2>
      <p>Account records remain while an account is active. Reset tokens expire after one hour. Operational logs and backups are retained only as needed to run and recover the services.</p>

      <h2>Requests</h2>
      <p>For access, correction, or deletion requests, email <a href="mailto:privacy@athion.me">privacy@athion.me</a>.</p>
    </>
  );
}
