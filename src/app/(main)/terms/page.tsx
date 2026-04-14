const sections = [
  ["Acceptance of Terms", "By accessing or using any Athion product, you agree to these Terms. If you do not agree, do not use our services."],
  ["Accounts", "You are responsible for your account security. Provide accurate information. One person, one account."],
  ["Acceptable Use", "Do not use our services to distribute malware, harass others, violate laws, or interfere with our systems."],
  ["Your Content", "You retain ownership of all content you create. We do not claim rights to your content. E2E encryption means we cannot access most of it."],
  ["Service Availability", "We strive for high availability but do not guarantee uninterrupted service. Features may change during beta."],
  ["Subscriptions & Payments", "Paid features require a subscription. Prices may change with 30 days notice. Cancel anytime."],
  ["Termination", "We may suspend accounts that violate these terms. You may delete your account; data removed within 30 days."],
  ["Limitation of Liability", "Services provided \"as is\" without warranty. Athion is not liable for indirect or consequential damages."],
  ["Changes to Terms", "We may update these terms. Significant changes communicated 14 days before taking effect."],
];

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="muted">Last updated: March 1, 2026.</p>
      {sections.map(([title, content], i) => (
        <div key={title} style={{ marginBottom: 12 }}>
          <h2 style={{ margin: "0 0 4px" }}>{i + 1}. {title}</h2>
          <p className="muted" style={{ margin: 0 }}>{content}</p>
        </div>
      ))}
      <p>Contact: <a href="mailto:legal@athion.com">legal@athion.com</a></p>
    </>
  );
}
