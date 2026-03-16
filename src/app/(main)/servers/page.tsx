"use client";

import Link from "next/link";
import {
  Gamepad2,
  Sword,
  Factory,
  HardDrive,
  Crosshair,
  Power,
  Settings,
  Wifi,
  Terminal,
  Shield,
  ArrowRight,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";
import { ScrollText } from "@/components/parallax";
import { GAME_SERVERS, SERVER_FEATURES } from "@/lib/constants";

const gameIcons = { Sword, Factory, HardDrive, Crosshair } as const;
const featureIcons = {
  Power,
  Settings,
  HardDrive,
  Wifi,
  Terminal,
  Shield,
} as const;

function ServersHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center">
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-12">
        <ScrollReveal>
          <Gamepad2 size={48} className="text-accent mb-8" />
        </ScrollReveal>
        <ScrollText
          text="Game servers, always online."
          tag="h1"
          className="font-[590] text-5xl sm:text-6xl tracking-[-0.022em] leading-tight max-w-3xl"
        />
        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-lg text-foreground-muted max-w-xl leading-relaxed">
            Dedicated hardware, no rental services, no cold starts. Every game
            server will be included with your Athion Pro subscription.
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

function ServerGames() {
  return (
    <section id="games" className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">What we host</p>
        </ScrollReveal>
        <ScrollText
          text="Your games. Our hardware."
          tag="h2"
          className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
        />
        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-foreground-muted max-w-lg leading-relaxed">
            Dedicated servers for every game we play. Modpack support, persistent
            worlds, and always-on uptime.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid md:grid-cols-2 gap-8">
          {GAME_SERVERS.map((game) => {
            const Icon = gameIcons[game.icon as keyof typeof gameIcons];
            return (
              <StaggerItem key={game.title}>
                <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                  <div className="flex items-start justify-between">
                    <Icon size={28} className="text-accent" />
                    {game.status === "online" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Online
                      </span>
                    ) : (
                      <span className="text-xs text-accent">Coming Soon</span>
                    )}
                  </div>
                  <h3 className="mt-4 font-[590] text-xl tracking-[-0.012em]">
                    {game.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {game.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs text-foreground-muted bg-white/[0.04] border border-white/[0.06] rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ServerFeatures() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">Infrastructure</p>
        </ScrollReveal>
        <ScrollText
          text="No rental servers. No compromises."
          tag="h2"
          className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
        />
        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-foreground-muted max-w-lg leading-relaxed">
            Every game server runs on our own hardware with the infrastructure
            features you actually need.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVER_FEATURES.map((feature) => {
            const Icon =
              featureIcons[feature.icon as keyof typeof featureIcons];
            return (
              <StaggerItem key={feature.title}>
                <div className="border-t border-border pt-6">
                  <Icon size={20} className="text-accent mb-3" />
                  <h3 className="font-[590] text-lg tracking-[-0.012em]">
                    {feature.title}
                  </h3>
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

function ServersCTA() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="font-[590] text-3xl sm:text-4xl tracking-[-0.022em]">
            Stop renting. Start playing.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mt-4 text-foreground-muted leading-relaxed">
            Every game server is included with your Athion subscription. No
            extra fees, no per-server pricing.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
            >
              Subscribe
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

export default function ServersPage() {
  return (
    <PageTransition>
      <ServersHero />
      <ServerGames />
      <ServerFeatures />
      <ServersCTA />
    </PageTransition>
  );
}
