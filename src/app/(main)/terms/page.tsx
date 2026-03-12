"use client";

import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using any Athion product or service, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.",
  },
  {
    title: "Accounts",
    content:
      "You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account. One person, one account — automated account creation is prohibited.",
  },
  {
    title: "Acceptable Use",
    content:
      "You agree not to use our services to: distribute malware or harmful content; harass, threaten, or abuse others; violate any applicable laws; attempt to gain unauthorized access to our systems; interfere with the operation of our services.",
  },
  {
    title: "Your Content",
    content:
      "You retain ownership of all content you create or share through our services. We do not claim any rights to your content. Due to end-to-end encryption, we cannot access most user content even if we wanted to.",
  },
  {
    title: "Service Availability",
    content:
      "We strive to maintain high availability but do not guarantee uninterrupted service. We may modify, suspend, or discontinue features with reasonable notice. During beta periods, services may change substantially.",
  },
  {
    title: "Subscriptions & Payments",
    content:
      "Paid features require an active subscription. Prices may change with 30 days notice. You can cancel at any time — access continues until the end of your billing period. Refunds are handled on a case-by-case basis.",
  },
  {
    title: "Termination",
    content:
      "We may suspend or terminate accounts that violate these terms. You may delete your account at any time, which will remove your personal data from our systems within 30 days.",
  },
  {
    title: "Limitation of Liability",
    content:
      "Our services are provided \"as is\" without warranty. To the maximum extent permitted by law, Athion shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.",
  },
  {
    title: "Changes to Terms",
    content:
      "We may update these terms from time to time. Significant changes will be communicated via email or in-app notification at least 14 days before taking effect.",
  },
  {
    title: "Contact",
    content:
      "Questions about these terms? Contact us at legal@athion.com.",
  },
];

export default function TermsPage() {
  return (
    <PageTransition>
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <p className="overline mb-4">Legal</p>
            <h1 className="font-[590] text-5xl tracking-[-0.022em]">
              Terms of Service
            </h1>
            <p className="mt-4 text-sm text-foreground-muted">
              Last updated: March 1, 2026
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mt-8 text-foreground-muted leading-relaxed">
              These terms govern your use of Athion products and services.
              We&apos;ve written them to be readable — not to bury important
              details in legal jargon.
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
                <p className="mt-4 text-foreground-muted leading-relaxed">
                  {section.content}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
