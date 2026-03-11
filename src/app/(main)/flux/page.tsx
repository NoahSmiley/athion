"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap,
  Download, Apple, MonitorDot, ArrowRight, Shield, Volume2,
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

const FEATURE_SHOWCASES = [
  {
    overline: "Messaging",
    title: "Conversations that flow.",
    description: "Rich text messaging with inline emoji, reactions, threaded replies, and file sharing — all encrypted end-to-end before leaving your device.",
    image: "/flux/chat.png",
    imageAlt: "Flux chat messages with multi-user conversation",
    gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
    stats: [
      { value: "AES-256", label: "Encryption" },
      { value: "E2EE", label: "Every Message" },
    ],
  },
  {
    overline: "Voice",
    title: "Audio that disappears.",
    description: "48kHz stereo Opus audio with Krisp AI noise suppression. Keyboard clatter, fans, and background chatter vanish — your voice stays untouched.",
    image: "/flux/voice.png",
    imageAlt: "Flux voice channel with connected users",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    stats: [
      { value: "48kHz", label: "Sample Rate" },
      { value: "320kbps", label: "Bitrate" },
    ],
  },
  {
    overline: "Screen Share",
    title: "Every pixel, exactly as you see it.",
    description: "VP9 screen sharing up to 4K at 20 Mbps with six quality presets. Your IDE, your game, your design — lossless when you need it.",
    image: "/flux/sidebar.png",
    imageAlt: "Flux channel sidebar with text and voice channels",
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    stats: [
      { value: "4K", label: "Max Resolution" },
      { value: "60fps", label: "Frame Rate" },
    ],
  },
];

const iconMap = { AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap } as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// ── Hero ──

function FluxHero() {
  return (
    <section className="relative pt-40 sm:pt-48 pb-20 px-6">
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <FluxLogo size={36} className="text-foreground-muted/50 mx-auto" />
        </motion.div>

        <motion.h1
          className="mt-10 font-serif text-5xl sm:text-6xl md:text-7xl tracking-[-0.02em] leading-[1.05]"
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeUp}
        >
          Voice chat that&apos;s
          <br />
          all signal.
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-foreground-muted max-w-xl mx-auto leading-relaxed"
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={fadeUp}
        >
          Crystal-clear audio, lossless screen sharing, and encrypted messaging — in a desktop app lighter than a browser tab.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial="hidden"
          animate="visible"
          custom={0.3}
          variants={fadeUp}
        >
          <a
            href="#download"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground text-sm font-medium rounded-sm hover:opacity-90 transition-opacity"
          >
            <Download size={14} />
            Download for Free
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground-muted text-sm rounded-sm hover:text-foreground hover:border-foreground/20 transition-colors"
          >
            See Features
            <ArrowRight size={14} />
          </a>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center justify-center gap-16"
          initial="hidden"
          animate="visible"
          custom={0.4}
          variants={fadeUp}
        >
          {[
            { value: "48MB", label: "Memory" },
            { value: "<45ms", label: "Latency" },
            { value: "320kbps", label: "Audio" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-mono font-medium text-foreground tracking-tight">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-foreground-muted/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── App Showcase (Hero Screenshot) ──

function AppShowcase() {
  return (
    <section className="relative px-6 pb-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-16 bg-accent/[0.03] rounded-[3rem] blur-3xl pointer-events-none" />
          <div className="absolute -inset-8 bg-accent/[0.02] rounded-[2rem] blur-2xl pointer-events-none" />

          <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl shadow-black/20">
            <img
              src="/flux/hero.png"
              alt="Flux — Desktop chat application with voice, messaging, and screen sharing"
              className="w-full h-auto block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Feature Showcase Sections ──

function FeatureShowcase({
  overline,
  title,
  description,
  image,
  imageAlt,
  gradient,
  stats,
  reversed,
}: {
  overline: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  gradient: string;
  stats: { value: string; label: string }[];
  reversed?: boolean;
}) {
  return (
    <section className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center`}>
          {/* Screenshot in gradient container */}
          <ScrollReveal
            direction={reversed ? "right" : "left"}
            className={reversed ? "lg:order-2" : ""}
          >
            <div className="relative">
              {/* Gradient background container */}
              <div className={`absolute -inset-4 rounded-2xl bg-gradient-to-br ${gradient} blur-sm`} />
              <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-6 sm:p-8`}>
                <div className="rounded-lg overflow-hidden shadow-2xl shadow-black/30 border border-white/[0.08]">
                  <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <div className={reversed ? "lg:order-1" : ""}>
            <ScrollReveal delay={0.1}>
              <p className="overline mb-4">{overline}</p>
              <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight">
                {title}
              </h2>
              <p className="mt-6 text-foreground-muted leading-relaxed max-w-lg">
                {description}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mt-10 flex gap-10">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-mono font-medium text-accent">{stat.value}</div>
                    <div className="text-xs text-foreground-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureShowcases() {
  return (
    <div id="features">
      {FEATURE_SHOWCASES.map((feature, i) => (
        <FeatureShowcase
          key={feature.overline}
          {...feature}
          reversed={i % 2 === 1}
        />
      ))}
    </div>
  );
}

// ── Feature Grid ──

function FeatureGrid() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="overline mb-4">Details</p>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight max-w-2xl">
            Every detail, considered.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FLUX_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <StaggerItem key={feature.title}>
                <div className="group p-6 rounded-sm border border-border bg-background-elevated hover:bg-background-elevated/80 transition-colors duration-300 h-full">
                  <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center">
                    <Icon size={16} className="text-accent" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-foreground">{feature.title}</h3>
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
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal>
              <p className="overline mb-4">Specifications</p>
              <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight">
                Under the hood.
              </h2>
              <p className="mt-6 text-foreground-muted leading-relaxed">
                Flux is built on a Rust backend with LiveKit WebRTC for media routing. The desktop app uses Tauri — no Electron, no bloat.
              </p>
            </ScrollReveal>
            <StaggerContainer className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4">
              {specs.map((spec) => (
                <StaggerItem key={spec.label}>
                  <div className="border-t border-border pt-4">
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
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background-elevated">
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">Preset</th>
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">Codec</th>
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">Bitrate</th>
                      <th className="text-left px-5 py-3 text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em] font-normal">FPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCREEN_SHARE_PRESETS.map((row) => (
                      <tr key={row.preset} className="border-b border-border/50 last:border-b-0 hover:bg-background-elevated/50 transition-colors">
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
    <section id="download" className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <p className="overline mb-4">Get Started</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-[-0.02em] leading-tight">
            Ready to switch?
          </h2>
          <p className="mt-6 text-foreground-muted max-w-md mx-auto leading-relaxed">
            Join the voice chat that doesn&apos;t spy on you, doesn&apos;t eat your RAM, and sounds like you&apos;re in the same room.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground text-sm font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              <Apple size={14} />
              {ctaLabel}
            </button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground-muted text-sm rounded-sm hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <MonitorDot size={14} />
              {authState === "active" ? "Download for Windows" : ctaLabel}
            </button>
          </div>
          <p className="mt-5 text-xs text-foreground-muted/50">
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
      <AppShowcase />
      <FeatureShowcases />
      <FeatureGrid />
      <FluxBenchmarks />
      <TechSpecs />
      <DownloadCTA />
    </PageTransition>
  );
}
