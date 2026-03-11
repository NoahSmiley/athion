"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap,
  Download, Apple, MonitorDot, ArrowRight, Shield,
  Volume2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
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

const HERO_SLIDES = [
  { image: "/flux/hero.png", label: "Music & YouTube", caption: "Search and play music directly in voice channels" },
  { image: "/flux/voice.png", label: "Voice Chat", caption: "Crystal-clear 48kHz stereo with Krisp noise suppression" },
  { image: "/flux/screenshare.png", label: "Screen Share", caption: "Lossless VP9 up to 4K at 60fps" },
  { image: "/flux/chat.png", label: "Messaging", caption: "Encrypted text with reactions, mentions, and file sharing" },
];

const SHOWCASE_SECTIONS = [
  {
    title: "CRYSTAL-CLEAR VOICE.",
    subtitle: "Zero noise.",
    description: "48kHz stereo Opus audio with Krisp AI noise suppression. Keyboard clatter, fans, and background chatter vanish — your voice stays untouched.",
    image: "/flux/voice.png",
    imageAlt: "Flux voice channel with participants in a call",
    stats: [
      { value: "48kHz", label: "Sample Rate" },
      { value: "320kbps", label: "Bitrate" },
      { value: "Krisp AI", label: "Noise Filter" },
    ],
    accent: "from-violet-500/20 to-blue-500/10",
    iconAccent: "bg-violet-500/20 border-violet-500/20 text-violet-300",
    Icon: Volume2,
  },
  {
    title: "PIXEL-PERFECT STREAMING.",
    subtitle: "No compression.",
    description: "Lossless VP9 screen sharing up to 4K at 20 Mbps with six quality presets. Your IDE, your game, your design — every pixel, exactly as you see it.",
    image: "/flux/screenshare.png",
    imageAlt: "Flux lossless screen sharing at 1080p 60fps",
    stats: [
      { value: "4K", label: "Max Resolution" },
      { value: "60fps", label: "Frame Rate" },
      { value: "VP9", label: "Lossless Codec" },
    ],
    accent: "from-blue-500/20 to-cyan-500/10",
    iconAccent: "bg-blue-500/20 border-blue-500/20 text-blue-300",
    Icon: Monitor,
  },
  {
    title: "ENCRYPTED BY DEFAULT.",
    subtitle: "Not optional.",
    description: "Every message, every file, every reaction — encrypted end-to-end with AES-256-GCM before it leaves your device. We can't read your messages. Nobody can.",
    image: "/flux/chat.png",
    imageAlt: "Flux encrypted text chat with messages and reactions",
    stats: [
      { value: "AES-256", label: "Encryption" },
      { value: "ECDH", label: "Key Exchange" },
      { value: "E2EE", label: "Every Message" },
    ],
    accent: "from-emerald-500/20 to-teal-500/10",
    iconAccent: "bg-emerald-500/20 border-emerald-500/20 text-emerald-300",
    Icon: Shield,
  },
];

const iconMap = { AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap } as const;

// ── Twinkling Stars ──

function TwinklingStars({ density = 40 }: { density?: number }) {
  const stars = useRef(
    Array.from({ length: density }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 4,
      isCross: Math.random() > 0.6,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) =>
        star.isCross ? (
          <motion.svg
            key={i}
            className="absolute text-white/40"
            style={{ left: `${star.left}%`, top: `${star.top}%` }}
            width={star.size * 4}
            height={star.size * 4}
            viewBox="0 0 16 16"
            fill="currentColor"
            animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          >
            <path d="M8 0L9 7L16 8L9 9L8 16L7 9L0 8L7 7Z" />
          </motion.svg>
        ) : (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
            animate={{ opacity: [0, 0.7, 0], scale: [0.3, 1, 0.3] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          />
        )
      )}
    </div>
  );
}

// ── Scrolling Marquee ──

function Marquee() {
  const words = ["TALK", "LISTEN", "SHARE", "STREAM", "PLAY", "CONNECT"];
  const items = [...words, ...words, ...words];

  return (
    <div className="relative py-8 overflow-hidden bg-[#1a1040]/60 border-y border-white/5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {items.map((word, i) => (
          <span key={i} className="flex items-center gap-12">
            <span className="text-4xl sm:text-5xl font-bold uppercase italic font-serif text-white/90 tracking-wide">
              {word}
            </span>
            <FluxLogo size={28} className="text-white/30 flex-shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Desktop Frame with Animated Screenshot Carousel ──

function DesktopFrame({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
  }, []);

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [resetInterval]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    resetInterval();
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="relative">
        {/* Monitor bezel */}
        <div className="bg-[#0c0c10] rounded-2xl border border-white/10 p-2.5 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-1.5 px-2.5 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/70" />
          </div>
          {/* Screenshot carousel */}
          <div className="rounded-xl overflow-hidden relative aspect-[16/10] bg-[#0c0c10]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={HERO_SLIDES[activeIndex].image}
                alt={HERO_SLIDES[activeIndex].label}
                className="absolute inset-0 w-full h-full object-cover object-top"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Nav arrows */}
            <button
              onClick={() => goTo((activeIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all z-10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => goTo((activeIndex + 1) % HERO_SLIDES.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all z-10"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Monitor stand */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-5 bg-gradient-to-b from-[#0c0c10] to-[#080810] border-x border-white/5" />
          <div className="w-24 h-1.5 bg-[#0c0c10] rounded-b-lg border border-t-0 border-white/5" />
        </div>
      </div>

      {/* Slide indicator dots + caption */}
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === activeIndex
                  ? "w-8 h-2 bg-white/80"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={activeIndex}
            className="text-sm text-white/50 text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white/70 font-medium">{HERO_SLIDES[activeIndex].label}</span>
            {" — "}
            {HERO_SLIDES[activeIndex].caption}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Animated Stat ──

function AnimatedStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-white/40 mt-1">{label}</div>
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
    <section ref={ref} className="relative overflow-hidden min-h-screen flex items-center bg-[#2a1a6b]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3a2098] via-[#2d1a7a] to-[#1a1040]" />
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#5b3dc8]/30 rounded-full blur-[200px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/20 rounded-full blur-[180px]" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#a855f7]/15 rounded-full blur-[120px]" />

      <TwinklingStars density={50} />

      <motion.div
        className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center"
        style={{ opacity: smoothOpacity, y: smoothY }}
      >
        {/* Left — Text */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <FluxLogo size={44} className="text-white/80" />
          </motion.div>
          <motion.h1
            className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl tracking-[-0.02em] leading-[0.9] uppercase font-bold italic text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Voice chat
            <br />
            that&apos;s all
            <br />
            signal.
          </motion.h1>
          <motion.p
            className="mt-6 text-base sm:text-lg text-white/60 max-w-md leading-relaxed"
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
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#2a1a6b] text-sm font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg shadow-black/20"
            >
              <Download size={14} />
              Download for Free
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white/80 text-sm rounded-full hover:text-white hover:border-white/40 hover:bg-white/5 transition-all backdrop-blur-sm"
            >
              See Features
              <ArrowRight size={14} />
            </a>
          </motion.div>

          {/* Quick stats row */}
          <motion.div
            className="mt-12 flex gap-8 sm:gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <AnimatedStat value="48MB" label="Memory" />
            <AnimatedStat value="<45ms" label="Latency" />
            <AnimatedStat value="320kbps" label="Audio" />
          </motion.div>
        </div>

        {/* Right — Desktop mockup with carousel */}
        <motion.div
          className="group"
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <DesktopFrame />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#1a1040] to-transparent" />
    </section>
  );
}

// ── Feature Showcase (rich sections with stats + animated screenshots) ──

function FeatureShowcase() {
  return (
    <section id="features" className="relative bg-[#1a1040] overflow-hidden">
      <TwinklingStars density={25} />

      {SHOWCASE_SECTIONS.map((section, i) => {
        const imageOnRight = i % 2 === 0;
        return (
          <div key={section.title} className="relative mx-auto max-w-6xl px-6 py-12 md:py-20">
            <ScrollReveal>
              <div className={`rounded-3xl bg-gradient-to-br ${section.accent} border border-white/[0.08] backdrop-blur-sm overflow-hidden`}>
                <div className="p-8 sm:p-12 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                  {/* Text side */}
                  <div className={`relative ${imageOnRight ? "md:order-1" : "md:order-2"}`}>
                    <div className={`w-12 h-12 rounded-2xl ${section.iconAccent} border flex items-center justify-center mb-6`}>
                      <section.Icon size={22} />
                    </div>
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-[-0.01em] leading-[0.95] uppercase font-bold italic text-white">
                      {section.title}
                      <br />
                      <span className="text-white/40">{section.subtitle}</span>
                    </h2>
                    <p className="mt-5 text-white/50 leading-relaxed text-sm sm:text-base">
                      {section.description}
                    </p>

                    {/* Stats row */}
                    <div className="mt-8 flex gap-6 sm:gap-8">
                      {section.stats.map((stat) => (
                        <div key={stat.label}>
                          <div className="text-lg sm:text-xl font-bold font-mono text-white">{stat.value}</div>
                          <div className="text-[10px] uppercase tracking-widest text-white/35 mt-0.5">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot side with floating glow */}
                  <div className={`relative ${imageOnRight ? "md:order-2" : "md:order-1"}`}>
                    <div className="relative group">
                      {/* Glow behind screenshot */}
                      <div className="absolute -inset-4 bg-violet-500/10 rounded-3xl blur-2xl group-hover:bg-violet-500/15 transition-all duration-700" />
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                        <img src={section.image} alt={section.imageAlt} className="w-full h-auto block" />
                        {/* Subtle animated scan line */}
                        <motion.div
                          className="absolute inset-x-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent"
                          animate={{ y: ["-100%", "200%"] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
                          style={{ height: "30%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        );
      })}
    </section>
  );
}

// ── Marquee Section ──

function MarqueeSection() {
  return (
    <div className="relative bg-[#1a1040]">
      <Marquee />
    </div>
  );
}

// ── Feature Grid ──

function FeatureGrid() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-[#1a1040] to-[#09090b]">
      <TwinklingStars density={20} />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] text-center uppercase font-bold italic text-white">
            Every detail, considered.
          </h2>
          <p className="mt-4 text-white/40 text-center max-w-lg mx-auto">
            Six pillars that make Flux different.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FLUX_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <StaggerItem key={feature.title}>
                <div className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center border border-violet-500/10">
                      <Icon size={18} className="text-violet-300" />
                    </div>
                    <h3 className="mt-4 font-semibold text-white/90">{feature.title}</h3>
                    <p className="mt-2 text-sm text-white/40 leading-relaxed">
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
    <section id="download" className="relative py-40 px-6 overflow-hidden bg-gradient-to-b from-[#09090b] via-[#1a1040] to-[#2a1a6b]">
      <TwinklingStars density={50} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-600/15 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl text-center">
        <ScrollReveal>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.02em] uppercase font-bold italic text-white">
            Ready to switch?
            <br />
            <span className="text-white/50">Better go chat.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="mt-6 text-white/40 max-w-md mx-auto">
            Join the voice chat that doesn&apos;t spy on you, doesn&apos;t eat your RAM, and sounds like you&apos;re in the same room.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2a1a6b] text-sm font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg shadow-black/20"
            >
              <Apple size={16} />
              {ctaLabel}
            </button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white/80 text-sm rounded-full hover:text-white hover:border-white/40 hover:bg-white/5 transition-all backdrop-blur-sm"
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
      <MarqueeSection />
      <FeatureGrid />
      <FluxBenchmarks />
      <TechSpecs />
      <DownloadCTA />
    </PageTransition>
  );
}
