"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AudioWaveform, Lock, Monitor, MicOff, MessageSquare, Zap,
  Download, Apple, MonitorDot, ArrowRight, Volume2, Mic, MicOff as MicOffIcon,
  Headphones, HeadphoneOff, MonitorUp, PhoneOff, Pause, SkipForward,
  Search, Paperclip, Smile, Send, ChevronDown, ChevronRight,
  Settings, Map,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import { FluxLogo } from "@/components/flux-logo";

import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";
import { FLUX_FEATURES, SCREEN_SHARE_PRESETS } from "@/lib/constants";
import { FluxAppMock } from "@/components/home/flux-mock";

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

// ── OS detection for download buttons ──

function useDetectedPlatform() {
  const [platform, setPlatform] = useState<"windows" | "mac" | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) setPlatform("mac");
    else setPlatform("windows"); // default to Windows
  }, []);

  return platform;
}

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
};

// ── Channel icon (chat bubble, not hashtag) ──

function ChannelIcon({ size = 14, color = "#52525b" }: { size?: number; color?: string }) {
  return (
    <MessageSquare size={size} style={{ color }} />
  );
}

// ── Shared sidebar data ──

const SIDEBAR_CHANNELS = [
  { name: "general", active: true },
  { name: "dev", active: false },
  { name: "music", active: false },
  { name: "off-topic", active: false },
];

const USERS = {
  noah: { id: "N", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Noah&top=shortCurly&clothing=hoodie&clothesColor=6366f1&skinColor=f8d25c", color: "#6366f1" },
  trevor: { id: "T", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Trevor&top=shortFlat&facialHair=beardLight&clothing=blazerAndShirt&skinColor=edb98a", color: "#8b5cf6" },
  riley: { id: "R", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Riley&top=shortWaved&clothing=graphicShirt&clothesColor=0ea5e9&skinColor=f8d25c", color: "#0ea5e9" },
  quinn: { id: "Q", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Quinn&top=dreads01&facialHair=beardMedium&clothing=hoodie&clothesColor=f59e0b&skinColor=ae5d29", color: "#f59e0b" },
  elijah: { id: "E", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Elijah&top=shortRound&clothing=collarAndSweater&clothesColor=10b981&skinColor=edb98a", color: "#10b981" },
};

// ── Hero Replica Messages (matching real app conversation) ──

const HERO_INITIAL_MESSAGES = [
  { id: 1, user: "noah", time: "1m ago", text: "Opus at 48kHz stereo, constant bitrate. The quality difference is insane compared to what we had before" },
  { id: 2, user: "trevor", time: "1m ago", text: "Just tested it — the noise suppression is so clean. I had my mechanical keyboard going and nobody could hear it" },
  { id: 3, user: "quinn", time: "1m ago", text: "That's the Krisp integration right?" },
  { id: 4, user: "trevor", time: "1m ago", text: "Yeah, it runs locally too. No audio gets sent to any third party" },
  { id: 5, user: "riley", time: "1m ago", text: "What about screen share? I noticed the preset selector got updated" },
  { id: 6, user: "noah", time: "1m ago", text: "We now have 6 presets from 480p30 all the way up to lossless VP9 at 4K. The lossless mode does 20 Mbps" },
  { id: 7, user: "quinn", time: "1m ago", text: "20 Mbps?? That's wild. Discord caps at like 720p on Nitro" },
  { id: 8, user: "riley", time: "1m ago", text: "How's the latency looking?" },
];

const HERO_EXTRA_MESSAGES = [
  { user: "noah", text: "P95 is under 45ms. LiveKit's SFU architecture is really paying off" },
  { user: "trevor", text: "The memory usage is what gets me. 48MB idle vs Discord eating 300+ MB just sitting there" },
  { user: "quinn", text: "My laptop thanks you" },
  { user: "riley", text: "Are we still on track for the encryption rollout?" },
  { user: "noah", text: "E2EE is already live — AES-256-GCM with ECDH key exchange. Every message, every file, every reaction" },
  { user: "trevor", text: "Love that it's on by default and not some premium upsell" },
  { user: "quinn", text: "This is genuinely the best voice app I've used. The whole thing feels so fast" },
  { user: "riley", text: "Agreed. Switching to this full time, no question" },
];

// ── Section Chat Replica Messages ──

const SECTION_INITIAL_MESSAGES = [
  { id: 1, user: "noah", time: "2:14 PM", text: "just pushed the new voice engine. latency is down to 38ms" },
  { id: 2, user: "riley", time: "2:15 PM", text: "no way, that's insane. testing now" },
  { id: 3, user: "trevor", time: "2:16 PM", text: "the noise suppression update is live too. keyboard sounds are completely gone" },
  { id: 4, user: "quinn", time: "2:18 PM", text: "screen share looks crisp at 4K. huge improvement over last week" },
];

const SECTION_EXTRA_MESSAGES = [
  { user: "riley", text: "anyone want to test the new update?" },
  { user: "noah", text: "the latency improvement is wild" },
  { user: "trevor", text: "just ran a voice test — zero crackling" },
  { user: "quinn", text: "the new codec sounds way better on bluetooth" },
  { user: "riley", text: "screen share is buttery smooth now" },
  { user: "noah", text: "pushed a fix for the reconnect issue" },
];

// ── Voice Replica Data ──

const VOICE_PARTICIPANTS = [
  { id: "N", name: "noah", color: "#6366f1", avatar: USERS.noah.avatar, muted: false, deafened: false },
  { id: "R", name: "riley", color: "#0ea5e9", avatar: USERS.riley.avatar, muted: false, deafened: false },
  { id: "T", name: "trevor", color: "#8b5cf6", avatar: USERS.trevor.avatar, muted: true, deafened: false },
  { id: "Q", name: "quinn", color: "#f59e0b", avatar: USERS.quinn.avatar, muted: false, deafened: true },
];

const ELIJAH_USER = { id: "E", name: "elijah", color: "#10b981", avatar: USERS.elijah.avatar, muted: false, deafened: false };

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
      <span style={{ fontSize: "12px", color: "#71717a" }}>
        {user} is typing
      </span>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 4, height: 4, background: "#71717a" }}
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

// ── Flux App Sidebar (shared between hero and section replicas) ──

function FluxSidebar({
  showRoom,
  roomParticipants,
  compact,
}: {
  showRoom?: boolean;
  roomParticipants?: { id: string; name: string; color: string; avatar?: string }[];
  compact?: boolean;
}) {
  return (
    <div
      className="flex-shrink-0 flex-col hidden md:flex"
      style={{
        width: compact ? "200px" : "240px",
        background: "#0a0a0d",
        borderRight: "1px solid #1a1a1f",
      }}
    >
      {/* Server header */}
      <div
        className="flex items-center gap-2 px-4"
        style={{ height: "40px" }}
      >
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#e4e4e7" }}>
          flux
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden px-2 pt-1 flex flex-col">
        {/* Roadmap */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded mb-1">
          <Map size={14} style={{ color: "#71717a" }} />
          <span style={{ fontSize: "13px", color: "#71717a" }}>Roadmap</span>
        </div>

        {/* Channels — flat list, no categories */}
        {SIDEBAR_CHANNELS.map((ch) => (
          <div
            key={ch.name}
            className="flex items-center gap-2 px-2 py-1.5 rounded"
            style={{
              background: ch.active ? "rgba(255,255,255,0.06)" : "transparent",
              cursor: "pointer",
            }}
          >
            <ChannelIcon size={14} color={ch.active ? "#e4e4e7" : "#52525b"} />
            <span
              style={{
                fontSize: "13px",
                fontWeight: ch.active ? 500 : 400,
                color: ch.active ? "#e4e4e7" : "#71717a",
              }}
            >
              {ch.name}
            </span>
          </div>
        ))}

        <div className="flex-1" />

        {/* Room section at bottom */}
        {showRoom && roomParticipants && (
          <div
            className="mx-1 mb-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a1f" }}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-1.5">
                <ChevronDown size={10} style={{ color: "#52525b" }} />
                <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#71717a" }}>
                  Room 1
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#fff",
                    background: "#22d3ee",
                    width: 16,
                    height: 16,
                  }}
                >
                  {roomParticipants.length}
                </span>
                <Lock size={10} style={{ color: "#52525b" }} />
              </div>
            </div>
            <div className="px-3 pb-2.5 flex flex-col gap-1.5">
              {roomParticipants.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: p.color + "33" }}
                  >
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ fontSize: "9px", fontWeight: 600, color: p.color }}>
                        {p.id}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: "12px", color: "#ccc" }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {showRoom && (
        <div style={{ borderTop: "1px solid #1a1a1f" }}>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: "11px", fontWeight: 500, color: "#22d3ee" }}>Connected</span>
              <span style={{ fontSize: "10px", color: "#52525b" }}>Room 1</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 pb-2">
            <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: "#1a1a1f" }}>
              <Mic size={14} style={{ color: "#e4e4e7" }} />
            </div>
            <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: "#1a1a1f" }}>
              <Headphones size={14} style={{ color: "#e4e4e7" }} />
            </div>
            <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: "#1a1a1f" }}>
              <HeadphoneOff size={14} style={{ color: "#52525b" }} />
            </div>
            <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: "#ff4444" }}>
              <PhoneOff size={14} style={{ color: "#fff" }} />
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="px-3 pb-2">
        <Settings size={14} style={{ color: "#52525b" }} />
      </div>
    </div>
  );
}

// ── Icon Rail (left edge of app) ──

function IconRail() {
  return (
    <div
      className="flex-shrink-0 flex-col items-center pt-3 gap-3 hidden md:flex"
      style={{
        width: "48px",
        background: "#050507",
        borderRight: "1px solid rgba(26,26,31,0.19)",
      }}
    >
      <FluxLogo size={24} className="text-foreground-muted/60" />
      <div className="w-6 h-px bg-white/10 my-1" />
      {/* Server avatars */}
      {[USERS.noah, USERS.trevor].map((u) => (
        <div
          key={u.id}
          className="w-8 h-8 rounded-full overflow-hidden"
          style={{ background: u.color + "33" }}
        >
          <img src={u.avatar} alt="" className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

// ── Message Row (shared) ──

function MessageRow({
  user,
  time,
  text,
}: {
  user: string;
  time: string;
  text: string;
}) {
  const u = USERS[user as keyof typeof USERS];
  if (!u) return null;
  return (
    <div className="flex gap-3 py-1.5 px-2">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 overflow-hidden"
        style={{
          border: `2px solid ${u.color}`,
          background: u.color + "22",
        }}
      >
        <img src={u.avatar} alt={user} className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#e4e4e7" }}>
            {user}
          </span>
          <span style={{ fontSize: "10px", color: "#52525b" }}>
            {time}
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#ccc", lineHeight: 1.45, marginTop: "1px" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

// ── FluxAppReplica (Hero — full app layout, animated) ──

function FluxAppReplica() {
  const [messages, setMessages] = useState(HERO_INITIAL_MESSAGES);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const nextMsgIdx = useRef(0);
  const nextId = useRef(HERO_INITIAL_MESSAGES.length + 1);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // New messages every ~5s
  useEffect(() => {
    const interval = setInterval(() => {
      const extra = HERO_EXTRA_MESSAGES[nextMsgIdx.current % HERO_EXTRA_MESSAGES.length];
      setTypingUser(extra.user);

      setTimeout(() => {
        setTypingUser(null);
        const newMsg = {
          id: nextId.current++,
          user: extra.user,
          time: "just now",
          text: extra.text,
        };
        setMessages((prev) => {
          const next = [...prev, newMsg];
          if (next.length > 10) return next.slice(next.length - 10);
          return next;
        });
        nextMsgIdx.current++;
      }, 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden w-full mx-auto"
      style={{
        background: "#0a0a0d",
        border: "1px solid #1a1a1f",
      }}
    >
      <div className="flex" style={{ height: "680px" }}>
        {/* Icon rail */}
        <IconRail />

        {/* Sidebar */}
        <FluxSidebar
          showRoom
          roomParticipants={[
            { id: "N", name: "noah", color: "#6366f1", avatar: USERS.noah.avatar },
            { id: "R", name: "riley", color: "#0ea5e9", avatar: USERS.riley.avatar },
            { id: "T", name: "trevor", color: "#8b5cf6", avatar: USERS.trevor.avatar },
          ]}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div
            className="flex items-center justify-between px-4 flex-shrink-0"
            style={{
              height: "40px",
              borderBottom: "1px solid #1a1a1f",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#e4e4e7" }}>
              general
            </span>
            <div className="flex items-center gap-3">
              <Search size={14} style={{ color: "#52525b" }} />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden px-3 py-2 flex flex-col gap-0 justify-end">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={hasMounted.current ? { opacity: 0, y: 16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <MessageRow user={msg.user} time={msg.time} text={msg.text} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Typing / input */}
          <div className="px-4 pb-3 flex-shrink-0">
            <div className="h-5 mb-1">
              <AnimatePresence>
                {typingUser && <TypingIndicator user={typingUser} />}
              </AnimatePresence>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "#0e0e12",
                border: "1px solid #1a1a1f",
              }}
            >
              <Paperclip size={16} style={{ color: "#52525b", flexShrink: 0 }} />
              <span className="flex-1" style={{ fontSize: "13px", color: "#52525b" }}>
                Message #general
              </span>
              <Smile size={16} style={{ color: "#52525b", flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar (voice controls) */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderTop: "1px solid #1a1a1f" }}
      >
        <div />
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#1a1a1f" }}>
            <Mic size={16} style={{ color: "#e4e4e7" }} />
          </div>
          <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#1a1a1f" }}>
            <Headphones size={16} style={{ color: "#e4e4e7" }} />
          </div>
          <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#1a1a1f" }}>
            <MonitorUp size={16} style={{ color: "#e4e4e7" }} />
          </div>
          <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#ff4444" }}>
            <PhoneOff size={16} style={{ color: "#fff" }} />
          </div>
        </div>
        <div />
      </div>
    </div>
  );
}

// ── FluxChatReplica (Messaging Section) ──

function FluxChatReplica() {
  const [messages, setMessages] = useState(
    SECTION_INITIAL_MESSAGES.map((m) => ({ ...m, avatar: USERS[m.user as keyof typeof USERS]?.avatar || "?", color: USERS[m.user as keyof typeof USERS]?.color || "#71717a" }))
  );
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const nextMsgIdx = useRef(0);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const extra = SECTION_EXTRA_MESSAGES[nextMsgIdx.current % SECTION_EXTRA_MESSAGES.length];
      setTypingUser(extra.user);

      setTimeout(() => {
        setTypingUser(null);
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        const newMsg = {
          id: nextMsgIdx.current + 100,
          user: extra.user,
          avatar: USERS[extra.user as keyof typeof USERS]?.avatar || "?",
          color: USERS[extra.user as keyof typeof USERS]?.color || "#71717a",
          time: timeStr,
          text: extra.text,
        };
        setMessages((prev) => {
          const next = [...prev, newMsg];
          if (next.length > 6) return next.slice(next.length - 6);
          return next;
        });
        nextMsgIdx.current++;
      }, 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[800px] mx-auto h-[380px] md:h-[480px]"
      style={{
        background: "#0a0a0d",
        border: "1px solid #1a1a1f",
      }}
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <FluxSidebar compact />

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div
            className="flex items-center justify-between px-4 flex-shrink-0"
            style={{
              height: "40px",
              borderBottom: "1px solid #1a1a1f",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#e4e4e7" }}>
              general
            </span>
            <Search size={14} style={{ color: "#52525b" }} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden px-3 py-2 flex flex-col gap-0 justify-end">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={hasMounted.current ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <MessageRow user={msg.user} time={msg.time} text={msg.text} />
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
                background: "#0e0e12",
                border: "1px solid #1a1a1f",
              }}
            >
              <Paperclip size={16} style={{ color: "#52525b", flexShrink: 0 }} />
              <span className="flex-1" style={{ fontSize: "13px", color: "#52525b" }}>
                Message #general
              </span>
              <Smile size={16} style={{ color: "#52525b", flexShrink: 0 }} />
              <Send size={16} style={{ color: "#52525b", flexShrink: 0 }} />
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
          style={{ width: 2, background: "#22d3ee" }}
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
        boxShadow: `0 0 0 2px #22d3ee, 0 0 12px rgba(67,181,129,0.4)`,
        background: "rgba(67,181,129,0.06)",
      }}
      animate={{
        opacity: [1, 0.5, 1],
        boxShadow: [
          "0 0 0 2px #22d3ee, 0 0 12px rgba(67,181,129,0.4)",
          "0 0 0 2px #22d3ee, 0 0 20px rgba(67,181,129,0.6)",
          "0 0 0 2px #22d3ee, 0 0 12px rgba(67,181,129,0.4)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function FluxVoiceReplica() {
  const [speakingSet, setSpeakingSet] = useState<Set<string>>(new Set(["N", "A"]));
  const [emmaPresent, setEmmaPresent] = useState(false);

  useEffect(() => {
    const allIds = ["N", "A", "S", "J"];
    const interval = setInterval(() => {
      const shuffled = [...allIds].sort(() => Math.random() - 0.5);
      const count = Math.random() > 0.5 ? 2 : 1;
      setSpeakingSet(new Set(shuffled.slice(0, count)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setEmmaPresent(true);
      timeout = setTimeout(() => {
        setEmmaPresent(false);
        timeout = setTimeout(cycle, 6000);
      }, 4000);
    };
    timeout = setTimeout(cycle, 6000);
    return () => clearTimeout(timeout);
  }, []);

  const participants = emmaPresent
    ? [...VOICE_PARTICIPANTS, ELIJAH_USER]
    : VOICE_PARTICIPANTS;

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[620px] mx-auto"
      style={{
        background: "#0a0a0d",
        border: "1px solid #1a1a1f",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-0 px-4"
        style={{ borderBottom: "1px solid #1a1a1f" }}
      >
        {VOICE_TABS.map((tab) => (
          <div
            key={tab.label}
            className="relative px-3 py-3 cursor-pointer"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: tab.active ? "#e4e4e7" : "#52525b",
            }}
          >
            {tab.label}
            {tab.active && (
              <div
                className="absolute bottom-0 left-3 right-3"
                style={{ height: "2px", background: "#e4e4e7", borderRadius: "1px" }}
              />
            )}
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 pr-1">
          <div className="rounded-full" style={{ width: 6, height: 6, background: "#22d3ee" }} />
          <span style={{ fontSize: "12px", color: "#71717a", fontFamily: "monospace" }}>
            {participants.length}
          </span>
        </div>
      </div>

      {/* Participant grid */}
      <div className="flex flex-wrap justify-center gap-5 p-6" style={{ minHeight: "200px" }}>
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
                style={{ width: "140px", background: "#0e0e12", padding: "16px 12px 12px" }}
              >
                {isSpeaking && <SpeakingGlow />}
                <motion.div
                  className="relative w-[72px] h-[72px] rounded-full overflow-hidden mb-2"
                  style={{
                    background: p.color + "22",
                    border: isSpeaking ? `3px solid ${p.color}` : `3px solid ${p.color}44`,
                  }}
                  animate={isSpeaking ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={isSpeaking ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                >
                  <img src={p.avatar} alt={p.name} className="w-full h-full" />
                </motion.div>
                <div className="flex items-center gap-1.5" style={{ position: "relative", zIndex: 1 }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#e4e4e7" }}>
                    {p.name}
                  </span>
                  {isSpeaking && <WaveformBars />}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5" style={{ position: "relative", zIndex: 1 }}>
                  {p.muted && <MicOffIcon size={14} style={{ color: "#52525b" }} />}
                  {p.deafened && <HeadphoneOff size={14} style={{ color: "#52525b" }} />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-1 px-4 py-2.5" style={{ borderTop: "1px solid #1a1a1f" }}>
        <div className="flex items-center justify-center rounded-full" style={{ width: "36px", height: "36px", background: "#1a1a1f" }}>
          <Mic size={20} style={{ color: "#e4e4e7" }} />
        </div>
        <div className="flex items-center justify-center rounded-full" style={{ width: "36px", height: "36px", background: "#1a1a1f" }}>
          <Headphones size={20} style={{ color: "#e4e4e7" }} />
        </div>
        <div className="flex items-center justify-center rounded-full" style={{ width: "36px", height: "36px", background: "#1a1a1f" }}>
          <MonitorUp size={20} style={{ color: "#e4e4e7" }} />
        </div>
        <div className="flex items-center justify-center rounded-full" style={{ width: "36px", height: "36px", background: "#ff4444" }}>
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
  const [progress, setProgress] = useState(0.62);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrack = ALL_TRACKS[trackIndex % ALL_TRACKS.length];
  const queueTracks = [
    ALL_TRACKS[(trackIndex + 1) % ALL_TRACKS.length],
    ALL_TRACKS[(trackIndex + 2) % ALL_TRACKS.length],
  ];

  const currentSeconds = Math.floor(progress * currentTrack.totalSeconds);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = 1 / (currentTrack.totalSeconds * 3.33);
        const next = prev + increment;
        if (next >= 1) {
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
      className="rounded-xl overflow-hidden w-full max-w-[520px] mx-auto"
      style={{
        background: "#0a0a0d",
        border: "1px solid #1a1a1f",
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
        {/* Vinyl disc */}
        <div className="relative mb-6" style={{ width: "260px", height: "260px" }}>
          {/* Groove layer — spins. Light reflection overlay makes spin visible */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                repeating-radial-gradient(
                  circle at center,
                  #0e0e12 0px, #0e0e12 2px,
                  #1a1a1f 2px, #1a1a1f 4px
                )
              `,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              animation: "vinyl-spin 4s linear infinite",
            }}
          >
            {/* Asymmetric light reflection — this is what makes the spin visible */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
              }}
            />
          </div>

          {/* Center album art — static (does NOT spin) */}
          <div
            className="absolute rounded-full overflow-hidden"
            style={{
              width: "42%",
              height: "42%",
              top: "29%",
              left: "29%",
              zIndex: 2,
              boxShadow: "0 0 0 3px #1a1a1f",
              background: `linear-gradient(135deg, ${currentTrack.gradientFrom}, ${currentTrack.gradientTo})`,
              transition: "background 0.6s ease",
            }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.25) 0%, transparent 50%)" }} />
            <div className="absolute" style={{ top: "10%", right: "12%", width: "35%", height: "35%", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            <div className="absolute" style={{ bottom: "15%", left: "10%", width: "20%", height: "20%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", transform: "rotate(15deg)" }} />
            <div className="absolute flex flex-col items-start" style={{ bottom: "14%", left: "14%", right: "14%" }}>
              <span style={{ fontSize: "7px", fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>
                {currentTrack.title}
              </span>
              <span style={{ fontSize: "5.5px", color: "rgba(255,255,255,0.6)", marginTop: "1px" }}>
                {currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Center hole — static */}
          <div
            className="absolute rounded-full"
            style={{
              width: "8%",
              height: "8%",
              top: "46%",
              left: "46%",
              zIndex: 3,
              background: "#0a0a0d",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8), 0 0 0 2px #222",
            }}
          />
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
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                {currentTrack.title}
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
                {currentTrack.artist}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-4">
          <div className="w-full rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.12)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#ffffff" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#71717a" }}>
              {formatTime(currentSeconds)}
            </span>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#71717a" }}>
              {currentTrack.duration}
            </span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center justify-center rounded-full" style={{ width: "34px", height: "34px" }}>
            <SkipForward size={18} style={{ color: "#e4e4e7", transform: "scaleX(-1)" }} />
          </div>
          <div className="flex items-center justify-center rounded-full" style={{ width: "34px", height: "34px", background: "#e4e4e7" }}>
            <Pause size={16} style={{ color: "#0a0a0a" }} />
          </div>
          <div className="flex items-center justify-center rounded-full" style={{ width: "34px", height: "34px" }}>
            <SkipForward size={18} style={{ color: "#e4e4e7" }} />
          </div>
        </div>
      </div>

      {/* Queue */}
      <div className="relative" style={{ borderTop: "1px solid #1a1a1f" }}>
        <div className="px-4 py-2">
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#71717a" }}>Queue</span>
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
              style={{ borderTop: "1px solid #1a1a1f66" }}
            >
              <motion.div
                className="rounded flex-shrink-0"
                style={{ width: "32px", height: "32px", borderRadius: "4px" }}
                animate={{ background: `linear-gradient(135deg, ${track.gradientFrom}, ${track.gradientTo})` }}
                transition={{ duration: 0.4 }}
              />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#e4e4e7" }}>{track.title}</p>
                <p style={{ fontSize: "11px", color: "#71717a" }}>{track.artist}</p>
              </div>
              <span style={{ fontSize: "11px", color: "#52525b", flexShrink: 0 }}>{track.duration}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CSS for vinyl spin */}
      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Kill Feed Line (for game HUD) ──

function KillFeedLine({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        times: [0, 0.05, 0.85, 1],
      }}
      className="px-2 py-0.5 rounded"
      style={{ background: "rgba(0,0,0,0.5)", color: "#ccc", whiteSpace: "nowrap" }}
    >
      {text}
    </motion.div>
  );
}

// ── Screen Share / Streaming Replica ──

function FluxStreamReplica() {
  const [activePreset, setActivePreset] = useState(0);
  const [viewerCount] = useState(3);

  // Cycle through presets to show variety
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePreset((prev) => (prev + 1) % SCREEN_SHARE_PRESETS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const preset = SCREEN_SHARE_PRESETS[activePreset];

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto"
      style={{ background: "#0a0a0d", border: "1px solid #1a1a1f" }}
    >
      {/* Stream header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1a1a1f", background: "#0e0e12" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MonitorUp size={14} style={{ color: "#22d3ee" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7" }}>noah&apos;s screen</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: "#ff444420" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "10px", color: "#ff4444", fontWeight: 500 }}>LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "11px", color: "#71717a" }}>{viewerCount} watching</span>
          <div className="flex -space-x-1.5">
            {[USERS.trevor, USERS.riley, USERS.quinn].map((u) => (
              <div key={u.id} className="w-5 h-5 rounded-full overflow-hidden border-2" style={{ borderColor: "#0e0e12", background: u.color + "33" }}>
                <img src={u.avatar} alt="" className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stream content — game HUD mock */}
      <div className="relative" style={{ height: "320px", background: "linear-gradient(135deg, #0a0e1a 0%, #151030 50%, #0d0a1f 100%)" }}>
        {/* Kill feed — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1" style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace" }}>
          <KillFeedLine text="noah eliminated Player3" delay={0} />
          <KillFeedLine text="riley eliminated Player7" delay={2} />
          <KillFeedLine text="noah eliminated quinn" delay={4} />
          <KillFeedLine text="trevor eliminated Player2" delay={6} />
        </div>

        {/* Minimap — top right */}
        <div className="absolute top-3 right-3 rounded" style={{ width: "80px", height: "80px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "#22d3ee", top: "30%", left: "40%", boxShadow: "0 0 4px #22d3ee" }} />
          <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "#22d3ee", top: "55%", left: "60%", boxShadow: "0 0 4px #22d3ee" }} />
          <div className="absolute rounded-full" style={{ width: 3, height: 3, background: "#ff4444", top: "45%", left: "25%", boxShadow: "0 0 4px #ff4444" }} />
          <div className="absolute rounded-full" style={{ width: 3, height: 3, background: "#ff4444", top: "70%", left: "50%", boxShadow: "0 0 4px #ff4444" }} />
          <div className="absolute rounded-full" style={{ width: 3, height: 3, background: "#f59e0b", top: "20%", left: "70%", boxShadow: "0 0 4px #f59e0b" }} />
        </div>

        {/* Crosshair — center */}
        <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.6)", position: "absolute", left: "0px", top: "-10px" }} />
          <div style={{ width: "20px", height: "1px", background: "rgba(255,255,255,0.6)", position: "absolute", top: "0px", left: "-10px" }} />
          <div className="absolute rounded-full" style={{ width: "4px", height: "4px", background: "rgba(255,255,255,0.3)", top: "-2px", left: "-2px" }} />
        </div>

        {/* Health + Shield — bottom left */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          {/* Shield bar */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "10px", color: "#60a5fa", fontFamily: "monospace", width: "20px" }}>50</span>
            <div style={{ width: "120px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
              <div style={{ width: "50%", height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: "2px" }} />
            </div>
          </div>
          {/* Health bar */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "10px", color: "#22d3ee", fontFamily: "monospace", width: "20px" }}>82</span>
            <div style={{ width: "120px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
              <div style={{ width: "82%", height: "100%", background: "linear-gradient(90deg, #22c55e, #22d3ee)", borderRadius: "2px" }} />
            </div>
          </div>
        </div>

        {/* Ammo counter — bottom right */}
        <div className="absolute bottom-3 right-3 flex items-end gap-2">
          <div className="flex flex-col items-end">
            <div style={{ fontSize: "9px", color: "#71717a", fontFamily: "monospace", marginBottom: "2px" }}>RIFLE</div>
            <div className="flex items-baseline gap-1">
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#e4e4e7", fontFamily: "monospace", lineHeight: 1 }}>24</span>
              <span style={{ fontSize: "12px", color: "#52525b", fontFamily: "monospace" }}>/</span>
              <span style={{ fontSize: "14px", color: "#71717a", fontFamily: "monospace" }}>90</span>
            </div>
          </div>
          <div className="rounded" style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "16px", height: "10px", background: "#71717a", borderRadius: "2px", clipPath: "polygon(0 20%, 85% 0, 100% 30%, 100% 100%, 0 100%)" }} />
          </div>
        </div>
      </div>

      {/* Preset selector bar */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #1a1a1f", background: "#0e0e12" }}>
        <div className="flex items-center gap-2">
          <Monitor size={14} style={{ color: "#71717a" }} />
          <AnimatePresence mode="wait">
            <motion.span
              key={activePreset}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: "12px", color: "#e4e4e7", fontFamily: "monospace" }}
            >
              {preset.preset}
            </motion.span>
          </AnimatePresence>
          <span style={{ fontSize: "10px", color: "#52525b" }}>·</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={activePreset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: "11px", color: "#71717a" }}
            >
              {preset.codec} · {preset.bitrate} · {preset.framerate}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          {SCREEN_SHARE_PRESETS.map((p, i) => (
            <button
              key={p.preset}
              onClick={() => setActivePreset(i)}
              className="px-2 py-0.5 rounded text-xs transition-colors"
              style={{
                fontSize: "10px",
                fontFamily: "monospace",
                background: i === activePreset ? "#ffffff10" : "transparent",
                color: i === activePreset ? "#e4e4e7" : "#52525b",
              }}
            >
              {p.preset}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Krisp Logo ──

function KrispLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12c1.5-3 3-5 4.5-5s2.5 2 4 2 2.5-4 4-4 2.5 3 4 3 2-2 3.5-2"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M2 16c1.5-2 3-3.5 4.5-3.5s2.5 1.5 4 1.5 2.5-3 4-3 2.5 2 4 2 2-1.5 3.5-1.5"
        stroke="#22d3ee"
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
  const platform = useDetectedPlatform();
  const downloadHref = platform === "mac" ? "/download/mac" : "/download/windows";
  const PlatformIcon = platform === "mac" ? Apple : MonitorDot;
  const platformLabel = platform === "mac" ? "Download for macOS" : "Download for Windows";
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((data) => {
        const active = data.subscriptions?.some(
          (s: { product: string }) => s.product === "athion_pro" || s.product === "athion"
        );
        setHasSubscription(!!active);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  return (
    <section className="relative pt-[180px] md:pt-[260px] lg:pt-[280px] pb-6">
      <div className="relative mx-auto max-w-[1344px] px-6 lg:px-12">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-4 px-8"
        >
          <FluxLogo size={48} />
        </motion.div>

        <motion.h1
          className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-[510] tracking-[-0.022em] leading-[1.1] md:leading-[1.1] lg:leading-[1.06] px-8"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <span className="text-foreground">Flux</span>
        </motion.h1>

        <motion.p
          className="mt-5 md:mt-8 text-[0.9375rem] leading-[1.6] tracking-[-0.011em] text-[#b4bcd0] px-8"
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeUp}
        >
          Private voice chat, built for performance.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4 px-8"
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={fadeUp}
        >
          {checked && hasSubscription ? (
            <>
              <a
                href={downloadHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#111] text-sm font-[510] rounded-full hover:bg-white/90 active:scale-[0.98] transition-all duration-150"
              >
                <PlatformIcon size={14} />
                {platformLabel}
              </a>
              <a
                href={platform === "mac" ? "/download/windows" : "/download/mac"}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] text-[#b4bcd0] text-sm font-[510] hover:text-white hover:border-white/[0.15] rounded-full active:scale-[0.98] transition-all duration-150"
              >
                {platform === "mac" ? <MonitorDot size={14} /> : <Apple size={14} />}
                {platform === "mac" ? "Windows" : "macOS"}
              </a>
            </>
          ) : (
            <>
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground/30 text-background/50 text-sm font-medium rounded-full cursor-not-allowed"
                title="Athion subscription required"
              >
                <PlatformIcon size={14} />
                {platformLabel}
              </span>
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border/50 text-foreground-muted/40 text-sm rounded-full cursor-not-allowed"
                title="Athion subscription required"
              >
                {platform === "mac" ? <MonitorDot size={14} /> : <Apple size={14} />}
                {platform === "mac" ? "Windows" : "macOS"}
              </span>
            </>
          )}
          <a
            href={checked && !hasSubscription ? "/pricing" : "#features"}
            className="group inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            {checked && !hasSubscription ? "Subscribe to download" : "See what's inside"}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </a>
        </motion.div>
        <p className="mt-4 text-xs text-foreground-muted/50 px-8">
          Available for macOS and Windows. Free with Athion subscription.
        </p>
      </div>
    </section>
  );
}

// ── Hero App Replica (replaces screenshot) ──

function HeroAppSection() {
  return (
    <section className="relative pt-16 pb-32">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="relative overflow-hidden rounded-xl">
            <FluxAppMock height="680px" />
            {/* Bottom gradient mask — subtle fade into background */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
            {/* Left gradient mask — subtle */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/40 to-transparent pointer-events-none" />
            {/* Right gradient mask — subtle */}
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/40 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Section Header ──

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
    <div className="grid grid-cols-1 lg:grid-cols-2 mb-16">
      <ScrollReveal>
        <div className="pr-0 lg:pr-8">
          <h2
            className="font-[510] text-[1.5rem] md:text-[2.5rem] lg:text-[3rem] leading-[1.33] md:leading-[1.1] lg:leading-[1] tracking-[-0.022em] text-foreground whitespace-pre-line"
            style={{ textWrap: "balance", maxWidth: "18ch" }}
          >
            {title}
          </h2>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <div className="mt-6 lg:mt-0">
          <p
            className="font-[590] text-[1.0625rem] md:text-[1.25rem] lg:text-[1.5rem] leading-[1.4] md:leading-[1.33] tracking-[-0.012em] text-[#b4bcd0]"
            style={{ textWrap: "balance" }}
          >
            {description}
          </p>
          <div className="inline-flex items-center mt-6 lg:mt-12">
            <span className="text-[0.9375rem] leading-[1.6] tracking-[-0.011em] text-[#86848d] tabular-nums">
              {number}
            </span>
            <span className="text-[0.9375rem] leading-[1.6] tracking-[-0.011em] text-[#b4bcd0] ml-3">
              {label}
            </span>
          </div>
        </div>
      </ScrollReveal>
    </div>
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
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
        <SectionHeader
          number="2.0"
          label="Messaging"
          title={"Conversations that stay yours."}
          description="Every message, file, and reaction is encrypted end-to-end with AES-256-GCM before leaving your device. Rich text, emoji, reactions, and threaded replies — without compromising privacy."
        />

        <ScrollReveal>
          <FluxChatReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "2.1", label: "End-to-end encryption" },
            { number: "2.2", label: "Rich messaging" },
            { number: "2.3", label: "File sharing" },
            { number: "2.4", label: "Reactions & threads" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 2.0 Voice ──

function VoiceSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
        <SectionHeader
          number="1.0"
          label="Voice"
          title={"Voice that feels like\nthe same room."}
          description="48kHz stereo Opus audio with Krisp AI noise suppression running locally on your device. Keyboard clatter, fans, and background chatter vanish — your voice stays untouched. Sub-45ms latency over LiveKit's globally distributed SFU."
        />

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
            { number: "1.1", label: "48kHz stereo" },
            { number: "1.2", label: "Krisp noise filter" },
            { number: "1.3", label: "320kbps bitrate" },
            { number: "1.4", label: "<45ms latency" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 3.0 Music ──

function MusicSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
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

// ── 4.0 Streaming ──

function StreamingSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
        <SectionHeader
          number="4.0"
          label="Streaming"
          title={"Screen share without\nthe compromise."}
          description="Share your screen at full fidelity — from 480p for low bandwidth to lossless VP9 at 4K 60fps pushing 20 Mbps. No Nitro paywall, no resolution caps. Every pixel, every frame."
        />

        <ScrollReveal>
          <FluxStreamReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "4.1", label: "Lossless VP9 4K" },
            { number: "4.2", label: "6 quality presets" },
            { number: "4.3", label: "Up to 20 Mbps" },
            { number: "4.4", label: "60fps streaming" },
          ]}
        />
      </div>
    </section>
  );
}

function FeatureSections() {
  return (
    <div id="features">
      <VoiceSection />
      <MessagingSection />
      <MusicSection />
      <StreamingSection />
    </div>
  );
}

// ── Feature Grid ──

function FeatureGrid() {
  return (
    <section className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
        <ScrollReveal>
          <p className="overline mb-4">Details</p>
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-[510] tracking-[-0.022em] leading-[1.12] max-w-2xl">
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
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
        <SectionHeader
          number="6.0"
          label="Specifications"
          title={"Under the hood."}
          description="Flux is built on a Rust backend with LiveKit WebRTC for media routing. The desktop app uses Tauri — no Electron, no bloat."
        />

        <div className="grid lg:grid-cols-2 gap-16">
          <ScrollReveal>
            <StaggerContainer className="grid grid-cols-2 gap-x-8 gap-y-4">
              {specs.map((spec) => (
                <StaggerItem key={spec.label}>
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em]">{spec.label}</p>
                    <p className="mt-1 text-sm font-mono text-foreground/70">{spec.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="border border-border/50 rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border/50">
                <span className="text-[10px] text-foreground-muted/50 uppercase tracking-[0.15em]">Screen Share Presets</span>
              </div>
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

        <SubFeatures
          items={[
            { number: "6.1", label: "Tauri (no Electron)" },
            { number: "6.2", label: "Rust backend" },
            { number: "6.3", label: "LiveKit WebRTC" },
            { number: "6.4", label: "SQLite storage" },
          ]}
        />
      </div>
    </section>
  );
}

// ── Bottom CTA ──

function DownloadCTA() {
  const platform = useDetectedPlatform();
  const downloadHref = platform === "mac" ? "/download/mac" : "/download/windows";
  const PlatformIcon = platform === "mac" ? Apple : MonitorDot;
  const platformLabel = platform === "mac" ? "Download for macOS" : "Download for Windows";

  return (
    <section id="download" className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-[1344px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-[510] tracking-[-0.022em] leading-[1.1] md:leading-[1.1] lg:leading-[1.06]">
            <span className="text-foreground">Ready to switch? </span>
            <span className="text-[#b4bcd0]">Join the voice chat that respects your privacy and your machine.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={downloadHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#111] text-sm font-[510] rounded-full hover:bg-white/90 active:scale-[0.98] transition-all duration-150"
            >
              <PlatformIcon size={14} />
              {platformLabel}
            </a>
            <a
              href={platform === "mac" ? "/download/windows" : "/download/mac"}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] text-[#b4bcd0] text-sm font-[510] hover:text-white hover:border-white/[0.15] rounded-full active:scale-[0.98] transition-all duration-150"
            >
              {platform === "mac" ? <MonitorDot size={14} /> : <Apple size={14} />}
              {platform === "mac" ? "Windows" : "macOS"}
            </a>
          </div>
          <p className="mt-6 text-xs text-foreground-muted/50">
            Available for macOS and Windows. Free with Athion subscription.
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
      <HeroAppSection />
      <FeatureSections />
      <FeatureGrid />
      <FluxBenchmarks />
      <TechSpecs />
      <DownloadCTA />
    </PageTransition>
  );
}
