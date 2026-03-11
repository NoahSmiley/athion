"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AudioWaveform,
  Lock,
  Monitor,
  MicOff,
  MessageSquare,
  Zap,
  Download,
  Apple,
  MonitorDot,
  ArrowRight,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";
import { ScrollZoom } from "@/components/parallax";
import { FluxLogo } from "@/components/flux-logo";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";
import { FLUX_FEATURES, SCREEN_SHARE_PRESETS } from "@/lib/constants";

// ── Data ──

const fluxBenchmarks: BenchmarkGroup[] = [
  {
    metric: "Memory Usage (Idle)",
    ours: { label: "Flux", value: 48 },
    theirs: { label: "Discord", value: 320 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "Memory Usage (Voice Call)",
    ours: { label: "Flux", value: 85 },
    theirs: { label: "Discord", value: 520 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "App Binary Size",
    ours: { label: "Flux", value: 12 },
    theirs: { label: "Discord", value: 300 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "Voice Latency (P95)",
    ours: { label: "Flux", value: 45 },
    theirs: { label: "Discord", value: 120 },
    unit: "ms",
    lowerIsBetter: true,
  },
  {
    metric: "CPU Usage (Voice Call)",
    ours: { label: "Flux", value: 2.1 },
    theirs: { label: "Discord", value: 8.5 },
    unit: "%",
    lowerIsBetter: true,
  },
  {
    metric: "Audio Quality (Bitrate)",
    ours: { label: "Flux", value: 320 },
    theirs: { label: "Discord", value: 96 },
    unit: " kbps",
    lowerIsBetter: false,
  },
];

const SHOWCASE_SECTIONS = [
  {
    overline: "Voice",
    title: "Talk with crystal clarity.",
    description:
      "48kHz stereo audio with Opus CBR encoding and Krisp AI noise suppression. Hear every detail without the background noise.",
    image: "/flux/voice.png",
    imageAlt: "Flux voice channel with participants in a call",
  },
  {
    overline: "Screen Share",
    title: "Share your screen, losslessly.",
    description:
      "Up to 4K VP9 at 20 Mbps with six quality presets. No compression artifacts, no framerate drops — your screen, pixel-perfect.",
    image: "/flux/screenshare.png",
    imageAlt: "Flux lossless screen sharing view",
  },
  {
    overline: "Chat",
    title: "Messaging that keeps up.",
    description:
      "Rich text, emoji reactions, file sharing, and threaded replies — all encrypted end-to-end with AES-256-GCM.",
    image: "/flux/chat.png",
    imageAlt: "Flux text chat with messages and reactions",
  },
];

const iconMap = {
  AudioWaveform,
  Lock,
  Monitor,
  MicOff,
  MessageSquare,
  Zap,
} as const;

// ── Desktop Frame Component ──

function DesktopFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Glow behind the monitor */}
      <div className="absolute -inset-8 bg-accent/8 blur-3xl rounded-3xl pointer-events-none" />
      {/* Monitor frame */}
      <div className="relative">
        {/* Screen bezel */}
        <div className="bg-[#1a1a1e] rounded-xl border border-[#2a2a2e] p-2 shadow-2xl shadow-black/60">
          {/* Title bar dots */}
          <div className="flex items-center gap-1.5 px-2 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          {/* Screen content */}
          <div className="rounded-md overflow-hidden">
            <img
              src={src}
              alt={alt}
              className="w-full h-auto block"
            />
          </div>
        </div>
        {/* Monitor stand */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-6 bg-gradient-to-b from-[#1a1a1e] to-[#141416] border-x border-[#2a2a2e]" />
          <div className="w-28 h-2 bg-[#1a1a1e] rounded-b-lg border border-t-0 border-[#2a2a2e]" />
        </div>
      </div>
    </div>
  );
}

// ── Hero ──

function FluxHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <section ref={ref} className="relative overflow-hidden min-h-[90vh] flex items-center">
      <motion.div
        className="mx-auto max-w-7xl px-6 pt-32 pb-20 grid md:grid-cols-2 gap-12 md:gap-16 items-center"
        style={{ opacity: smoothOpacity, y: smoothY }}
      >
        {/* Left — Text */}
        <div>
          <ScrollReveal>
            <FluxLogo size={40} className="text-accent" />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mt-6 font-serif text-5xl sm:text-6xl md:text-5xl lg:text-7xl tracking-[-0.03em] leading-[0.9] uppercase font-bold italic">
              Voice chat
              <br />
              that&apos;s all
              <br />
              <span className="text-foreground-muted">signal.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-base sm:text-lg text-foreground-muted max-w-md leading-relaxed">
              Crystal-clear audio, lossless screen sharing, and encrypted messaging — in a desktop app lighter than a browser tab.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#download"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Download size={14} />
                Download for Free
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-border text-foreground-muted text-sm hover:text-foreground hover:border-border-light transition-colors"
              >
                See Features
                <ArrowRight size={14} />
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Right — Desktop mockup */}
        <ScrollReveal delay={0.2} direction="right">
          <DesktopFrame
            src="/flux/hero.png"
            alt="Flux desktop app showing music playback and YouTube search"
          />
        </ScrollReveal>
      </motion.div>
    </section>
  );
}

// ── Alternating Feature Showcase (Discord-style) ──

function FeatureShowcase() {
  return (
    <section id="features" className="py-24 border-t border-border">
      {SHOWCASE_SECTIONS.map((section, i) => {
        const imageOnRight = i % 2 === 0;
        return (
          <div
            key={section.overline}
            className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            {/* Text */}
            <div className={imageOnRight ? "md:order-1" : "md:order-2"}>
              <ScrollReveal direction={imageOnRight ? "left" : "right"}>
                <p className="overline mb-4">{section.overline}</p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-[-0.02em] leading-tight">
                  {section.title}
                </h2>
                <p className="mt-4 text-foreground-muted leading-relaxed text-base sm:text-lg">
                  {section.description}
                </p>
              </ScrollReveal>
            </div>
            {/* Screenshot in desktop frame */}
            <div className={imageOnRight ? "md:order-2" : "md:order-1"}>
              <ScrollReveal direction={imageOnRight ? "right" : "left"} delay={0.15}>
                <DesktopFrame
                  src={section.image}
                  alt={section.imageAlt}
                />
              </ScrollReveal>
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ── Feature Grid ──

function FeatureGrid() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="overline mb-4">Features</p>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em]">
            Every detail, considered.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FLUX_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <StaggerItem key={feature.title}>
                <div className="group p-6 border border-border rounded-sm hover:border-border-light transition-all duration-300">
                  <Icon size={20} className="text-accent" />
                  <h3 className="mt-4 font-serif text-lg">{feature.title}</h3>
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
              <p className="overline mb-4">Technical Specifications</p>
              <h2 className="font-serif text-4xl tracking-[-0.02em]">
                Under the hood.
              </h2>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                Flux is built on a Rust backend with LiveKit WebRTC for media
                routing. The desktop app uses Tauri — no Electron, no bloat.
              </p>
            </ScrollReveal>

            <StaggerContainer className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4">
              {specs.map((spec) => (
                <StaggerItem key={spec.label}>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-foreground-muted uppercase tracking-wider">
                      {spec.label}
                    </p>
                    <p className="mt-1 text-sm font-mono">{spec.value}</p>
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
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">
                        Preset
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">
                        Codec
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">
                        Bitrate
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">
                        FPS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCREEN_SHARE_PRESETS.map((row) => (
                      <tr
                        key={row.preset}
                        className="border-b border-border last:border-b-0 hover:bg-background-elevated/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-accent">
                          {row.preset}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground-muted">
                          {row.codec}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground-muted">
                          {row.bitrate}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground-muted">
                          {row.framerate}
                        </td>
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

// ── Download CTA ──

function DownloadCTA() {
  const [authState, setAuthState] = useState<"loading" | "none" | "no-sub" | "active">("loading");
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) {
        setAuthState("none");
        return;
      }
      const subsRes = await fetch("/api/subscriptions");
      const subsData = await subsRes.json();
      const hasFlux = subsData.subscriptions?.some(
        (s: { product: string }) => s.product === "flux"
      );
      setAuthState(hasFlux ? "active" : "no-sub");
    };
    check();
  }, []);

  const handleDownloadClick = () => {
    if (authState === "none") {
      router.push("/signup");
    } else if (authState === "no-sub") {
      router.push("/pricing");
    } else {
      router.push("/dashboard/downloads");
    }
  };

  const ctaLabel =
    authState === "none"
      ? "Sign Up to Download"
      : authState === "no-sub"
        ? "Subscribe to Download"
        : "Download for macOS";

  return (
    <section
      id="download"
      className="relative py-40 px-6 border-t border-border overflow-hidden"
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        <ScrollReveal>
          <FluxLogo size={40} className="mx-auto text-accent mb-6" />
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-[-0.02em]">
            Ready when you are.
          </h2>
          <p className="mt-4 text-foreground-muted max-w-md mx-auto text-lg">
            Native desktop app — no browser required, no Electron overhead.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              <Apple size={16} />
              {ctaLabel}
            </button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground-muted text-sm hover:text-foreground hover:border-border-light transition-colors"
            >
              <MonitorDot size={16} />
              {authState === "active" ? "Download for Windows" : ctaLabel}
            </button>
          </div>
          <p className="mt-4 text-xs text-foreground-muted/60">
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
      <FeatureShowcase />
      <FeatureGrid />
      <FluxBenchmarks />
      <TechSpecs />
      <DownloadCTA />
    </PageTransition>
  );
}
