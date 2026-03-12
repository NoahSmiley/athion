"use client";

import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";

const sections = [
  {
    title: "Information We Collect",
    content: [
      "Account information: email address, username, and display name when you create an account.",
      "Usage data: basic analytics such as feature usage, crash reports, and performance metrics. This data is aggregated and anonymized.",
      "Communications metadata: timestamps, channel membership, and server membership. Message content is encrypted end-to-end and inaccessible to us.",
      "Payment information: processed securely through third-party payment providers. We do not store credit card numbers.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "To provide and maintain our services.",
      "To communicate with you about updates, security notices, and support.",
      "To improve our products through anonymized usage analytics.",
      "To detect and prevent fraud or abuse.",
    ],
  },
  {
    title: "Data Storage & Security",
    content: [
      "All data is encrypted in transit using TLS 1.3.",
      "Message content is encrypted end-to-end using AES-256-GCM. We cannot read your messages.",
      "Voice and video calls are encrypted via DTLS-SRTP. We cannot listen to your calls.",
      "Account data is stored on secured servers with regular security audits.",
    ],
  },
  {
    title: "Data Sharing",
    content: [
      "We do not sell your personal information. Ever.",
      "We do not share your data with third parties for advertising purposes.",
      "We may share anonymized, aggregated data for analytical purposes.",
      "We will comply with valid legal requests, but will notify you when legally permitted.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "Access: You can request a copy of your personal data at any time.",
      "Deletion: You can delete your account and all associated data.",
      "Portability: You can export your data in a standard format.",
      "Correction: You can update your personal information through your account settings.",
    ],
  },
  {
    title: "Contact",
    content: [
      "For privacy-related questions or requests, contact us at privacy@athion.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageTransition>
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <p className="overline mb-4">Legal</p>
            <h1 className="font-[590] text-5xl tracking-[-0.022em]">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-foreground-muted">
              Last updated: March 1, 2026
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mt-8 text-foreground-muted leading-relaxed">
              Your privacy matters. This policy explains what data we collect,
              how we use it, and how we protect it. The short version: we
              collect as little as possible and encrypt everything we can.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-12">
          {sections.map((section, i) => (
            <ScrollReveal key={section.title} delay={i * 0.05}>
              <div className="border-t border-border pt-8">
                <h2 className="font-[590] text-2xl tracking-[-0.012em]">{section.title}</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {section.content.map((item, j) => (
                    <li
                      key={j}
                      className="text-foreground-muted leading-relaxed pl-4 border-l border-border-light"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
