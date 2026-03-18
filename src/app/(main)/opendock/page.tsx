"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Kanban, FileText, Calendar, Bot, Monitor, HardDrive,
  Download, Apple, MonitorDot, ArrowRight,
  Plus, Bold, Italic, List, Heading,
  Tag, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import { OpenDockLogo } from "@/components/opendock-logo";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";
import { OPENDOCK_FEATURES } from "@/lib/constants";
import { OpenDockAppMock } from "@/components/home/opendock-mock";

// ── Data ──

const opendockBenchmarks: BenchmarkGroup[] = [
  { metric: "Memory Usage (Idle)", ours: { label: "OpenDock", value: 30 }, theirs: { label: "Notion", value: 450 }, unit: " MB", lowerIsBetter: true },
  { metric: "Memory Usage (Active)", ours: { label: "OpenDock", value: 65 }, theirs: { label: "Notion", value: 680 }, unit: " MB", lowerIsBetter: true },
  { metric: "App Binary Size", ours: { label: "OpenDock", value: 18 }, theirs: { label: "Notion", value: 380 }, unit: " MB", lowerIsBetter: true },
  { metric: "Startup Time", ours: { label: "OpenDock", value: 0.4 }, theirs: { label: "Notion", value: 3.2 }, unit: "s", lowerIsBetter: true },
  { metric: "CPU Usage (Idle)", ours: { label: "OpenDock", value: 0.3 }, theirs: { label: "Notion", value: 4.5 }, unit: "%", lowerIsBetter: true },
  { metric: "Works Offline", ours: { label: "OpenDock", value: 100 }, theirs: { label: "Notion", value: 20 }, unit: "%", lowerIsBetter: false },
];

const iconMap = { Kanban, FileText, Bot, Calendar, Monitor, HardDrive } as const;

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
};

// ── Users ──

const USERS = {
  noah: { id: "N", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Noah&top=shortCurly&clothing=hoodie&clothesColor=6366f1&skinColor=f8d25c", color: "#6366f1" },
  trevor: { id: "T", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Trevor&top=shortFlat&facialHair=beardLight&clothing=blazerAndShirt&skinColor=edb98a", color: "#8b5cf6" },
  riley: { id: "R", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Riley&top=shortWaved&clothing=graphicShirt&clothesColor=0ea5e9&skinColor=f8d25c", color: "#0ea5e9" },
  quinn: { id: "Q", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Quinn&top=dreads01&facialHair=beardMedium&clothing=hoodie&clothesColor=f59e0b&skinColor=ae5d29", color: "#f59e0b" },
};

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
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-[590] tracking-[-0.022em] leading-[1.12] text-foreground whitespace-pre-line">
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

// ── Hero ──

function OpenDockHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-6">
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-4"
        >
          <OpenDockLogo size={48} />
        </motion.div>

        <motion.h1
          className="text-[clamp(2.75rem,7vw,5.5rem)] font-[590] tracking-[-0.022em] leading-[1.08]"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <span className="text-foreground">OpenDock</span>
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-foreground-muted"
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeUp}
        >
          Productivity suite, built for performance.
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:opacity-90 shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
          >
            <Download size={14} />
            Download
          </a>
          <a
            href="#features"
            className="group inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            See what&apos;s inside
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ── Hero App Mock ──

function HeroAppSection() {
  return (
    <section className="relative pt-16 pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        >
          <div className="relative overflow-hidden rounded-xl">
            <OpenDockAppMock height="640px" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/40 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/40 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── 1.0 Boards (Kanban) ──

function BoardsReplica() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const columns = [
    {
      title: "Backlog", color: "#525252", count: 3,
      tickets: [
        { id: "OD-18", title: "Export board to CSV", priority: "#4ade80", tags: ["feature"] },
        { id: "OD-19", title: "Keyboard shortcuts panel", priority: "#fbbf24", tags: ["ux"] },
        { id: "OD-20", title: "Bulk ticket operations", priority: "#fbbf24", tags: ["feature"] },
      ],
    },
    {
      title: "To Do", color: "#60a5fa", count: 2,
      tickets: [
        { id: "OD-15", title: "Sprint velocity chart", priority: "#f87171", tags: ["analytics"] },
        { id: "OD-16", title: "Board member permissions", priority: "#fbbf24", tags: ["backend"] },
      ],
    },
    {
      title: "In Progress", color: "#fbbf24", count: 2,
      tickets: [
        { id: "OD-12", title: "Drag-and-drop reorder", priority: "#f87171", tags: ["frontend"] },
        { id: "OD-13", title: "Time tracking widget", priority: "#fbbf24", tags: ["feature"] },
      ],
    },
    {
      title: "Done", color: "#4ade80", count: 3,
      tickets: [
        { id: "OD-9", title: "SSE real-time sync", priority: "#f87171", tags: ["backend"] },
        { id: "OD-10", title: "Label management", priority: "#4ade80", tags: ["frontend"] },
        { id: "OD-11", title: "Sprint planning view", priority: "#fbbf24", tags: ["feature"] },
      ],
    },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden w-full mx-auto"
      style={{ background: "#0a0a0a", border: "1px solid #1e1e1e" }}
    >
      {/* Board header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <div className="flex items-center gap-3">
          <Kanban size={14} style={{ color: "#a78bfa" }} />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#e5e5e5" }}>Product Roadmap</span>
          <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
            Sprint 4
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {Object.values(USERS).map((u) => (
              <div key={u.color} className="w-5 h-5 rounded-full overflow-hidden" style={{ border: "2px solid #0a0a0a", background: u.color + "33" }}>
                <img src={u.avatar} alt="" className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="flex gap-3 p-4" style={{ minHeight: "360px" }}>
        {columns.map((col, ci) => (
          <div
            key={col.title}
            className="flex-1 min-w-0"
            onMouseEnter={() => setHoveredCol(ci)}
            onMouseLeave={() => setHoveredCol(null)}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{ width: 8, height: 8, background: col.color }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#e5e5e5" }}>{col.title}</span>
                <span style={{ fontSize: "10px", color: "#525252" }}>{col.count}</span>
              </div>
              <motion.div animate={{ opacity: hoveredCol === ci ? 1 : 0 }}>
                <Plus size={12} style={{ color: "#525252" }} />
              </motion.div>
            </div>
            {col.tickets.map((t) => (
              <div
                key={t.id}
                className="rounded-lg p-3 mb-2"
                style={{ background: "#161616", border: "1px solid #1e1e1e" }}
              >
                <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#525252" }}>{t.id}</span>
                <p style={{ fontSize: "12px", color: "#e5e5e5", lineHeight: 1.4, margin: "4px 0 8px" }}>
                  {t.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="rounded-full" style={{ width: 6, height: 6, background: t.priority }} />
                  {t.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardsSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="1.0"
          label="Boards"
          title={"Project management\nthat gets out of your way."}
          description="Full kanban boards with sprints, epics, labels, time tracking, and real-time sync via SSE. Drag tickets between columns, bulk edit, and track velocity — all running locally with zero latency."
        />

        <ScrollReveal>
          <BoardsReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "1.1", label: "Drag & drop" },
            { number: "1.2", label: "Sprint planning" },
            { number: "1.3", label: "Time tracking" },
            { number: "1.4", label: "Real-time SSE sync" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 2.0 Notes ──

function NotesReplica() {
  const [cursorPos, setCursorPos] = useState(0);
  const fullText = "OpenDock keeps everything local. Your notes, boards, and calendar data live on your machine in a SQLite database. No cloud dependency, no data harvesting, no subscription required to access your own work.";
  const hasMounted = useRef(false);

  useEffect(() => { hasMounted.current = true; }, []);

  useEffect(() => {
    if (cursorPos >= fullText.length) return;
    const timeout = setTimeout(() => {
      setCursorPos((p) => Math.min(p + 1, fullText.length));
    }, 25 + Math.random() * 30);
    return () => clearTimeout(timeout);
  }, [cursorPos, fullText.length]);

  const folders = [
    { name: "Engineering", color: "#6366f1", count: 8 },
    { name: "Design", color: "#0ea5e9", count: 5 },
    { name: "Research", color: "#f59e0b", count: 3 },
  ];

  const notes = [
    { title: "Architecture Decision Record", date: "Mar 14", pinned: true },
    { title: "API Design Principles", date: "Mar 12", pinned: false },
    { title: "Sprint 4 Retro Notes", date: "Mar 10", pinned: false },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto"
      style={{ background: "#0a0a0a", border: "1px solid #1e1e1e" }}
    >
      <div className="flex" style={{ height: "420px" }}>
        {/* Note list sidebar */}
        <div className="flex-shrink-0 hidden md:block" style={{ width: "220px", borderRight: "1px solid #1e1e1e" }}>
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #1e1e1e" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#e5e5e5" }}>Notes</span>
          </div>
          {/* Folders */}
          <div className="px-2 pt-2">
            {folders.map((f) => (
              <div key={f.name} className="flex items-center justify-between px-2 py-1.5 rounded">
                <div className="flex items-center gap-2">
                  <div className="rounded" style={{ width: 6, height: 6, background: f.color }} />
                  <span style={{ fontSize: "12px", color: "#a3a3a3" }}>{f.name}</span>
                </div>
                <span style={{ fontSize: "10px", color: "#525252" }}>{f.count}</span>
              </div>
            ))}
          </div>
          <div className="mx-3 my-2" style={{ height: 1, background: "#1e1e1e" }} />
          {/* Recent notes */}
          <div className="px-2">
            {notes.map((n, i) => (
              <div
                key={n.title}
                className="px-2 py-2 rounded"
                style={{ background: i === 0 ? "rgba(167,139,250,0.08)" : "transparent", cursor: "pointer" }}
              >
                <div className="flex items-center gap-1">
                  {n.pinned && <Tag size={8} style={{ color: "#a78bfa" }} />}
                  <span style={{ fontSize: "11px", fontWeight: i === 0 ? 500 : 400, color: i === 0 ? "#e5e5e5" : "#a3a3a3" }}>
                    {n.title}
                  </span>
                </div>
                <span style={{ fontSize: "10px", color: "#525252", marginTop: "2px", display: "block" }}>{n.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: "1px solid #1e1e1e" }}>
            {[Heading, Bold, Italic, List].map((Icon, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded"
                style={{ width: 28, height: 28, background: i === 0 ? "rgba(255,255,255,0.06)" : "transparent" }}
              >
                <Icon size={14} style={{ color: i === 0 ? "#e5e5e5" : "#525252" }} />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-4">
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#e5e5e5", marginBottom: "16px" }}>
              Architecture Decision Record
            </h2>
            <div style={{ fontSize: "13px", color: "#a3a3a3", lineHeight: 1.7 }}>
              <p style={{ marginBottom: "12px" }}>
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>Status:</span> Accepted
              </p>
              <p style={{ marginBottom: "12px" }}>
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>Context:</span> We need a local-first architecture that works offline and syncs when connected.
              </p>
              <p>
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>Decision:</span>{" "}
                <span>{fullText.slice(0, cursorPos)}</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ color: "#a78bfa", fontWeight: 300 }}
                >
                  |
                </motion.span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotesSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="2.0"
          label="Notes"
          title={"Write alongside\nyour work."}
          description="Markdown-powered notes with folders, collections, and tags — living right next to your boards. Pin important docs, organize by project, and never context-switch to find what you wrote down."
        />

        <ScrollReveal>
          <NotesReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "2.1", label: "Markdown editing" },
            { number: "2.2", label: "Folders & collections" },
            { number: "2.3", label: "Tag system" },
            { number: "2.4", label: "Pin & archive" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 3.0 Claude AI ──

function ClaudeReplica() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "user", text: "What tickets are assigned to me in Sprint 4?" },
  ]);
  const [phase, setPhase] = useState(0);
  const [typingText, setTypingText] = useState("");

  const responses = [
    "You have 3 tickets assigned in Sprint 4:\n\n| Ticket | Title | Status | Priority |\n|--------|-------|--------|----------|\n| OD-7 | Sprint planning view | In Progress | High |\n| OD-10 | Build notification system | To Do | High |\n| OD-4 | Board snapshot API | Done | Medium |\n\nTwo are high priority. OD-7 is actively in progress.",
    "Sure! I moved OD-10 to In Progress and updated the priority to urgent. The board has been updated in real time.",
    "Done. I created 3 tickets in the Backlog:\n- OD-21: WebSocket migration\n- OD-22: Offline sync engine\n- OD-23: Conflict resolution\n\nAll tagged with 'infrastructure' and assigned to you.",
  ];

  const followUps = [
    "Move OD-10 to In Progress and mark it as urgent",
    "Create tickets for the offline sync feature — websocket migration, sync engine, and conflict resolution",
  ];

  useEffect(() => {
    if (phase >= responses.length) return;

    const assistantText = responses[phase];
    let charIdx = 0;

    const typeInterval = setInterval(() => {
      charIdx++;
      setTypingText(assistantText.slice(0, charIdx));
      if (charIdx >= assistantText.length) {
        clearInterval(typeInterval);
        // Add the completed assistant message
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "assistant" as const, text: assistantText }]);
          setTypingText("");

          // Add follow-up user message after a pause
          if (phase < followUps.length) {
            setTimeout(() => {
              setMessages((prev) => [...prev, { role: "user" as const, text: followUps[phase] }]);
              setPhase((p) => p + 1);
            }, 3000);
          }
        }, 500);
      }
    }, 15);

    return () => clearInterval(typeInterval);
  }, [phase]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[620px] mx-auto"
      style={{ background: "#0a0a0a", border: "1px solid #1e1e1e" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <Bot size={14} style={{ color: "#a78bfa" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#e5e5e5" }}>Claude</span>
        <div className="flex items-center gap-1 ml-auto">
          <div className="rounded-full" style={{ width: 6, height: 6, background: "#4ade80" }} />
          <span style={{ fontSize: "10px", color: "#737373" }}>Connected</span>
        </div>
      </div>

      {/* Messages */}
      <div className="px-3 py-3 flex flex-col gap-2" style={{ minHeight: "320px", maxHeight: "420px", overflowY: "auto" }}>
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="rounded-lg px-3 py-2"
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: msg.role === "user" ? "#a78bfa" : "#161616",
                color: msg.role === "user" ? "#000" : "#e5e5e5",
                fontSize: "12px",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {typingText && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg px-3 py-2"
            style={{
              alignSelf: "flex-start",
              maxWidth: "85%",
              background: "#161616",
              color: "#e5e5e5",
              fontSize: "12px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {typingText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ color: "#a78bfa" }}
            >
              |
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
          style={{ background: "#111111", border: "1px solid #1e1e1e" }}
        >
          <span style={{ fontSize: "12px", color: "#525252", flex: 1 }}>Ask Claude anything...</span>
          <Sparkles size={14} style={{ color: "#a78bfa" }} />
        </div>
      </div>
    </div>
  );
}

function ClaudeSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="3.0"
          label="Claude AI"
          title={"AI that knows\nyour workspace."}
          description="Claude lives inside OpenDock with full context on your boards, notes, and calendar. Ask it to move tickets, create tasks, summarize sprints, or draft notes — it acts directly on your data, not just in chat."
        />

        <ScrollReveal>
          <ClaudeReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "3.1", label: "Board actions" },
            { number: "3.2", label: "Note drafting" },
            { number: "3.3", label: "Sprint summaries" },
            { number: "3.4", label: "Natural language" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 4.0 Calendar ──

function CalendarReplica() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"];

  const events = [
    { day: 0, start: 0, span: 1, title: "Standup", color: "#6366f1" },
    { day: 1, start: 1, span: 2, title: "Sprint Planning", color: "#a78bfa" },
    { day: 2, start: 0, span: 1, title: "Standup", color: "#6366f1" },
    { day: 2, start: 3, span: 1, title: "Design Review", color: "#0ea5e9" },
    { day: 3, start: 2, span: 2, title: "OD-7 Due", color: "#f87171" },
    { day: 4, start: 0, span: 1, title: "Standup", color: "#6366f1" },
    { day: 4, start: 4, span: 2, title: "Retro", color: "#f59e0b" },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[800px] mx-auto"
      style={{ background: "#0a0a0a", border: "1px solid #1e1e1e" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <div className="flex items-center gap-3">
          <Calendar size={14} style={{ color: "#a78bfa" }} />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#e5e5e5" }}>March 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>Week</span>
          <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", color: "#525252" }}>Month</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex">
        {/* Time column */}
        <div className="flex-shrink-0" style={{ width: "50px" }}>
          <div style={{ height: "32px" }} />
          {hours.map((h) => (
            <div key={h} className="flex items-start justify-end pr-2" style={{ height: "48px" }}>
              <span style={{ fontSize: "9px", color: "#525252", fontFamily: "monospace" }}>{h}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, di) => (
          <div key={day} className="flex-1 min-w-0" style={{ borderLeft: "1px solid #1e1e1e" }}>
            <div className="text-center py-2" style={{ height: "32px", borderBottom: "1px solid #1e1e1e" }}>
              <span style={{ fontSize: "11px", fontWeight: 500, color: di === 2 ? "#a78bfa" : "#737373" }}>{day}</span>
            </div>
            <div className="relative" style={{ height: `${hours.length * 48}px` }}>
              {events
                .filter((e) => e.day === di)
                .map((e, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1 right-1 rounded px-1.5 py-1 overflow-hidden"
                    style={{
                      top: `${e.start * 48 + 2}px`,
                      height: `${e.span * 48 - 4}px`,
                      background: e.color + "20",
                      borderLeft: `2px solid ${e.color}`,
                    }}
                    initial={{ opacity: 0, scaleY: 0.8 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <span style={{ fontSize: "9px", fontWeight: 500, color: e.color }}>{e.title}</span>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="4.0"
          label="Calendar"
          title={"Deadlines, meetings,\nand milestones."}
          description="A calendar that links to your board tickets. See sprint deadlines, due dates, and team events in week or month view. Events are color-coded and filterable — everything you need, nothing you don't."
        />

        <ScrollReveal>
          <CalendarReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "4.1", label: "Week & month view" },
            { number: "4.2", label: "Ticket deadlines" },
            { number: "4.3", label: "Color-coded events" },
            { number: "4.4", label: "Quick create" },
          ]}
        />
      </div>
    </section>
  );
}

function FeatureSections() {
  return (
    <div id="features">
      <BoardsSection />
      <NotesSection />
      <ClaudeSection />
      <CalendarSection />
    </div>
  );
}

// ── Feature Grid ──

function FeatureGrid() {
  return (
    <section className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <p className="overline mb-4">Details</p>
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-[590] tracking-[-0.022em] leading-[1.12] max-w-2xl">
            Everything in one dock.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
          {OPENDOCK_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
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

function OpenDockBenchmarks() {
  return (
    <BenchmarkSection
      subtitle="Performance"
      title="A productivity app that doesn't eat your productivity."
      description="OpenDock uses less memory than Notion's loading screen. Starts in under half a second, runs offline, and never phones home. Built with Tauri and Rust — no Electron, no web wrapper."
      benchmarks={opendockBenchmarks}
      statCards={[
        { value: "15×", label: "Less memory", detail: "30 MB vs 450 MB idle" },
        { value: "21×", label: "Smaller install", detail: "18 MB vs 380 MB" },
        { value: "8×", label: "Faster startup", detail: "0.4s vs 3.2s" },
        { value: "100%", label: "Offline capable", detail: "Full functionality" },
      ]}
    />
  );
}

// ── Tech Specs ──

function TechSpecs() {
  const specs = [
    { label: "Desktop Framework", value: "Tauri 2 (Rust)" },
    { label: "Frontend", value: "React 19 + TypeScript" },
    { label: "State Management", value: "Zustand" },
    { label: "Database", value: "SQLite (local)" },
    { label: "Backend", value: "Rust (Axum)" },
    { label: "Build Tool", value: "Vite" },
    { label: "AI Integration", value: "Claude (Anthropic)" },
    { label: "Real-Time Sync", value: "Server-Sent Events" },
    { label: "Editor", value: "Lexical (Rich Text)" },
    { label: "DnD", value: "@hello-pangea/dnd" },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="6.0"
          label="Specifications"
          title={"Under the hood."}
          description="OpenDock is built on Tauri with a Rust backend and SQLite for local-first storage. The frontend is React 19 with TypeScript — fast, typed, and minimal."
        />

        <ScrollReveal>
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-4">
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

        <SubFeatures
          items={[
            { number: "6.1", label: "Tauri (no Electron)" },
            { number: "6.2", label: "Rust backend" },
            { number: "6.3", label: "Local SQLite" },
            { number: "6.4", label: "Claude AI built in" },
          ]}
        />
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
      const hasOpenDock = subsData.subscriptions?.some((s: { product: string }) => s.product === "opendock");
      setAuthState(hasOpenDock ? "active" : "no-sub");
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
    <section id="download" className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-[clamp(2.75rem,5vw,4.5rem)] font-[590] tracking-[-0.022em] leading-[1.1]">
            <span className="text-foreground">Ship faster. </span>
            <span className="text-foreground-muted">The productivity suite that actually feels productive.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:opacity-90 shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
            >
              <Apple size={14} />
              {ctaLabel}
            </button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground-muted text-sm rounded-full hover:text-foreground hover:border-foreground/20 hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-150"
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

export default function OpenDockPage() {
  return (
    <PageTransition>
      <OpenDockHero />
      <HeroAppSection />
      <FeatureSections />
      <FeatureGrid />
      <OpenDockBenchmarks />
      <TechSpecs />
      <DownloadCTA />
    </PageTransition>
  );
}
