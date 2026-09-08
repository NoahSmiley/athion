export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy</h1>
      <p className="muted">Last updated: September 8, 2026.</p>

      <h2>Data stored</h2>
      <ul>
        <li>Account email, username, display name, password hash, role, and invite metadata.</li>
        <li>A mapping between an Athion account and its Prime/Jellyfin account.</li>
        <li>Short-lived authentication, password-reset, security, and operational logs.</li>
      </ul>

      <h2>Athion Music app</h2>
      <p>Athion Music is a player for the media library on an Athion server. When you use it, the server stores:</p>
      <ul>
        <li>Your playback position and listening history for music and audiobooks, so you can resume across devices.</li>
        <li>If you connect Spotify: an access token for your Spotify account, used only to show your own playlists, saved albums, top artists, recently played, and followed artists inside the app. Spotify data is read on demand and cached briefly; it is never sold, shared, or used for advertising. Disconnect at any time from the app&apos;s Home screen, which deletes the token.</li>
        <li>If you connect ListenBrainz: your ListenBrainz user token, used to read the playlists and recommendations ListenBrainz generates for you. Disconnect at any time from Settings.</li>
        <li>Library requests you file (the title requested, when, and by whom), so the server operator can act on them.</li>
      </ul>
      <p>Without Spotify or ListenBrainz connected, recommendations are computed from what you play in the app. The app collects no location, contacts, photos, or advertising identifiers, and contains no third-party analytics or advertising SDKs.</p>

      <h2>Use</h2>
      <p>Data is used to authenticate accounts, operate private services, recover accounts, and investigate abuse or outages.</p>

      <h2>Processors</h2>
      <p>Cloudflare carries public traffic, Resend delivers account email, Jellyfin and Audiobookshelf provide media sessions, and Spotify and ListenBrainz are contacted only when you connect them. Athion does not sell account data or use it for advertising.</p>

      <h2>Retention</h2>
      <p>Account records remain while an account is active. Reset tokens expire after one hour. Operational logs and backups are retained only as needed to run and recover the services.</p>

      <h2>Requests</h2>
      <p>For access, correction, or deletion requests, email <a href="mailto:privacy@athion.me">privacy@athion.me</a>. Account deletion removes the account record, its media-session mappings, listening history, and any connected-service tokens within 30 days.</p>
    </>
  );
}
