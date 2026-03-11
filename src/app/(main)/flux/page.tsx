"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap,
  Download, Apple, MonitorDot, ArrowRight, Volume2, Mic, MicOff as MicOffIcon,
  Headphones, HeadphoneOff, MonitorUp, PhoneOff, Pause, SkipForward,
  Hash, Search, Paperclip, Smile, Send, ChevronDown, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

// ── Chat Replica Data ──

const CHAT_CHANNELS = [
  { name: "general", active: true },
  { name: "dev", active: false },
  { name: "music", active: false },
  { name: "off-topic", active: false },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    user: "noah",
    avatar: "N",
    color: "#6366f1",
    time: "2:14 PM",
    text: "just pushed the new voice engine. latency is down to 38ms",
  },
  {
    id: 2,
    user: "alex",
    avatar: "A",
    color: "#0ea5e9",
    time: "2:15 PM",
    text: "no way, that's insane. testing now",
  },
  {
    id: 3,
    user: "sarah",
    avatar: "S",
    color: "#8b5cf6",
    time: "2:16 PM",
    text: "the noise suppression update is live too. keyboard sounds are completely gone",
  },
  {
    id: 4,
    user: "james",
    avatar: "J",
    color: "#f59e0b",
    time: "2:18 PM",
    text: "screen share looks crisp at 4K. huge improvement over last week",
  },
];

const EXTRA_MESSAGES = [
  { user: "alex", avatar: "A", color: "#0ea5e9", text: "anyone want to test the new update?" },
  { user: "noah", avatar: "N", color: "#6366f1", text: "the latency improvement is wild" },
  { user: "sarah", avatar: "S", color: "#8b5cf6", text: "just ran a voice test — zero crackling" },
  { user: "james", avatar: "J", color: "#f59e0b", text: "the new codec sounds way better on bluetooth" },
  { user: "alex", avatar: "A", color: "#0ea5e9", text: "screen share is buttery smooth now" },
  { user: "noah", avatar: "N", color: "#6366f1", text: "pushed a fix for the reconnect issue" },
];

// ── Voice Replica Data ──

const VOICE_PARTICIPANTS = [
  { id: "N", name: "noah", color: "#6366f1", muted: false, deafened: false },
  { id: "A", name: "alex", color: "#0ea5e9", muted: false, deafened: false },
  { id: "S", name: "sarah", color: "#8b5cf6", muted: true, deafened: false },
  { id: "J", name: "james", color: "#f59e0b", muted: false, deafened: true },
];

const EMMA_USER = { id: "E", name: "emma", color: "#10b981", muted: false, deafened: false };

const VOICE_TABS = [
  { label: "Voice", active: true },
  { label: "Streams", active: false },
  { label: "Music", active: false },
  { label: "Sounds", active: false },
];

// ── Music Replica Data ──

const ALL_TRACKS = [
  { title: "Midnight City", artist: "M83", duration: "4:03", totalSeconds: 243, gradientFrom: "#6366f1", gradientTo: "#8b5cf6" },
  { title: "Do I Wanna Know?", artist: "Arctic Monkeys", duration: "4:32", totalSeconds: 272, gradientFrom: "#0ea5e9", gradientTo: "#6366f1" },
  { title: "Electric Feel", artist: "MGMT", duration: "3:50", totalSeconds: 230, gradientFrom: "#f59e0b", gradientTo: "#f97316" },
  { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", totalSeconds: 200, gradientFrom: "#ef4444", gradientTo: "#f97316" },
  { title: "Take On Me", artist: "a-ha", duration: "3:48", totalSeconds: 228, gradientFrom: "#8b5cf6", gradientTo: "#ec4899" },
];

// ── Typing Indicator ──

function TypingIndicator({ user }: { user: string }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      <span style={{ fontSize: "12px", color: "#888" }}>
        {user} is typing
      </span>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 4, height: 4, background: "#888" }}
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── FluxChatReplica ──

function FluxChatReplica() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const nextMsgIdx = useRef(0);
  const nextId = useRef(5);

  // Staggered entrance on mount
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    INITIAL_MESSAGES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount((c) => c + 1), 300 * (i + 1)));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // New messages arriving every ~5s
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        const extra = EXTRA_MESSAGES[nextMsgIdx.current % EXTRA_MESSAGES.length];

        // Show typing indicator
        setTypingUser(extra.user);

        setTimeout(() => {
          setTypingUser(null);
          const now = new Date();
          const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          const newMsg = {
            id: nextId.current++,
            user: extra.user,
            avatar: extra.avatar,
            color: extra.color,
            time: timeStr,
            text: extra.text,
          };
          setMessages((prev) => {
            const next = [...prev, newMsg];
            // Keep max 6 messages visible
            if (next.length > 6) return next.slice(next.length - 6);
            return next;
          });
          setVisibleCount((c) => Math.min(c + 1, 6));
          nextMsgIdx.current++;
        }, 2000);
      }, 5000);

      return () => clearInterval(interval);
    }, INITIAL_MESSAGES.length * 300 + 2000);

    return () => clearTimeout(initialDelay);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[800px] mx-auto h-[380px] md:h-[480px]"
      style={{
        background: "#0a0a0a",
        border: "1px solid #161616",
      }}
    >
      <div className="flex h-full">
        {/* Sidebar — hidden on mobile */}
        <div
          className="flex-shrink-0 flex-col hidden md:flex"
          style={{
            width: "240px",
            background: "#0e0e0e",
            borderRight: "1px solid #161616",
          }}
        >
          {/* Server header */}
          <div
            className="flex items-center justify-between px-4"
            style={{
              height: "48px",
              borderBottom: "1px solid #161616",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#e8e8e8",
              }}
            >
              Flux
            </span>
            <ChevronDown size={14} style={{ color: "#555" }} />
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-hidden px-2 pt-4">
            {/* Text channels category */}
            <div className="flex items-center gap-1 px-2 mb-1">
              <ChevronDown size={10} style={{ color: "#555" }} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#555",
                }}
              >
                Text Channels
              </span>
            </div>
            {CHAT_CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className="flex items-center gap-2 px-2 py-1.5 rounded"
                style={{
                  background: ch.active ? "rgba(255,255,255,0.06)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <Hash size={14} style={{ color: ch.active ? "#e8e8e8" : "#555" }} />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: ch.active ? 500 : 400,
                    color: ch.active ? "#e8e8e8" : "#888",
                  }}
                >
                  {ch.name}
                </span>
              </div>
            ))}

            {/* Voice channels category */}
            <div className="flex items-center gap-1 px-2 mb-1 mt-4">
              <ChevronRight size={10} style={{ color: "#555" }} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#555",
                }}
              >
                Voice Channels
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded">
              <Volume2 size={14} style={{ color: "#888" }} />
              <span style={{ fontSize: "14px", color: "#888" }}>Room 1</span>
            </div>
            {/* Voice participants */}
            <div className="pl-7 flex flex-col gap-1 mt-0.5">
              {VOICE_PARTICIPANTS.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: p.color + "33",
                      fontSize: "9px",
                      fontWeight: 600,
                      color: p.color,
                    }}
                  >
                    {p.id}
                  </div>
                  <span style={{ fontSize: "12px", color: "#888" }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div
            className="flex items-center justify-between px-4 flex-shrink-0"
            style={{
              height: "48px",
              borderBottom: "1px solid #161616",
            }}
          >
            <div className="flex items-center gap-2">
              <Hash size={16} style={{ color: "#555" }} />
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#e8e8e8" }}>
                general
              </span>
            </div>
            <Search size={16} style={{ color: "#555" }} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden px-4 py-3 flex flex-col gap-1 justify-end">
            <AnimatePresence mode="popLayout">
              {messages.slice(0, visibleCount).map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex gap-3 py-2 px-2 rounded"
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: msg.color + "22",
                      border: `2px solid ${msg.color}`,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: msg.color,
                    }}
                  >
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#e8e8e8" }}>
                        {msg.user}
                      </span>
                      <span style={{ fontSize: "11px", color: "#555" }}>
                        {msg.time}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#e8e8e8", lineHeight: 1.45, marginTop: "2px" }}>
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Message input / typing indicator */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div className="h-5 mb-1">
              <AnimatePresence>
                {typingUser && <TypingIndicator user={typingUser} />}
              </AnimatePresence>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
              style={{
                background: "#0e0e0e",
                border: "1px solid #161616",
              }}
            >
              <Paperclip size={18} style={{ color: "#555", flexShrink: 0 }} />
              <span
                className="flex-1"
                style={{ fontSize: "14px", color: "#555" }}
              >
                Message #general
              </span>
              <Smile size={18} style={{ color: "#555", flexShrink: 0 }} />
              <Send size={18} style={{ color: "#555", flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Waveform Bars (mini equalizer) ──

function WaveformBars() {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 12 }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="rounded-sm"
          style={{ width: 2, background: "#43b581" }}
          animate={{
            height: [3, 8 + Math.random() * 4, 4, 10 + Math.random() * 2, 3],
          }}
          transition={{
            duration: 0.8 + i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// ── FluxVoiceReplica ──

function SpeakingGlow() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl"
      style={{
        boxShadow: `0 0 0 2px #43b581, 0 0 12px rgba(67,181,129,0.4)`,
        background: "rgba(67,181,129,0.06)",
      }}
      animate={{
        opacity: [1, 0.5, 1],
        boxShadow: [
          "0 0 0 2px #43b581, 0 0 12px rgba(67,181,129,0.4)",
          "0 0 0 2px #43b581, 0 0 20px rgba(67,181,129,0.6)",
          "0 0 0 2px #43b581, 0 0 12px rgba(67,181,129,0.4)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function FluxVoiceReplica() {
  const [speakingSet, setSpeakingSet] = useState<Set<string>>(new Set(["N", "A"]));
  const [emmaPresent, setEmmaPresent] = useState(false);

  // Toggle speaking states every ~3s
  useEffect(() => {
    const allIds = ["N", "A", "S", "J"];
    const interval = setInterval(() => {
      // Randomly pick 1-2 speakers
      const shuffled = [...allIds].sort(() => Math.random() - 0.5);
      const count = Math.random() > 0.5 ? 2 : 1;
      setSpeakingSet(new Set(shuffled.slice(0, count)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Emma join/leave cycle
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const cycle = () => {
      // Emma joins
      setEmmaPresent(true);
      timeout = setTimeout(() => {
        // Emma leaves after 4s
        setEmmaPresent(false);
        timeout = setTimeout(cycle, 6000);
      }, 4000);
    };
    timeout = setTimeout(cycle, 6000);
    return () => clearTimeout(timeout);
  }, []);

  const participants = emmaPresent
    ? [...VOICE_PARTICIPANTS, EMMA_USER]
    : VOICE_PARTICIPANTS;

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[620px] mx-auto"
      style={{
        background: "#0a0a0a",
        border: "1px solid #161616",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-0 px-4"
        style={{ borderBottom: "1px solid #161616" }}
      >
        {VOICE_TABS.map((tab) => (
          <div
            key={tab.label}
            className="relative px-3 py-3 cursor-pointer"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: tab.active ? "#e8e8e8" : "#555",
            }}
          >
            {tab.label}
            {tab.active && (
              <div
                className="absolute bottom-0 left-3 right-3"
                style={{
                  height: "2px",
                  background: "#e8e8e8",
                  borderRadius: "1px",
                }}
              />
            )}
          </div>
        ))}
        {/* Participant count */}
        <div className="ml-auto flex items-center gap-1.5 pr-1">
          <div
            className="rounded-full"
            style={{ width: 6, height: 6, background: "#43b581" }}
          />
          <span style={{ fontSize: "12px", color: "#888", fontFamily: "monospace" }}>
            {participants.length}
          </span>
        </div>
      </div>

      {/* Participant grid */}
      <div
        className="flex flex-wrap justify-center gap-5 p-6"
        style={{ minHeight: "200px" }}
      >
        <AnimatePresence mode="popLayout">
          {participants.map((p) => {
            const isSpeaking = speakingSet.has(p.id);
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="relative flex flex-col items-center rounded-xl"
                style={{
                  width: "140px",
                  background: "#0e0e0e",
                  padding: "16px 12px 12px",
                }}
              >
                {/* Speaking glow on tile */}
                {isSpeaking && <SpeakingGlow />}

                {/* Avatar */}
                <motion.div
                  className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center mb-2"
                  style={{
                    background: p.color + "22",
                    border: isSpeaking ? `3px solid ${p.color}` : `3px solid ${p.color}44`,
                    fontSize: "28px",
                    fontWeight: 600,
                    color: p.color,
                  }}
                  animate={isSpeaking ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={isSpeaking ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                >
                  {p.id}
                </motion.div>

                {/* Username + waveform */}
                <div className="flex items-center gap-1.5" style={{ position: "relative", zIndex: 1 }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#e8e8e8",
                    }}
                  >
                    {p.name}
                  </span>
                  {isSpeaking && <WaveformBars />}
                </div>

                {/* Status icons */}
                <div className="flex items-center gap-1.5 mt-1.5" style={{ position: "relative", zIndex: 1 }}>
                  {p.muted && (
                    <MicOffIcon size={14} style={{ color: "#555" }} />
                  )}
                  {p.deafened && (
                    <HeadphoneOff size={14} style={{ color: "#555" }} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls bar */}
      <div
        className="flex items-center justify-center gap-1 px-4 py-2.5"
        style={{ borderTop: "1px solid #161616" }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: "36px", height: "36px", background: "#1a1a1a" }}
        >
          <Mic size={20} style={{ color: "#e8e8e8" }} />
        </div>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: "36px", height: "36px", background: "#1a1a1a" }}
        >
          <Headphones size={20} style={{ color: "#e8e8e8" }} />
        </div>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: "36px", height: "36px", background: "#1a1a1a" }}
        >
          <MonitorUp size={20} style={{ color: "#e8e8e8" }} />
        </div>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: "36px", height: "36px", background: "#ff4444" }}
        >
          <PhoneOff size={20} style={{ color: "#ffffff" }} />
        </div>
      </div>
    </div>
  );
}

// ── FluxMusicReplica ──

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function FluxMusicReplica() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0.62); // start at 62%
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrack = ALL_TRACKS[trackIndex % ALL_TRACKS.length];
  const queueTracks = [
    ALL_TRACKS[(trackIndex + 1) % ALL_TRACKS.length],
    ALL_TRACKS[(trackIndex + 2) % ALL_TRACKS.length],
  ];

  const currentSeconds = Math.floor(progress * currentTrack.totalSeconds);

  // Progress bar crawling
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = 1 / (currentTrack.totalSeconds * 3.33); // ~30s from 62% to 100%
        const next = prev + increment;
        if (next >= 1) {
          // Track ended — advance
          setTransitioning(true);
          setTimeout(() => {
            setTrackIndex((i) => i + 1);
            setProgress(0);
            setTransitioning(false);
          }, 600);
          return 1;
        }
        return next;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trackIndex, currentTrack.totalSeconds]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[420px] mx-auto"
      style={{
        background: "#0a0a0a",
        border: "1px solid #161616",
        position: "relative",
      }}
    >
      {/* Blurred backdrop gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at 50% 30%, ${currentTrack.gradientFrom}18, transparent 70%)`,
        }}
        transition={{ duration: 0.6 }}
        style={{ filter: "blur(40px)" }}
      />

      {/* Vinyl + track info */}
      <div className="relative flex flex-col items-center pt-8 pb-4 px-6">
        {/* Spinning vinyl disc */}
        <div className="relative mb-6">
          <motion.div
            className="relative rounded-full"
            style={{
              width: "260px",
              height: "260px",
              background: `
                repeating-radial-gradient(
                  circle at center,
                  #111 0px,
                  #111 2px,
                  #1a1a1a 2px,
                  #1a1a1a 4px
                )
              `,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            {/* Center album art */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "42%",
                height: "42%",
                top: "29%",
                left: "29%",
              }}
              animate={{
                background: `linear-gradient(135deg, ${currentTrack.gradientFrom}, ${currentTrack.gradientTo})`,
                boxShadow: `0 0 20px ${currentTrack.gradientFrom}44`,
              }}
              transition={{ duration: 0.6 }}
            />
            {/* Center hole */}
            <div
              className="absolute rounded-full"
              style={{
                width: "8%",
                height: "8%",
                top: "46%",
                left: "46%",
                background: "#0a0a0a",
              }}
            />
          </motion.div>
        </div>

        {/* Track info */}
        <div className="text-center mb-4 h-[52px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={trackIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#ffffff",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {currentTrack.title}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.7)",
                  marginTop: "4px",
                }}
              >
                {currentTrack.artist}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-4">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{
              height: "5px",
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#ffffff" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#888" }}>
              {formatTime(currentSeconds)}
            </span>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#888" }}>
              {currentTrack.duration}
            </span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: "34px", height: "34px" }}
          >
            <SkipForward size={18} style={{ color: "#e8e8e8", transform: "scaleX(-1)" }} />
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: "34px",
              height: "34px",
              background: "#e8e8e8",
            }}
          >
            <Pause size={16} style={{ color: "#0a0a0a" }} />
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: "34px", height: "34px" }}
          >
            <SkipForward size={18} style={{ color: "#e8e8e8" }} />
          </div>
        </div>
      </div>

      {/* Queue */}
      <div
        className="relative"
        style={{ borderTop: "1px solid #161616" }}
      >
        <div className="px-4 py-2">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#888",
            }}
          >
            Queue
          </span>
        </div>
        <AnimatePresence mode="popLayout">
          {queueTracks.map((track, i) => (
            <motion.div
              key={`${track.title}-${trackIndex}-${i}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-2"
              style={{ borderTop: "1px solid #16161666" }}
            >
              <motion.div
                className="rounded flex-shrink-0"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "4px",
                }}
                animate={{
                  background: `linear-gradient(135deg, ${track.gradientFrom}, ${track.gradientTo})`,
                }}
                transition={{ duration: 0.4 }}
              />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#e8e8e8" }}>
                  {track.title}
                </p>
                <p style={{ fontSize: "11px", color: "#888" }}>
                  {track.artist}
                </p>
              </div>
              <span style={{ fontSize: "11px", color: "#555", flexShrink: 0 }}>
                {track.duration}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Krisp Logo ──

function KrispLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12c1.5-3 3-5 4.5-5s2.5 2 4 2 2.5-4 4-4 2.5 3 4 3 2-2 3.5-2"
        stroke="#43b581"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M2 16c1.5-2 3-3.5 4.5-3.5s2.5 1.5 4 1.5 2.5-3 4-3 2.5 2 4 2 2-1.5 3.5-1.5"
        stroke="#43b581"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

// ── Hero ──

function FluxHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-6 px-6">
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-4"
        >
          <FluxLogo size={48} />
        </motion.div>

        <motion.h1
          className="text-[clamp(2.75rem,7vw,5.5rem)] font-medium tracking-[-0.025em] leading-[1.08]"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <span className="text-foreground">Flux</span>
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-foreground-muted"
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeUp}
        >
          Private voice chat, built for performance.
        </motion.p>

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

        <ScrollReveal>
          <FluxChatReplica />
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

        {/* Powered by Krisp badge */}
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-8">
            <KrispLogo size={20} />
            <span className="text-xs text-foreground-muted">Powered by Krisp</span>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <FluxVoiceReplica />
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
          <FluxMusicReplica />
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
