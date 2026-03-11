"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap,
  Download, Apple, MonitorDot, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import { FluxLogo } from "@/components/flux-logo";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";
import { FLUX_FEATURES, SCREEN_SHARE_PRESETS } from "@/lib/constants";

// ── Data ──

const fluxBenchmarks: BenchmarkGroup[] = [
  { metric: "Memory Usage (Idle)", ours: { label: "Flux", value: 48 }, theirs: { label: "Discord", value: 320 }, unit: " MB", lowerIsBetter: true },
  { metric: "Memory Usage (Voice Call)", ours: { label: "Flux", value: 85 }, theirs: { label: "Discord", value: 520 }, unit: " MB", lowerIsBetter: true },
  { metric: "App Binary Size", ours: { label: "Flux", value: 12 }, theirs: { label: "Discord", value: 300 }, unit: " MB", lowerIsBetter: true },
  { metric: "Voice Latency (P95)", ours: { label: "Flux", value: 45 }, theirs: { label: "Discord", value: 120 }, unit: "ms", lowerIsBetter: true },
  { metric: "CPU Usage (Voice Call)", ours: { label: "Flux", value: 2.1 }, theirs: { label: "Discord", value: 8.5 }, unit: "%", lowerIsBetter: true },
  { metric: "Audio Quality (Bitrate)", ours: { label: "Flux", value: 320 }, theirs: { label: "Discord", value: 96 }, unit: " kbps", lowerIsBetter: false },
];

// Feature section data — images are composed per-section in the render

const iconMap = { AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap } as const;

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
};

// ── Hero ──
// Linear-style: large thin headline, subtitle in muted color, screenshot below

function FluxHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-6 px-6">
      <div className="relative mx-auto max-w-5xl">
        <motion.p
          className="text-sm text-foreground-muted mb-6"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          Purpose-built for teams who value privacy. Designed for performance.
        </motion.p>

        <motion.h1
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.03em] leading-[1.1]"
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeUp}
        >
          <span className="text-foreground">The voice chat platform </span>
          <span className="text-foreground-muted">that doesn&apos;t spy on you, doesn&apos;t eat your RAM, and sounds like you&apos;re in the same room.</span>
        </motion.h1>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={fadeUp}
        >
          <a
            href="#download"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            <Download size={14} />
            Download for Free
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            See what&apos;s inside
            <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ── Hero Screenshot ──

function HeroScreenshot() {
  return (
    <section className="relative px-6 pt-16 pb-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="relative rounded-lg overflow-hidden border border-border/50">
            <img
              src="/flux/hero.png"
              alt="Flux — Desktop chat application with voice, messaging, and screen sharing"
              className="w-full h-auto block"
            />
            {/* Bottom fade to blend into background */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Section Header ── (reusable)

function SectionHeader({
  number,
  label,
  title,
  description,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <ScrollReveal>
        <div className="flex items-center gap-2 mb-16">
          <span className="text-sm font-mono text-foreground-muted">{number}</span>
          <span className="text-sm text-foreground-muted">{label}</span>
          <ArrowRight size={14} className="text-foreground-muted" />
        </div>
      </ScrollReveal>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
        <ScrollReveal>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.02em] leading-[1.15] text-foreground whitespace-pre-line">
            {title}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-foreground-muted leading-relaxed lg:pt-2">
            {description}
          </p>
        </ScrollReveal>
      </div>
    </>
  );
}

function SubFeatures({ items }: { items: { number: string; label: string }[] }) {
  return (
    <ScrollReveal delay={0.1}>
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((sf) => (
          <div key={sf.number} className="flex items-baseline gap-2">
            <span className="text-sm font-mono text-foreground-muted/50">{sf.number}</span>
            <span className="text-sm text-foreground-muted">{sf.label}</span>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}

// ── 1.0 Messaging ──
// Composited: channel sidebar floating over the message stream

function MessagingSection() {
  return (
    <section className="py-24 sm:py-32 px-6 border-t border-border/50">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          number="1.0"
          label="Messaging"
          title={"Encrypted by default.\nConversations that stay yours."}
          description="Every message, file, and reaction is encrypted end-to-end with AES-256-GCM before leaving your device. Rich text, emoji, reactions, and threaded replies — without compromising privacy."
        />

        {/* Composited image: sidebar floating over message area */}
        <ScrollReveal>
          <div className="relative">
            {/* Message area — the main piece */}
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl">
              <img
                src="/flux/chat.png"
                alt="Flux encrypted conversation in #general"
                className="w-full h-auto block"
              />
            </div>

            {/* Channel sidebar — floating offset card */}
            <div className="absolute -left-4 sm:-left-8 top-8 sm:top-12 w-[140px] sm:w-[180px] rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-background">
              <img
                src="/flux/sidebar.png"
                alt="Flux channel sidebar"
                className="w-full h-auto block"
                style={{ maxHeight: "400px", objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          </div>
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "1.1", label: "End-to-end encryption" },
            { number: "1.2", label: "Rich messaging" },
            { number: "1.3", label: "File sharing" },
            { number: "1.4", label: "Reactions & threads" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 2.0 Voice ──
// Shows the Voice & Audio settings panel — a completely different UI from the chat

function VoiceSection() {
  return (
    <section className="py-24 sm:py-32 px-6 border-t border-border/50">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          number="2.0"
          label="Voice"
          title={"Crystal-clear audio.\nNoise suppression that actually works."}
          description="48kHz stereo Opus audio with Krisp AI noise suppression running locally on your device. Keyboard clatter, fans, and background chatter vanish — your voice stays untouched. Sub-45ms latency over LiveKit's globally distributed SFU."
        />

        {/* Voice & Audio settings — shows the audio engine controls */}
        <ScrollReveal>
          <div className="flex justify-center">
            <div className="relative max-w-lg w-full">
              <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl">
                <img
                  src="/flux/settings.png"
                  alt="Flux Voice & Audio settings with noise suppression, echo cancellation, and adaptive bitrate controls"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "2.1", label: "48kHz stereo" },
            { number: "2.2", label: "Krisp noise filter" },
            { number: "2.3", label: "320kbps bitrate" },
            { number: "2.4", label: "<45ms latency" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 3.0 Screen Share ──
// Shows the #dev channel messages about screen sharing — technical discussion

function ScreenShareSection() {
  return (
    <section className="py-24 sm:py-32 px-6 border-t border-border/50">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          number="3.0"
          label="Screen Share"
          title={"Lossless streaming.\nEvery pixel, exactly as you see it."}
          description="VP9 screen sharing up to 4K at 20 Mbps with six quality presets. Share your IDE, your game, or your design — from 480p30 all the way to lossless. No Nitro required."
        />

        {/* #dev conversation about screen sharing — cropped message fragment */}
        <ScrollReveal>
          <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl">
            <img
              src="/flux/voice.png"
              alt="Flux dev channel discussing screen share quality presets and VP9 encoding"
              className="w-full h-auto block"
            />
          </div>
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "3.1", label: "4K resolution" },
            { number: "3.2", label: "60fps streaming" },
            { number: "3.3", label: "VP9 codec" },
            { number: "3.4", label: "6 quality presets" },
          ]}
        />
      </div>
    </section>
  );
}

function FeatureSections() {
  return (
    <div id="features">
      <MessagingSection />
      <VoiceSection />
      <ScreenShareSection />
    </div>
  );
}

// ── Feature Grid ──

function FeatureGrid() {
  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="overline mb-4">Details</p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.02em] leading-[1.15] max-w-2xl">
            Every detail, considered.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
          {FLUX_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <StaggerItem key={feature.title}>
                <div className="bg-background p-8 h-full">
                  <Icon size={16} className="text-foreground-muted mb-4" />
                  <h3 className="text-sm font-medium text-foreground">{feature.title}</h3>
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

// ── Benchmarks ──

function FluxBenchmarks() {
  return (
    <BenchmarkSection
      subtitle="Performance"
      title="Voice chat that respects your machine."
      description="Flux uses less memory at idle than Discord uses to show its loading screen. Smaller install, lower latency, higher audio quality — without draining your battery or hogging your CPU."
      benchmarks={fluxBenchmarks}
      statCards={[
        { value: "6.7×", label: "Less memory", detail: "48 MB vs 320 MB idle" },
        { value: "25×", label: "Smaller install", detail: "12 MB vs 300 MB" },
        { value: "2.7×", label: "Lower latency", detail: "45ms vs 120ms voice P95" },
        { value: "3.3×", label: "Higher bitrate", detail: "320 kbps vs 96 kbps audio" },
      ]}
    />
  );
}

// ── Tech Specs ──

function TechSpecs() {
  const specs = [
    { label: "Audio Codec", value: "Opus" },
    { label: "Sample Rate", value: "48 kHz" },
    { label: "Channels", value: "Stereo" },
    { label: "Bitrate Mode", value: "CBR (constant)" },
    { label: "Encryption", value: "AES-256-GCM" },
    { label: "Key Exchange", value: "ECDH P-256" },
    { label: "Media Transport", value: "WebRTC (LiveKit SFU)" },
    { label: "Video Codec", value: "H.264 / VP9" },
    { label: "Desktop Framework", value: "Tauri (Rust)" },
    { label: "Backend", value: "Rust + SQLite" },
  ];

  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal>
              <p className="overline mb-4">Specifications</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.02em] leading-[1.15]">
                Under the hood.
              </h2>
              <p className="mt-6 text-foreground-muted leading-relaxed">
                Flux is built on a Rust backend with LiveKit WebRTC for media routing. The desktop app uses Tauri — no Electron, no bloat.
              </p>
            </ScrollReveal>
            <StaggerContainer className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4">
              {specs.map((spec) => (
                <StaggerItem key={spec.label}>
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em]">{spec.label}</p>
                    <p className="mt-1 text-sm font-mono text-foreground/70">{spec.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
          <div>
            <ScrollReveal delay={0.15}>
              <p className="overline mb-4">Screen Share Presets</p>
              <div className="border border-border/50 rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-background-elevated">
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">Preset</th>
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">Codec</th>
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">Bitrate</th>
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">FPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCREEN_SHARE_PRESETS.map((row) => (
                      <tr key={row.preset} className="border-b border-border/30 last:border-b-0 hover:bg-background-elevated/50 transition-colors">
                        <td className="px-5 py-3 font-mono text-foreground/60 text-xs">{row.preset}</td>
                        <td className="px-5 py-3 font-mono text-foreground-muted text-xs">{row.codec}</td>
                        <td className="px-5 py-3 font-mono text-foreground-muted text-xs">{row.bitrate}</td>
                        <td className="px-5 py-3 font-mono text-foreground-muted text-xs">{row.framerate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Bottom CTA ──

function DownloadCTA() {
  const [authState, setAuthState] = useState<"loading" | "none" | "no-sub" | "active">("loading");
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) { setAuthState("none"); return; }
      const subsRes = await fetch("/api/subscriptions");
      const subsData = await subsRes.json();
      const hasFlux = subsData.subscriptions?.some((s: { product: string }) => s.product === "flux");
      setAuthState(hasFlux ? "active" : "no-sub");
    };
    check();
  }, []);

  const handleDownloadClick = () => {
    if (authState === "none") router.push("/signup");
    else if (authState === "no-sub") router.push("/pricing");
    else router.push("/dashboard/downloads");
  };

  const ctaLabel = authState === "none" ? "Sign Up to Download" : authState === "no-sub" ? "Subscribe to Download" : "Download for macOS";

  return (
    <section id="download" className="py-32 px-6 border-t border-border/50">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light tracking-[-0.03em] leading-[1.1]">
            <span className="text-foreground">Ready to switch? </span>
            <span className="text-foreground-muted">Join the voice chat that respects your privacy and your machine.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              <Apple size={14} />
              {ctaLabel}
            </button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground-muted text-sm rounded-full hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <MonitorDot size={14} />
              {authState === "active" ? "Download for Windows" : ctaLabel}
            </button>
          </div>
          <p className="mt-6 text-xs text-foreground-muted/50">
            Available for macOS and Windows. Linux coming soon.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Page ──

export default function FluxPage() {
  return (
    <PageTransition>
      <FluxHero />
      <HeroScreenshot />
      <FeatureSections />
      <FeatureGrid />
      <FluxBenchmarks />
      <TechSpecs />
      <DownloadCTA />
    </PageTransition>
  );
}
