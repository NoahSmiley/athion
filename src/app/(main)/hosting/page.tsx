"use client";

import Link from "next/link";
import {
  Server,
  Gamepad2,
  Globe,
  Power,
  HardDrive,
  Terminal,
  Network,
  Activity,
  ArrowRight,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import { ScrollText } from "@/components/parallax";
import { HOSTING_TIERS, HOSTING_FEATURES } from "@/lib/constants";

const tierIcons = { Gamepad2, Globe, Server } as const;
const featureIcons = { Power, Globe, HardDrive, Terminal, Network, Activity } as const;

function HostingHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center">
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-12">
        <ScrollReveal>
          <Server size={48} className="text-accent mb-8" />
        </ScrollReveal>
        <ScrollText
          text="Infrastructure, without the overhead."
          tag="h1"
          className="font-[590] text-5xl sm:text-6xl tracking-[-0.022em] leading-tight max-w-3xl"
        />
        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-lg text-foreground-muted max-w-xl leading-relaxed">
            Game servers, web hosting, and VPS — all running on dedicated hardware.
            No shared tenancy, no noisy neighbors, no surprises.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-accent/20 text-accent text-sm rounded-[6px]">
            Coming Soon
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function HostingTiers() {
  return (
    <section id="tiers" className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">What we host</p>
        </ScrollReveal>
        <ScrollText
          text="Pick your tier."
          tag="h2"
          className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
        />
        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-foreground-muted max-w-lg leading-relaxed">
            Three hosting tiers, one platform. Everything runs on our dedicated server hardware.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid md:grid-cols-3 gap-8">
          {HOSTING_TIERS.map((tier) => {
            const Icon = tierIcons[tier.icon as keyof typeof tierIcons];
            return (
              <StaggerItem key={tier.title}>
                <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                  <Icon size={28} className="text-accent" />
                  <h3 className="mt-4 font-[590] text-xl tracking-[-0.012em]">{tier.title}</h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {tier.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function HostingFeatures() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">Infrastructure</p>
        </ScrollReveal>
        <ScrollText
          text="Built-in, not bolted on."
          tag="h2"
          className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
        />
        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-foreground-muted max-w-lg leading-relaxed">
            Every hosting tier includes the infrastructure features you actually need.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {HOSTING_FEATURES.map((feature) => {
            const Icon = featureIcons[feature.icon as keyof typeof featureIcons];
            return (
              <StaggerItem key={feature.title}>
                <div className="border-t border-border pt-6">
                  <Icon size={20} className="text-accent mb-3" />
                  <h3 className="font-[590] text-lg tracking-[-0.012em]">{feature.title}</h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function HostingCTA() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="font-[590] text-3xl sm:text-4xl tracking-[-0.022em]">
            Ready to get started?
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mt-4 text-foreground-muted leading-relaxed">
            Have questions about setup, custom configurations, or enterprise needs?
            We&apos;re here to help.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
            >
              View Pricing
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground-muted text-sm rounded-[6px] hover:text-foreground hover:border-border-light hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-150"
            >
              Contact Us
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function HostingPage() {
  return (
    <PageTransition>
      <HostingHero />
      <HostingTiers />
      <HostingFeatures />
      <HostingCTA />
    </PageTransition>
  );
}
