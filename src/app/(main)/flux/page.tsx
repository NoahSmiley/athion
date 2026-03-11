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

const PILLARS = [
  {
    Icon: Volume2,
    title: "Crystal-clear voice",
    description: "48kHz stereo Opus audio with Krisp AI noise suppression. Keyboard clatter, fans, and background chatter vanish — your voice stays untouched.",
    stats: [
      { value: "48kHz", label: "Sample Rate" },
      { value: "320kbps", label: "Bitrate" },
      { value: "Krisp AI", label: "Noise Filter" },
    ],
  },
  {
    Icon: Monitor,
    title: "Lossless streaming",
    description: "VP9 screen sharing up to 4K at 20 Mbps with six quality presets. Your IDE, your game, your design — every pixel, exactly as you see it.",
    stats: [
      { value: "4K", label: "Max Resolution" },
      { value: "60fps", label: "Frame Rate" },
      { value: "VP9", label: "Codec" },
    ],
  },
  {
    Icon: Shield,
    title: "Encrypted by default",
    description: "Every message, every file, every reaction — encrypted end-to-end with AES-256-GCM before it leaves your device. We can't read your messages.",
    stats: [
      { value: "AES-256", label: "Encryption" },
      { value: "ECDH", label: "Key Exchange" },
      { value: "E2EE", label: "Every Message" },
    ],
  },
];

const iconMap = { AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap } as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

// ── Hero ──

function FluxHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 px-6">
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <FluxLogo size={32} className="text-white/50 mx-auto" />
        </motion.div>

        <motion.h1
          className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] leading-[1.08] text-white"
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
          className="mt-5 text-base sm:text-lg text-white/45 max-w-lg mx-auto leading-relaxed"
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={fadeUp}
        >
          Crystal-clear audio, lossless screen sharing, and encrypted messaging — in a desktop app lighter than a browser tab.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          initial="hidden"
          animate="visible"
          custom={0.3}
          variants={fadeUp}
        >
          <a
            href="#download"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#09090b] text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            <Download size={14} />
            Download for Free
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/12 text-white/60 text-sm rounded-lg hover:text-white hover:border-white/25 transition-colors"
          >
            See Features
            <ArrowRight size={14} />
          </a>
        </motion.div>

        <motion.div
          className="mt-14 flex items-center justify-center gap-12"
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
              <div className="text-lg font-mono font-medium text-white tracking-tight">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/25 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Product Screenshot ──

function ProductScreenshot() {
  return (
    <section className="relative px-6 pb-24 sm:pb-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="absolute -inset-12 bg-white/[0.015] rounded-[2rem] blur-3xl pointer-events-none" />
          <div className="relative rounded-xl overflow-hidden border border-white/[0.08]">
            <img
              src="/flux/hero.png"
              alt="Flux — Music and voice channels"
              className="w-full h-auto block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Feature Pillars ──

function FeaturePillars() {
  return (
    <section id="features" className="py-24 px-6 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/30 text-center mb-3">Core Features</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-center text-white">
            Built for serious communication.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-14 grid md:grid-cols-3 gap-4">
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.title}>
              <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.015] h-full flex flex-col">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <pillar.Icon size={16} className="text-white/50" />
                </div>
                <h3 className="mt-4 text-[15px] font-medium text-white/90">{pillar.title}</h3>
                <p className="mt-2 text-sm text-white/35 leading-relaxed flex-1">
                  {pillar.description}
                </p>
                <div className="mt-6 pt-4 border-t border-white/[0.05] flex gap-6">
                  {pillar.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-sm font-mono font-medium text-white/70">{stat.value}</div>
                      <div className="text-[9px] uppercase tracking-[0.15em] text-white/20 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ── Feature Grid ──

function FeatureGrid() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/30 text-center mb-3">Details</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-center text-white">
            Every detail, considered.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FLUX_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <StaggerItem key={feature.title}>
                <div className="group p-5 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Icon size={14} className="text-white/50" />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-white/85">{feature.title}</h3>
                  <p className="mt-1.5 text-[13px] text-white/30 leading-relaxed">
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
    <section className="py-24 px-6 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/30 mb-3">Specifications</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-white">Under the hood.</h2>
              <p className="mt-4 text-white/35 leading-relaxed">
                Flux is built on a Rust backend with LiveKit WebRTC for media routing. The desktop app uses Tauri — no Electron, no bloat.
              </p>
            </ScrollReveal>
            <StaggerContainer className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3">
              {specs.map((spec) => (
                <StaggerItem key={spec.label}>
                  <div className="border-t border-white/[0.04] pt-3">
                    <p className="text-[10px] text-white/25 uppercase tracking-[0.15em]">{spec.label}</p>
                    <p className="mt-0.5 text-sm font-mono text-white/55">{spec.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
          <div>
            <ScrollReveal delay={0.15}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/30 mb-3">Screen Share Presets</p>
              <div className="border border-white/[0.05] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.015]">
                      <th className="text-left px-4 py-2.5 text-[10px] text-white/25 uppercase tracking-[0.15em] font-normal">Preset</th>
                      <th className="text-left px-4 py-2.5 text-[10px] text-white/25 uppercase tracking-[0.15em] font-normal">Codec</th>
                      <th className="text-left px-4 py-2.5 text-[10px] text-white/25 uppercase tracking-[0.15em] font-normal">Bitrate</th>
                      <th className="text-left px-4 py-2.5 text-[10px] text-white/25 uppercase tracking-[0.15em] font-normal">FPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCREEN_SHARE_PRESETS.map((row) => (
                      <tr key={row.preset} className="border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.015] transition-colors">
                        <td className="px-4 py-2 font-mono text-white/45 text-xs">{row.preset}</td>
                        <td className="px-4 py-2 font-mono text-white/30 text-xs">{row.codec}</td>
                        <td className="px-4 py-2 font-mono text-white/30 text-xs">{row.bitrate}</td>
                        <td className="px-4 py-2 font-mono text-white/30 text-xs">{row.framerate}</td>
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
    <section id="download" className="py-32 px-6 border-t border-white/[0.04]">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white">
            Ready to switch?
          </h2>
          <p className="mt-4 text-white/35 max-w-md mx-auto">
            Join the voice chat that doesn&apos;t spy on you, doesn&apos;t eat your RAM, and sounds like you&apos;re in the same room.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#09090b] text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              <Apple size={14} />
              {ctaLabel}
            </button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/12 text-white/60 text-sm rounded-lg hover:text-white hover:border-white/25 transition-colors"
            >
              <MonitorDot size={14} />
              {authState === "active" ? "Download for Windows" : ctaLabel}
            </button>
          </div>
          <p className="mt-4 text-xs text-white/20">
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
      <ProductScreenshot />
      <FeaturePillars />
      <FeatureGrid />
      <FluxBenchmarks />
      <TechSpecs />
      <DownloadCTA />
    </PageTransition>
  );
}
