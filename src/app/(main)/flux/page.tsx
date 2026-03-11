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
import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";
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

const SHOWCASE_SECTIONS = [
  {
    overline: "Voice",
    title: "Talk with crystal clarity.",
    description: "48kHz stereo audio with Opus CBR encoding and Krisp AI noise suppression. Hear every detail without the background noise.",
    image: "/flux/voice.png",
    imageAlt: "Flux voice channel with participants in a call",
    gradient: "from-violet-600/20 via-fuchsia-500/10 to-transparent",
  },
  {
    overline: "Screen Share",
    title: "Share your screen, losslessly.",
    description: "Up to 4K VP9 at 20 Mbps with six quality presets. No compression artifacts, no framerate drops — your screen, pixel-perfect.",
    image: "/flux/screenshare.png",
    imageAlt: "Flux lossless screen sharing view",
    gradient: "from-cyan-600/20 via-blue-500/10 to-transparent",
  },
  {
    overline: "Chat",
    title: "Messaging that keeps up.",
    description: "Rich text, emoji reactions, file sharing, and threaded replies — all encrypted end-to-end with AES-256-GCM.",
    image: "/flux/chat.png",
    imageAlt: "Flux text chat with messages and reactions",
    gradient: "from-emerald-600/20 via-teal-500/10 to-transparent",
  },
];

const iconMap = { AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap } as const;

// ── Floating Particles ──

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1 + Math.random(), 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Larger glowing orbs */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            background: `radial-gradient(circle, ${["rgba(139,92,246,0.5)", "rgba(236,72,153,0.4)", "rgba(59,130,246,0.4)", "rgba(168,85,247,0.5)", "rgba(99,102,241,0.4)", "rgba(217,70,239,0.4)"][i]}, transparent)`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -50 - Math.random() * 30, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Desktop Frame ──

function DesktopFrame({ src, alt, className, glow }: { src: string; alt: string; className?: string; glow?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Colored glow behind the monitor */}
      <div className={`absolute -inset-12 blur-3xl rounded-3xl pointer-events-none opacity-60 ${glow ?? "bg-violet-500/15"}`} />
      <div className="relative">
        <div className="bg-[#111114] rounded-xl border border-white/10 p-2 shadow-2xl shadow-black/80">
          <div className="flex items-center gap-1.5 px-2.5 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          </div>
          <div className="rounded-lg overflow-hidden">
            <img src={src} alt={alt} className="w-full h-auto block" />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-6 bg-gradient-to-b from-[#111114] to-[#0a0a0c] border-x border-white/5" />
          <div className="w-28 h-2 bg-[#111114] rounded-b-lg border border-t-0 border-white/5" />
        </div>
      </div>
    </div>
  );
}

// ── Hero ──

function FluxHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <section ref={ref} className="relative overflow-hidden min-h-screen flex items-center">
      {/* Gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-[#09090b] to-fuchsia-950/40" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Animated grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <FloatingParticles />

      <motion.div
        className="relative mx-auto max-w-7xl px-6 pt-32 pb-20 grid md:grid-cols-2 gap-12 md:gap-16 items-center"
        style={{ opacity: smoothOpacity, y: smoothY }}
      >
        {/* Left — Text */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <FluxLogo size={40} className="text-violet-400" />
          </motion.div>
          <motion.h1
            className="mt-6 font-serif text-5xl sm:text-6xl md:text-5xl lg:text-7xl tracking-[-0.03em] leading-[0.9] uppercase font-bold italic"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">
              Voice chat
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-violet-300/80 bg-clip-text text-transparent">
              that&apos;s all
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              signal.
            </span>
          </motion.h1>
          <motion.p
            className="mt-6 text-base sm:text-lg text-violet-200/60 max-w-md leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Crystal-clear audio, lossless screen sharing, and encrypted messaging — in a desktop app lighter than a browser tab.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <a
              href="#download"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-violet-100 transition-all duration-200 shadow-lg shadow-white/10"
            >
              <Download size={14} />
              Download for Free
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/15 text-white/70 text-sm rounded-lg hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200 backdrop-blur-sm"
            >
              See Features
              <ArrowRight size={14} />
            </a>
          </motion.div>
        </div>

        {/* Right — Desktop mockup */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ perspective: 1200 }}
        >
          <DesktopFrame
            src="/flux/hero.png"
            alt="Flux desktop app showing music playback and YouTube search"
            glow="bg-violet-500/20"
          />
        </motion.div>
      </motion.div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
    </section>
  );
}

// ── Alternating Feature Showcase ──

function FeatureShowcase() {
  return (
    <section id="features" className="relative">
      {SHOWCASE_SECTIONS.map((section, i) => {
        const imageOnRight = i % 2 === 0;
        return (
          <div key={section.overline} className="relative overflow-hidden">
            {/* Section-specific gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-b ${section.gradient} pointer-events-none`} />

            <div className="relative mx-auto max-w-6xl px-6 py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Text */}
              <div className={imageOnRight ? "md:order-1" : "md:order-2"}>
                <ScrollReveal direction={imageOnRight ? "left" : "right"}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-4">{section.overline}</p>
                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-[-0.02em] leading-tight">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-foreground-muted leading-relaxed text-base sm:text-lg">
                    {section.description}
                  </p>
                </ScrollReveal>
              </div>
              {/* Screenshot */}
              <div className={imageOnRight ? "md:order-2" : "md:order-1"}>
                <ScrollReveal direction={imageOnRight ? "right" : "left"} delay={0.15}>
                  <DesktopFrame
                    src={section.image}
                    alt={section.imageAlt}
                    glow={i === 0 ? "bg-violet-500/15" : i === 1 ? "bg-cyan-500/15" : "bg-emerald-500/15"}
                  />
                </ScrollReveal>
              </div>
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
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-4">Features</p>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em]">
            Every detail, considered.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FLUX_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <StaggerItem key={feature.title}>
                <div className="group relative p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 transition-all duration-500 overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Icon size={18} className="text-violet-400" />
                    </div>
                    <h3 className="mt-4 font-serif text-lg">{feature.title}</h3>
                    <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                      {feature.description}
                    </p>
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
    <section className="py-32 px-6 border-t border-white/5">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-4">Technical Specifications</p>
              <h2 className="font-serif text-4xl tracking-[-0.02em]">Under the hood.</h2>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                Flux is built on a Rust backend with LiveKit WebRTC for media routing. The desktop app uses Tauri — no Electron, no bloat.
              </p>
            </ScrollReveal>

            <StaggerContainer className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4">
              {specs.map((spec) => (
                <StaggerItem key={spec.label}>
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-xs text-foreground-muted uppercase tracking-wider">{spec.label}</p>
                    <p className="mt-1 text-sm font-mono text-violet-200/80">{spec.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <div>
            <ScrollReveal delay={0.15}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-4">Screen Share Presets</p>
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">Preset</th>
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">Codec</th>
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">Bitrate</th>
                      <th className="text-left px-4 py-3 text-xs text-foreground-muted uppercase tracking-wider font-normal">FPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCREEN_SHARE_PRESETS.map((row) => (
                      <tr key={row.preset} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-mono text-violet-400">{row.preset}</td>
                        <td className="px-4 py-3 font-mono text-foreground-muted">{row.codec}</td>
                        <td className="px-4 py-3 font-mono text-foreground-muted">{row.bitrate}</td>
                        <td className="px-4 py-3 font-mono text-foreground-muted">{row.framerate}</td>
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
    <section id="download" className="relative py-40 px-6 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/30 to-violet-950/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none" />

      <FloatingParticles />

      <div className="relative mx-auto max-w-6xl text-center">
        <ScrollReveal>
          <FluxLogo size={48} className="mx-auto text-violet-400 mb-6" />
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-[-0.02em]">
            Ready when you are.
          </h2>
          <p className="mt-4 text-violet-200/50 max-w-md mx-auto text-lg">
            Native desktop app — no browser required, no Electron overhead.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-semibold rounded-lg hover:bg-violet-100 transition-all shadow-lg shadow-white/10"
            >
              <Apple size={16} />
              {ctaLabel}
            </button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 text-white/70 text-sm rounded-lg hover:text-white hover:border-white/30 hover:bg-white/5 transition-all backdrop-blur-sm"
            >
              <MonitorDot size={16} />
              {authState === "active" ? "Download for Windows" : ctaLabel}
            </button>
          </div>
          <p className="mt-4 text-xs text-white/30">
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
