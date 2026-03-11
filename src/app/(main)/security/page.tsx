"use client";

import { Shield, Lock, Eye, EyeOff, Server, Key } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";

const principles = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Every voice call and message in Flux is encrypted end-to-end. We use ECDH P-256 for key exchange and AES-256-GCM for symmetric encryption. Not even we can access your content.",
  },
  {
    icon: EyeOff,
    title: "Zero Knowledge",
    description:
      "We don't read your messages. We don't listen to your calls. Encryption keys are generated on your device and never leave it.",
  },
  {
    icon: Key,
    title: "Forward Secrecy",
    description:
      "Each session generates fresh ephemeral keys. Compromising one session cannot decrypt past or future communications.",
  },
  {
    icon: Server,
    title: "Minimal Data Collection",
    description:
      "We store only what's necessary to operate the service — account credentials, server membership, and message metadata. Message content is encrypted at rest.",
  },
  {
    icon: Shield,
    title: "Open Protocols",
    description:
      "Our encryption implementation follows well-established cryptographic standards. No proprietary algorithms, no security through obscurity.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "We believe trust is earned through transparency. Our security model is documented, our protocols are standard, and we welcome scrutiny.",
  },
];

const specs = [
  { label: "Key Exchange", value: "ECDH P-256" },
  { label: "Symmetric Cipher", value: "AES-256-GCM" },
  { label: "Key Derivation", value: "HKDF-SHA256" },
  { label: "Message Auth", value: "HMAC-SHA256" },
  { label: "Media Transport", value: "DTLS-SRTP (WebRTC)" },
  { label: "TLS Version", value: "1.3" },
];

export default function SecurityPage() {
  return (
    <PageTransition>
      <section className="relative min-h-[70vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
          <ScrollReveal>
            <Shield size={40} className="text-accent" />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mt-8 font-serif text-5xl sm:text-6xl md:text-7xl tracking-[-0.02em] leading-tight max-w-3xl">
              Security isn&apos;t a feature.
              <br />
              <span className="text-accent">It&apos;s a promise.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-8 text-lg text-foreground-muted max-w-xl leading-relaxed">
              Privacy is a right, not a premium tier. Every Athion product is
              built with encryption by default, minimal data collection, and
              zero access to your content.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="overline mb-4">Principles</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em]">
              How we protect you.
            </h2>
          </ScrollReveal>

          <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <div className="p-6 border border-border rounded-sm h-full">
                    <Icon size={20} className="text-accent" />
                    <h3 className="mt-4 font-serif text-lg">{item.title}</h3>
                    <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <ScrollReveal>
                <p className="overline mb-4">Cryptography</p>
                <h2 className="font-serif text-4xl tracking-[-0.02em]">
                  The specifics.
                </h2>
                <p className="mt-4 text-foreground-muted leading-relaxed">
                  We use industry-standard cryptographic primitives. No custom
                  algorithms, no shortcuts. Every component of our encryption
                  stack has been vetted by the broader security community.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="border-t border-border pt-3">
                    <p className="text-xs text-foreground-muted uppercase tracking-wider">
                      {spec.label}
                    </p>
                    <p className="mt-1 text-sm font-mono">{spec.value}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-xl text-center">
          <ScrollReveal>
            <h2 className="font-serif text-4xl tracking-[-0.02em]">
              Found a vulnerability?
            </h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              We take security reports seriously. If you&apos;ve found a
              vulnerability in any Athion product, please reach out
              responsibly.
            </p>
            <a
              href="mailto:security@athion.com"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              security@athion.com
            </a>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}
