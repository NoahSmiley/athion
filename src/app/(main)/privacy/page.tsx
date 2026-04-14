const sections = [
  { title: "Information We Collect", items: ["Account information: email address, username, and display name.", "Usage data: basic analytics, crash reports, performance metrics. Aggregated and anonymized.", "Communications metadata: timestamps, channel membership. Message content is E2E encrypted.", "Payment information: processed through third-party providers. We do not store credit card numbers."] },
  { title: "How We Use Your Information", items: ["To provide and maintain our services.", "To communicate about updates, security notices, and support.", "To improve products through anonymized usage analytics.", "To detect and prevent fraud or abuse."] },
  { title: "Data Storage & Security", items: ["All data encrypted in transit using TLS 1.3.", "Message content encrypted E2E using AES-256-GCM.", "Voice and video calls encrypted via DTLS-SRTP.", "Account data stored on secured servers with regular audits."] },
  { title: "Data Sharing", items: ["We do not sell your personal information.", "We do not share data with third parties for advertising.", "We may share anonymized, aggregated data for analytics.", "We will comply with valid legal requests, notifying you when permitted."] },
  { title: "Your Rights", items: ["Access: request a copy of your data.", "Deletion: delete your account and all data.", "Portability: export data in a standard format.", "Correction: update info through account settings."] },
];

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: March 1, 2026. We collect as little as possible and encrypt everything we can.</p>
      {sections.map((s) => (
        <div key={s.title}>
          <h2>{s.title}</h2>
          <ul>{s.items.map((item, i) => <li key={i} className="muted">{item}</li>)}</ul>
        </div>
      ))}
      <p>Contact: <a href="mailto:privacy@athion.com">privacy@athion.com</a></p>
    </>
  );
}
