"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Paperclip,
  Smile,
  ChevronDown,
  Lock,
  Mic,
  Headphones,
  HeadphoneOff,
  MonitorUp,
  PhoneOff,
  Settings,
  Map,
  MessageSquare,
} from "lucide-react";
import { FluxLogo } from "@/components/flux-logo";

/* ─── Color tokens (exact Flux app theme) ─── */
const C = {
  bgPrimary: "#050507",
  bgSecondary: "#0a0a0d",
  bgInput: "#0e0e12",
  textPrimary: "#e4e4e7",
  textSecondary: "#71717a",
  textMuted: "#52525b",
  accent: "#22d3ee",
  border: "#1a1a1f",
} as const;

/* ─── Users ─── */
const USERS = {
  noah: { id: "N", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Noah&top=shortCurly&clothing=hoodie&clothesColor=6366f1&skinColor=f8d25c", color: "#6366f1" },
  trevor: { id: "T", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Trevor&top=shortFlat&facialHair=beardLight&clothing=blazerAndShirt&skinColor=edb98a", color: "#8b5cf6" },
  riley: { id: "R", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Riley&top=shortWaved&clothing=graphicShirt&clothesColor=0ea5e9&skinColor=f8d25c", color: "#0ea5e9" },
  quinn: { id: "Q", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Quinn&top=dreads01&facialHair=beardMedium&clothing=hoodie&clothesColor=f59e0b&skinColor=ae5d29", color: "#f59e0b" },
};

const CHANNELS = [
  { name: "general", active: true },
  { name: "dev", active: false },
  { name: "music", active: false },
  { name: "off-topic", active: false },
];

const INITIAL_MESSAGES = [
  { id: 1, user: "noah", time: "1m ago", text: "Opus at 48kHz stereo, constant bitrate. The quality difference is insane" },
  { id: 2, user: "trevor", time: "1m ago", text: "Just tested it \u2014 the noise suppression is so clean. Keyboard sounds are completely gone" },
  { id: 3, user: "quinn", time: "1m ago", text: "That\u2019s the Krisp integration right?" },
  { id: 4, user: "trevor", time: "1m ago", text: "Yeah, it runs locally too. No audio gets sent to any third party" },
  { id: 5, user: "riley", time: "1m ago", text: "What about screen share? I noticed the preset selector got updated" },
  { id: 6, user: "noah", time: "1m ago", text: "6 presets from 480p30 up to lossless VP9 at 4K. The lossless mode does 20 Mbps" },
];

const EXTRA_MESSAGES = [
  { user: "quinn", text: "20 Mbps?? That\u2019s wild. Discord caps at like 720p on Nitro" },
  { user: "riley", text: "How\u2019s the latency looking?" },
  { user: "noah", text: "P95 is under 45ms. LiveKit\u2019s SFU architecture is really paying off" },
  { user: "trevor", text: "The memory usage is what gets me. 48MB idle vs Discord eating 300+ MB" },
  { user: "quinn", text: "My laptop thanks you" },
  { user: "riley", text: "Are we still on track for the encryption rollout?" },
  { user: "noah", text: "E2EE is already live \u2014 AES-256-GCM with ECDH key exchange" },
  { user: "trevor", text: "Love that it\u2019s on by default and not some premium upsell" },
];

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/* ─── Typing Indicator ─── */
function TypingIndicator({ user }: { user: string }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      <span style={{ fontSize: "12px", color: C.textSecondary }}>{user} is typing</span>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 4, height: 4, background: C.textSecondary }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Message Row ─── */
function MessageRow({ user, time, text }: { user: string; time: string; text: string }) {
  const u = USERS[user as keyof typeof USERS];
  if (!u) return null;
  return (
    <div className="flex gap-3 py-1.5 px-2">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 overflow-hidden"
        style={{ border: `2px solid ${u.color}`, background: u.color + "22" }}
      >
        <img src={u.avatar} alt={user} className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: "13px", fontWeight: 700, color: C.textPrimary }}>{user}</span>
          <span style={{ fontSize: "10px", color: C.textMuted }}>{time}</span>
        </div>
        <p style={{ fontSize: "13px", color: "#ccc", lineHeight: 1.45, marginTop: "1px" }}>{text}</p>
      </div>
    </div>
  );
}

/* ─── Icon Rail ─── */
function IconRail() {
  return (
    <div
      className="flex-shrink-0 flex-col items-center pt-3 gap-3 hidden md:flex"
      style={{ width: "48px", background: C.bgPrimary, borderRight: `1px solid rgba(26,26,31,0.19)` }}
    >
      <FluxLogo size={24} className="text-foreground-muted/60" />
      <div className="w-6 h-px bg-white/10 my-1" />
      {[USERS.noah, USERS.trevor].map((u) => (
        <div key={u.id} className="w-8 h-8 rounded-full overflow-hidden" style={{ background: u.color + "33" }}>
          <img src={u.avatar} alt="" className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

/* ─── Sidebar ─── */
function FluxSidebar() {
  const roomParticipants = [
    { id: "N", name: "noah", color: "#6366f1", avatar: USERS.noah.avatar },
    { id: "R", name: "riley", color: "#0ea5e9", avatar: USERS.riley.avatar },
    { id: "T", name: "trevor", color: "#8b5cf6", avatar: USERS.trevor.avatar },
  ];

  return (
    <div
      className="flex-shrink-0 flex-col hidden md:flex"
      style={{ width: "240px", background: C.bgSecondary, borderRight: `1px solid rgba(26,26,31,0.19)` }}
    >
      <div className="flex items-center gap-2 px-4" style={{ height: "40px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary }}>flux</span>
      </div>

      <div className="flex-1 overflow-hidden px-2 pt-1 flex flex-col">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded mb-1">
          <Map size={14} style={{ color: C.textSecondary }} />
          <span style={{ fontSize: "13px", color: C.textSecondary }}>Roadmap</span>
        </div>

        {CHANNELS.map((ch) => (
          <div
            key={ch.name}
            className="flex items-center gap-2 px-2 py-1.5 rounded"
            style={{ background: ch.active ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer" }}
          >
            <MessageSquare size={14} style={{ color: ch.active ? C.textPrimary : C.textMuted }} />
            <span style={{ fontSize: "13px", fontWeight: ch.active ? 500 : 400, color: ch.active ? C.textPrimary : C.textSecondary }}>
              {ch.name}
            </span>
          </div>
        ))}

        <div className="flex-1" />

        {/* Voice room */}
        <div className="mx-1 mb-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.04)` }}>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1.5">
              <ChevronDown size={10} style={{ color: C.textMuted }} />
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: C.textSecondary }}>
                Room 1
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="flex items-center justify-center rounded-full"
                style={{ fontSize: "10px", fontWeight: 600, color: "#fff", background: C.accent, width: 16, height: 16 }}
              >
                {roomParticipants.length}
              </span>
              <Lock size={10} style={{ color: C.textMuted }} />
            </div>
          </div>
          <div className="px-3 pb-2.5 flex flex-col gap-1.5">
            {roomParticipants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0" style={{ background: p.color + "33" }}>
                  <img src={p.avatar} alt={p.name} className="w-full h-full" />
                </div>
                <span style={{ fontSize: "12px", color: "#ccc" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice controls */}
      <div style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: "11px", fontWeight: 500, color: C.accent }}>Connected</span>
            <span style={{ fontSize: "10px", color: C.textMuted }}>Room 1</span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 pb-2">
          {[
            { icon: Mic, color: C.textPrimary, bg: C.border },
            { icon: Headphones, color: C.textPrimary, bg: C.border },
            { icon: HeadphoneOff, color: C.textMuted, bg: C.border },
            { icon: PhoneOff, color: "#fff", bg: "#ff4444" },
          ].map(({ icon: Icon, color, bg }, i) => (
            <div key={i} className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: bg }}>
              <Icon size={14} style={{ color }} />
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 pb-2">
        <Settings size={14} style={{ color: C.textMuted }} />
      </div>
    </div>
  );
}

/* ─── Exported FluxAppMock ─── */
export function FluxAppMock({ height = "520px" }: { height?: string }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const nextMsgIdx = useRef(0);
  const nextId = useRef(INITIAL_MESSAGES.length + 1);
  const hasMounted = useRef(false);

  useEffect(() => { hasMounted.current = true; }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const extra = EXTRA_MESSAGES[nextMsgIdx.current % EXTRA_MESSAGES.length];
      setTypingUser(extra.user);

      setTimeout(() => {
        setTypingUser(null);
        const newMsg = { id: nextId.current++, user: extra.user, time: "just now", text: extra.text };
        setMessages((prev) => {
          const next = [...prev, newMsg];
          return next.length > 8 ? next.slice(next.length - 8) : next;
        });
        nextMsgIdx.current++;
      }, 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden w-full mx-auto"
      style={{ background: C.bgPrimary, border: `1px solid ${C.border}` }}
    >
      <div className="flex" style={{ height }}>
        <IconRail />
        <FluxSidebar />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div
            className="flex items-center justify-between px-4 flex-shrink-0"
            style={{ height: "40px", borderBottom: `1px solid ${C.border}` }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary }}>general</span>
            <Search size={14} style={{ color: C.textMuted }} />
          </div>

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

          <div className="px-4 pb-3 flex-shrink-0">
            <div className="h-5 mb-1">
              <AnimatePresence>
                {typingUser && <TypingIndicator user={typingUser} />}
              </AnimatePresence>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: C.bgInput, border: `1px solid ${C.border}` }}
            >
              <Paperclip size={16} style={{ color: C.textMuted, flexShrink: 0 }} />
              <span className="flex-1" style={{ fontSize: "13px", color: C.textMuted }}>Message #general</span>
              <Smile size={16} style={{ color: C.textMuted, flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <div />
        <div className="flex items-center gap-1.5">
          {[Mic, Headphones, MonitorUp].map((Icon, i) => (
            <div key={i} className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: C.border }}>
              <Icon size={16} style={{ color: C.textPrimary }} />
            </div>
          ))}
          <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#ff4444" }}>
            <PhoneOff size={16} style={{ color: "#fff" }} />
          </div>
        </div>
        <div />
      </div>
    </div>
  );
}
