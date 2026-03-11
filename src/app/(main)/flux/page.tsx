"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap,
  Download, Apple, MonitorDot, ArrowRight, Volume2, Mic, MicOff as MicOffIcon,
  Headphones, MonitorUp, PhoneOff, Play, Pause, SkipForward, Music2,
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

// ── Voice Room Component ──

const PARTICIPANTS = [
  { id: "N", name: "noah", color: "#6366f1", speaking: true, muted: false, deafened: false },
  { id: "A", name: "alex", color: "#0ea5e9", speaking: true, muted: false, deafened: false },
  { id: "S", name: "sarah", color: "#8b5cf6", speaking: false, muted: true, deafened: false },
  { id: "J", name: "james", color: "#f59e0b", speaking: false, muted: false, deafened: true },
];

function SpeakingRing({ color }: { color: string }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `2px solid ${color}` }}
        animate={{ opacity: [0.8, 0.3, 0.8], scale: [1, 1.12, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${color}`, margin: "-6px" }}
        animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.18, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
    </>
  );
}

function VoiceRoomVisualization() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[480px] mx-auto"
      style={{ background: "#131316", border: "1px solid #1c1c20" }}
    >
      {/* Room header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #1c1c20" }}
      >
        <div className="flex items-center gap-2">
          <Volume2 size={14} style={{ color: "#22c55e" }} />
          <span className="text-sm font-medium" style={{ color: "#ededef" }}>Room 1</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "#1c1c20", color: "#7e7e86" }}
          >
            4 connected
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
          <span className="text-[11px]" style={{ color: "#7e7e86" }}>live</span>
        </div>
      </div>

      {/* Participant grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {PARTICIPANTS.map((p) => (
          <div
            key={p.id}
            className="relative flex flex-col items-center gap-2 rounded-lg py-5 px-3"
            style={{ background: "#0d0d0f", border: "1px solid #1c1c20" }}
          >
            {/* Speaking ring */}
            {p.speaking && (
              <div className="relative flex items-center justify-center">
                <div className="relative w-12 h-12">
                  <SpeakingRing color={p.color} />
                  <div
                    className="relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold z-10"
                    style={{ background: p.color + "22", color: p.color, border: `2px solid ${p.color}` }}
                  >
                    {p.id}
                  </div>
                </div>
              </div>
            )}

            {/* Non-speaking avatar */}
            {!p.speaking && (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ background: p.color + "22", color: p.color, border: `2px solid ${p.color}33` }}
              >
                {p.id}
              </div>
            )}

            <span className="text-[12px]" style={{ color: "#7e7e86" }}>{p.name}</span>

            {/* Status icons */}
            <div className="flex items-center gap-1.5">
              {p.muted && (
                <div
                  className="flex items-center justify-center w-5 h-5 rounded-full"
                  style={{ background: "#ef444422" }}
                >
                  <MicOffIcon size={10} style={{ color: "#ef4444" }} />
                </div>
              )}
              {p.deafened && (
                <div
                  className="flex items-center justify-center w-5 h-5 rounded-full"
                  style={{ background: "#f59e0b22" }}
                >
                  <Headphones size={10} style={{ color: "#f59e0b" }} />
                </div>
              )}
              {!p.muted && !p.deafened && p.speaking && (
                <div
                  className="flex items-center justify-center w-5 h-5 rounded-full"
                  style={{ background: "#22c55e22" }}
                >
                  <Mic size={10} style={{ color: "#22c55e" }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Voice controls bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: "1px solid #1c1c20" }}
      >
        <div className="flex items-center gap-1.5">
          {/* Mic toggle */}
          <button
            onClick={() => setIsMicOn((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
            style={{
              background: isMicOn ? "#1c1c20" : "#ef444422",
              border: "1px solid #2a2a30",
            }}
            title={isMicOn ? "Mute" : "Unmute"}
          >
            {isMicOn
              ? <Mic size={13} style={{ color: "#ededef" }} />
              : <MicOffIcon size={13} style={{ color: "#ef4444" }} />
            }
          </button>

          {/* Deafen toggle */}
          <button
            onClick={() => setIsDeafened((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
            style={{
              background: isDeafened ? "#f59e0b22" : "#1c1c20",
              border: "1px solid #2a2a30",
            }}
            title={isDeafened ? "Undeafen" : "Deafen"}
          >
            <Headphones size={13} style={{ color: isDeafened ? "#f59e0b" : "#7e7e86" }} />
          </button>

          {/* Screen share */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
            style={{ background: "#1c1c20", border: "1px solid #2a2a30" }}
            title="Share screen"
          >
            <MonitorUp size={13} style={{ color: "#7e7e86" }} />
          </button>
        </div>

        {/* Disconnect */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-opacity hover:opacity-90"
          style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444433" }}
          title="Disconnect"
        >
          <PhoneOff size={11} />
          Leave
        </button>
      </div>
    </div>
  );
}

// ── Music Player Component ──

const QUEUE = [
  { title: "Midnight City", artist: "M83", duration: "4:03", gradientFrom: "#6366f1", gradientTo: "#8b5cf6" },
  { title: "Do I Wanna Know?", artist: "Arctic Monkeys", duration: "4:32", gradientFrom: "#0ea5e9", gradientTo: "#6366f1" },
  { title: "Electric Feel", artist: "MGMT", duration: "3:50", gradientFrom: "#f59e0b", gradientTo: "#f97316" },
];

function MusicPlayerVisualization() {
  const [isPlaying, setIsPlaying] = useState(true);
  const currentTrack = QUEUE[0];

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[340px]"
      style={{ background: "#131316", border: "1px solid #1c1c20" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid #1c1c20" }}
      >
        <Music2 size={13} style={{ color: "#7e7e86" }} />
        <span className="text-[12px] font-medium" style={{ color: "#7e7e86" }}>Now Playing</span>
      </div>

      {/* Current track */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          {/* Album art */}
          <div
            className="w-12 h-12 rounded-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${currentTrack.gradientFrom}, ${currentTrack.gradientTo})`,
              boxShadow: `0 4px 20px ${currentTrack.gradientFrom}44`,
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#ededef" }}>
              {currentTrack.title}
            </p>
            <p className="text-[12px] truncate mt-0.5" style={{ color: "#7e7e86" }}>
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ background: "#1c1c20" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
              initial={{ width: "0%" }}
              animate={{ width: isPlaying ? "62%" : "62%" }}
              transition={{ duration: 0 }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: "#7e7e86" }}>2:30</span>
            <span className="text-[10px]" style={{ color: "#7e7e86" }}>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
            style={{ color: "#7e7e86" }}
          >
            <SkipForward size={14} style={{ transform: "scaleX(-1)" }} />
          </button>

          <button
            onClick={() => setIsPlaying((v) => !v)}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-90"
            style={{ background: "#ededef" }}
          >
            {isPlaying
              ? <Pause size={14} style={{ color: "#09090b" }} />
              : <Play size={14} style={{ color: "#09090b", marginLeft: "1px" }} />
            }
          </button>

          <button
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
            style={{ color: "#7e7e86" }}
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>

      {/* Queue */}
      <div style={{ borderTop: "1px solid #1c1c20" }}>
        <div className="px-4 py-2">
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "#7e7e86" }}>
            Up Next
          </span>
        </div>
        {QUEUE.slice(1).map((track, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2 transition-colors"
            style={{ borderTop: "1px solid #1c1c2066" }}
          >
            <div
              className="w-7 h-7 rounded flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${track.gradientFrom}, ${track.gradientTo})` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: "#ededef" }}>
                {track.title}
              </p>
              <p className="text-[11px] truncate" style={{ color: "#7e7e86" }}>
                {track.artist}
              </p>
            </div>
            <span className="text-[11px] flex-shrink-0" style={{ color: "#7e7e86" }}>
              {track.duration}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hero ──

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
          className="text-[clamp(2.75rem,7vw,5.5rem)] font-medium tracking-[-0.025em] leading-[1.08]"
          style={{ textWrap: "balance" } as React.CSSProperties}
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
          <div className="relative overflow-hidden">
            <img
              src="/flux/hero.png"
              alt="Flux — Desktop chat application with voice, messaging, and screen sharing"
              className="w-full h-auto block"
            />
            {/* Bottom gradient mask — fade into background */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
            {/* Left gradient mask */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            {/* Right gradient mask */}
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
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
          <span className="text-sm font-mono text-foreground-muted/30">{number}</span>
          <span className="text-sm text-foreground-muted/60">{label}</span>
          <ArrowRight size={14} className="text-foreground-muted/40" />
        </div>
      </ScrollReveal>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
        <ScrollReveal>
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-medium tracking-[-0.025em] leading-[1.12] text-foreground whitespace-pre-line">
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
            <span className="text-sm font-mono text-foreground-muted/30">{sf.number}</span>
            <span className="text-sm text-foreground-muted/60">{sf.label}</span>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}

// ── 1.0 Messaging ──

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
            {/* Message area — gradient mask edges */}
            <div className="relative overflow-hidden">
              <img
                src="/flux/chat.png"
                alt="Flux encrypted conversation in #general"
                className="w-full h-auto block"
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>

            {/* Channel sidebar — floating offset card with gradient mask */}
            <div className="absolute -left-4 sm:-left-8 top-8 sm:top-12 w-[140px] sm:w-[180px] overflow-hidden shadow-2xl">
              <img
                src="/flux/sidebar.png"
                alt="Flux channel sidebar"
                className="w-full h-auto block"
                style={{ maxHeight: "400px", objectFit: "cover", objectPosition: "top" }}
              />
              {/* Gradient masks on sidebar card */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
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

        <ScrollReveal>
          <div className="flex justify-center">
            <VoiceRoomVisualization />
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

// ── 3.0 Music ──

function MusicSection() {
  return (
    <section className="py-24 sm:py-32 px-6 border-t border-border/50">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          number="3.0"
          label="Music"
          title={"Shared listening.\nSoundtrack your team."}
          description="Listen together in real time. Queue tracks, skip, and control playback collectively — without leaving your voice channel. Everyone hears the same beat, in perfect sync."
        />

        <ScrollReveal>
          <div className="flex justify-center">
            <MusicPlayerVisualization />
          </div>
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "3.1", label: "Synchronized playback" },
            { number: "3.2", label: "Shared queue" },
            { number: "3.3", label: "In-channel controls" },
            { number: "3.4", label: "High-fidelity audio" },
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
      <MusicSection />
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
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-medium tracking-[-0.025em] leading-[1.12] max-w-2xl">
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
              <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-medium tracking-[-0.025em] leading-[1.12]">
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
          <h2 className="text-[clamp(2.75rem,5vw,4.5rem)] font-medium tracking-[-0.025em] leading-[1.1]">
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
