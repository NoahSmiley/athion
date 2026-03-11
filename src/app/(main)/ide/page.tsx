"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Terminal, Minus, Gauge, ArrowRight, Code2, Layers, Cpu, Zap, GitBranch, Check, ChevronRight, ChevronDown, Plus, Search, Grid3X3, Smile, Settings, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";

// ── Data ──

const ideBenchmarks: BenchmarkGroup[] = [
  { metric: "Cold Start Time", ours: { label: "Liminal IDE", value: 80 }, theirs: { label: "VS Code", value: 920 }, unit: "ms", lowerIsBetter: true },
  { metric: "Memory Usage (Idle)", ours: { label: "Liminal IDE", value: 45 }, theirs: { label: "VS Code", value: 550 }, unit: " MB", lowerIsBetter: true },
  { metric: "Memory (Large Project)", ours: { label: "Liminal IDE", value: 120 }, theirs: { label: "VS Code", value: 1400 }, unit: " MB", lowerIsBetter: true },
  { metric: "CPU Usage (Idle)", ours: { label: "Liminal IDE", value: 0.3 }, theirs: { label: "VS Code", value: 4.2 }, unit: "%", lowerIsBetter: true },
  { metric: "Binary Size", ours: { label: "Liminal IDE", value: 8 }, theirs: { label: "VS Code", value: 350 }, unit: " MB", lowerIsBetter: true },
  { metric: "File Open Time (10K lines)", ours: { label: "Liminal IDE", value: 12 }, theirs: { label: "VS Code", value: 85 }, unit: "ms", lowerIsBetter: true },
];

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
};

// ── Liminal IDE colors (from screenshots) ──

const C = {
  bg: "#0a0e14",
  bgPanel: "#0d1117",
  bgElevated: "#131920",
  border: "#1a2030",
  text: "#c5cdd8",
  textMuted: "#5c6a7a",
  textBright: "#e0e6ed",
  accent: "#4ec9b0",
  orange: "#e8a838",
  white: "#ffffff",
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

// ── Liminal Icon Rail (left edge, ~30px) ──

function LiminalIconRail({ activeIcon }: { activeIcon: "code" | "chat" | "terminal" }) {
  const icons = [
    { id: "new", el: <Plus size={14} /> },
    { id: "code", el: <span style={{ fontSize: "11px", fontWeight: 700 }}>&lt;/&gt;</span> },
    { id: "grid", el: <Grid3X3 size={14} /> },
    { id: "search", el: <Search size={14} /> },
    { id: "fn", el: <span style={{ fontSize: "11px", fontStyle: "italic", fontFamily: "serif" }}>fx</span> },
    { id: "clipboard", el: <span style={{ fontSize: "12px" }}>&#128203;</span> },
  ];

  const bottomIcons = [
    { id: "settings", el: <Settings size={14} /> },
    { id: "terminal", el: <span style={{ fontSize: "12px", fontFamily: "monospace" }}>&gt;_</span> },
    { id: "git", el: <GitBranch size={14} /> },
    { id: "target", el: <Target size={14} /> },
  ];

  return (
    <div
      className="flex-shrink-0 flex-col items-center pt-3 gap-2 hidden md:flex"
      style={{
        width: "32px",
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="flex items-center justify-center rounded-sm"
          style={{
            width: 24,
            height: 24,
            color: icon.id === activeIcon ? C.accent : C.textMuted,
            cursor: "pointer",
            background: icon.id === activeIcon ? `${C.accent}12` : "transparent",
            position: "relative",
          }}
        >
          {icon.id === activeIcon && (
            <div className="absolute left-0 top-1 bottom-1 rounded-r" style={{ width: "2px", background: C.accent, marginLeft: "-4px" }} />
          )}
          {icon.el}
        </div>
      ))}
      <div className="flex-1" />
      {bottomIcons.map((icon) => (
        <div
          key={icon.id}
          className="flex items-center justify-center"
          style={{
            width: 24,
            height: 24,
            color: icon.id === activeIcon ? C.accent : C.textMuted,
            cursor: "pointer",
          }}
        >
          {icon.el}
        </div>
      ))}
      <div style={{ height: 8 }} />
    </div>
  );
}

// ── Liminal File Tree ──

const FILE_TREE_ITEMS = [
  { name: ".claude", type: "folder" as const, expanded: false },
  { name: ".vite", type: "folder" as const, expanded: true, children: [
    { name: "deps_temp_1e2cdd98", type: "folder" as const, expanded: false },
    { name: "deps_temp_b663b425", type: "folder" as const, expanded: true, children: [
      { name: "package.json", modified: true },
    ]},
  ]},
  { name: ".vscode", type: "folder" as const, expanded: false },
  { name: ".gitignore", dotColor: C.accent },
];

function LiminalFileTree() {
  return (
    <div
      className="flex-shrink-0 flex-col hidden md:flex overflow-hidden"
      style={{
        width: "200px",
        background: C.bgPanel,
        borderRight: `1px solid ${C.border}`,
        fontFamily: "monospace",
        fontSize: "13px",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <span style={{ fontSize: "12px", fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em" }}>FILES</span>
        <Plus size={12} style={{ color: C.textMuted }} />
      </div>
      <div className="px-1 flex-1 overflow-hidden">
        <FileTreeNode name=".claude" isFolder expanded={false} depth={0} />
        <FileTreeNode name=".vite" isFolder expanded={true} depth={0}>
          <FileTreeNode name="deps_temp_1e2cdd98" isFolder expanded={false} depth={1} />
          <FileTreeNode name="deps_temp_b663b425" isFolder expanded={true} depth={1}>
            <FileTreeNode name="package.json" depth={2} modified />
          </FileTreeNode>
        </FileTreeNode>
        <FileTreeNode name=".vscode" isFolder expanded={false} depth={0} />
        <FileTreeNode name=".gitignore" depth={0} dotColor={C.accent} />
      </div>
    </div>
  );
}

function FileTreeNode({
  name,
  isFolder,
  expanded,
  depth,
  modified,
  dotColor,
  children,
}: {
  name: string;
  isFolder?: boolean;
  expanded?: boolean;
  depth: number;
  modified?: boolean;
  dotColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div
        className="flex items-center gap-1 py-0.5 cursor-pointer hover:bg-white/5 rounded-sm"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isFolder && (
          expanded
            ? <ChevronDown size={10} style={{ color: C.textMuted, flexShrink: 0 }} />
            : <ChevronRight size={10} style={{ color: C.textMuted, flexShrink: 0 }} />
        )}
        {!isFolder && dotColor && (
          <span style={{ color: dotColor, fontSize: "10px", flexShrink: 0, marginRight: "2px" }}>●</span>
        )}
        {!isFolder && modified && (
          <span style={{ color: C.orange, fontSize: "10px", flexShrink: 0, marginRight: "2px" }}>●</span>
        )}
        {!isFolder && !dotColor && !modified && (
          <span style={{ width: "12px", flexShrink: 0 }} />
        )}
        <span style={{ color: C.text, fontSize: "13px" }}>{name}</span>
      </div>
      {isFolder && expanded && children}
    </>
  );
}

// ── Liminal Tab Bar ──

function LiminalTabBar({ tabs }: { tabs: { name: string; active?: boolean; modified?: boolean; hasBack?: boolean }[] }) {
  return (
    <div
      className="flex items-center gap-0 flex-shrink-0"
      style={{ height: "36px", borderBottom: `1px solid ${C.border}`, background: C.bgPanel }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.name}
          className="flex items-center gap-1.5 px-3 relative"
          style={{
            height: "100%",
            color: tab.active ? C.textBright : C.textMuted,
            borderRight: `1px solid ${C.border}`,
          }}
        >
          {tab.active && (
            <div className="absolute top-0 left-0 right-0" style={{ height: "2px", background: C.white }} />
          )}
          {tab.hasBack && (
            <span style={{ color: C.textMuted, marginRight: "4px", fontSize: "12px" }}>&#8592;</span>
          )}
          {tab.modified && (
            <span style={{ color: C.orange, fontSize: "10px" }}>●</span>
          )}
          <span style={{ fontSize: "13px", fontFamily: "monospace" }}>{tab.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Liminal Breadcrumb ──

function LiminalBreadcrumb({ segments }: { segments: string[] }) {
  return (
    <div
      className="flex items-center gap-1.5 px-4 flex-shrink-0 overflow-hidden"
      style={{
        height: "28px",
        background: C.bgPanel,
        borderBottom: `1px solid ${C.border}`,
        fontSize: "12px",
        fontFamily: "monospace",
        color: C.textMuted,
      }}
    >
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span style={{ color: C.textMuted }}>&#8250;</span>}
          <span style={{ color: i === segments.length - 1 ? C.textBright : C.textMuted }}>{seg}</span>
        </span>
      ))}
    </div>
  );
}

// ── Liminal Status Bar ──

function LiminalStatusBar({ project, ctxPercent, fileName, fileType, model }: {
  project: string;
  ctxPercent: number;
  fileName?: string;
  fileType?: string;
  model: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 flex-shrink-0"
      style={{
        height: "26px",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
        fontSize: "11px",
        fontFamily: "monospace",
        color: C.textMuted,
      }}
    >
      <div className="flex items-center gap-3">
        <span>{project} <span style={{ color: C.accent }}>•</span></span>
        <div className="flex items-center gap-1.5">
          <span>ctx</span>
          <div style={{ width: "60px", height: "4px", background: C.bgElevated, borderRadius: "2px" }}>
            <div style={{ width: `${ctxPercent}%`, height: "100%", background: C.accent, borderRadius: "2px" }} />
          </div>
        </div>
        <span>{ctxPercent}%</span>
      </div>
      <div className="flex items-center gap-3">
        {fileName && <span>{fileName}</span>}
        {fileType && <span>{fileType}</span>}
        <span>{model} <span style={{ color: C.accent }}>•</span></span>
      </div>
    </div>
  );
}

// ── Agent Chat Messages Data ──

const CHAT_MESSAGES = [
  { role: "liminal" as const, text: "Done. Guided mode working yet?" },
  { role: "liminal" as const, parts: [
    { type: "text" as const, text: "" },
    { type: "code" as const, text: "style.css" },
    { type: "text" as const, text: " gives the calculator its visual layout \u2014 the dark background, grid button arrangement, colors for operators and the equals button. Without it the HTML is just unstyled browser elements, basically unusable." },
  ]},
  { role: "liminal" as const, parts: [
    { type: "text" as const, text: "Still need to write " },
    { type: "code" as const, text: "app.js" },
    { type: "text" as const, text: " to finish the rebuild. Want me to continue?" },
  ]},
  { role: "you" as const, text: "what? Im asking why do we need this file" },
  { role: "liminal" as const, parts: [
    { type: "text" as const, text: "Same answer \u2014 " },
    { type: "code" as const, text: "style.css" },
    { type: "text" as const, text: " handles all the visual styling. The dark theme, the grid layout for buttons, the orange operator colors, the rounded corners. It\u2019s what makes it look like a calculator instead of a pile of plain HTML buttons." },
  ]},
  { role: "you" as const, text: "lets delete all these files again sorry" },
  { role: "liminal" as const, text: "Gone. Rebuild?" },
  { role: "you" as const, text: "yes" },
  { role: "you" as const, text: "why do we need this file?" },
  { role: "liminal" as const, parts: [
    { type: "code" as const, text: "index.html" },
    { type: "text" as const, text: " is the entry point of the app \u2014 it defines the structure of the calculator: the display area, the button grid, and links to the CSS and JS files. Without it there\u2019s nothing to load in the browser." },
  ]},
  { role: "liminal" as const, parts: [
    { type: "text" as const, text: "Want me to continue with " },
    { type: "code" as const, text: "style.css" },
    { type: "text" as const, text: " and " },
    { type: "code" as const, text: "app.js" },
    { type: "text" as const, text: "?" },
  ]},
  { role: "you" as const, text: "Yes" },
];

// ── Chat Message Component ──

function ChatMessage({ msg, animDelay }: {
  msg: typeof CHAT_MESSAGES[number];
  animDelay?: number;
}) {
  const isYou = msg.role === "you";

  const renderContent = () => {
    if ("parts" in msg && msg.parts) {
      return (
        <span>
          {msg.parts.map((part, i) => (
            part.type === "code" ? (
              <span
                key={i}
                style={{
                  background: `${C.accent}20`,
                  color: C.accent,
                  padding: "1px 6px",
                  borderRadius: "3px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              >
                {part.text}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            )
          ))}
        </span>
      );
    }
    return <span>{msg.text}</span>;
  };

  if (isYou) {
    return (
      <div className="mb-4">
        <div
          className="px-4 py-3 rounded-lg"
          style={{ background: C.bgElevated, border: `1px solid ${C.border}` }}
        >
          <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "4px", letterSpacing: "0.05em", fontWeight: 600 }}>YOU</div>
          <div style={{ fontSize: "13px", color: C.text, fontFamily: "monospace", lineHeight: 1.6 }}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "4px", letterSpacing: "0.05em", fontWeight: 600 }}>LIMINAL</div>
      <div style={{ fontSize: "13px", color: C.text, fontFamily: "monospace", lineHeight: 1.6 }}>
        {renderContent()}
      </div>
    </div>
  );
}

// ── Hero Replica: Agent Chat Mode ──

function LiminalAgentReplica() {
  const [visibleMsgs, setVisibleMsgs] = useState(8);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  useEffect(() => {
    if (visibleMsgs < CHAT_MESSAGES.length) {
      const timeout = setTimeout(() => {
        setVisibleMsgs((v) => v + 1);
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setVisibleMsgs(6);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [visibleMsgs]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full mx-auto"
      style={{ background: C.bg, border: `1px solid ${C.border}` }}
    >
      {/* Settings icon centered at top */}
      <div className="flex items-center justify-center py-2">
        <Settings size={14} style={{ color: C.textMuted }} />
      </div>

      <div className="flex" style={{ height: "640px" }}>
        {/* Icon rail */}
        <LiminalIconRail activeIcon="chat" />

        {/* File tree */}
        <LiminalFileTree />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col gap-0 justify-end">
            <AnimatePresence initial={false} mode="popLayout">
              {CHAT_MESSAGES.slice(0, visibleMsgs).map((msg, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={hasMounted.current ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <ChatMessage msg={msg} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
              style={{ background: C.bgElevated, border: `1px solid ${C.border}` }}
            >
              <span className="flex-1" style={{ fontSize: "13px", color: C.textMuted, fontFamily: "monospace" }}>
                message liminal
              </span>
              <Smile size={16} style={{ color: C.textMuted }} />
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <LiminalStatusBar project="test2" ctxPercent={5} model="opus" />
    </div>
  );
}

// ── Editor Mode Replica ──

function LiminalEditorReplica() {
  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto"
      style={{ background: C.bg, border: `1px solid ${C.border}`, height: "480px" }}
    >
      {/* Settings icon centered at top */}
      <div className="flex items-center justify-center py-2">
        <Settings size={14} style={{ color: C.textMuted }} />
      </div>

      <div className="flex" style={{ height: "calc(100% - 26px - 28px)" }}>
        {/* Icon rail */}
        <LiminalIconRail activeIcon="code" />

        {/* File tree */}
        <LiminalFileTree />

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab bar */}
          <LiminalTabBar tabs={[
            { name: ".gitignore", hasBack: true, modified: false },
            { name: "package.json", active: true, modified: true },
          ]} />

          {/* Breadcrumb */}
          <LiminalBreadcrumb segments={["Users", "noahsmile", "test2", ".", ".vite", "deps_temp_b663b425", "package.json"]} />

          {/* Code editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers */}
            <div className="flex-shrink-0 pt-3 select-none" style={{ width: "44px", borderRight: `1px solid ${C.border}` }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="text-right pr-3" style={{ fontSize: "13px", lineHeight: "22px", color: C.textMuted, fontFamily: "monospace" }}>
                  {n}
                </div>
              ))}
            </div>

            {/* Code content */}
            <div className="flex-1 pt-3 pl-4" style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "22px", color: C.text }}>
              <div>
                <span style={{ color: C.text }}>{"{"}</span>
                <span style={{ color: C.textMuted, marginLeft: "6px", fontSize: "10px" }}>&#8964;</span>
              </div>
              <div>{"    "}<span style={{ color: C.accent }}>&quot;type&quot;</span>: <span style={{ color: C.accent }}>&quot;module&quot;</span></div>
              <div><span style={{ color: C.text }}>{"}"}</span></div>
              <div />
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <LiminalStatusBar project="test2" ctxPercent={5} fileName="package.json" fileType="JSON" model="opus" />
    </div>
  );
}

// ── Terminal Mode Replica ──

const TERMINAL_OUTPUT = [
  { type: "cmd" as const, text: "cargo run --release" },
  { type: "out" as const, text: "   Compiling liminal-core v0.1.0" },
  { type: "out" as const, text: "   Compiling liminal-editor v0.1.0" },
  { type: "ok" as const, text: "    Finished release in 2.4s" },
  { type: "ok" as const, text: "     Running target/release/liminal" },
  { type: "ok" as const, text: "  \u2713 GPU renderer initialized" },
  { type: "ok" as const, text: "  \u2713 Tree-sitter grammars loaded" },
  { type: "ok" as const, text: "  \u2713 LSP client ready" },
  { type: "ok" as const, text: "  Editor ready in 80ms" },
];

function LiminalTerminalReplica() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    if (visibleLines < TERMINAL_OUTPUT.length) {
      const line = TERMINAL_OUTPUT[visibleLines];
      const delay = line.type === "cmd" ? 600 : 200 + Math.random() * 150;
      const timeout = setTimeout(() => setVisibleLines((v) => v + 1), delay);
      return () => clearTimeout(timeout);
    } else if (!looping) {
      const timeout = setTimeout(() => {
        setLooping(true);
        setVisibleLines(0);
        setTimeout(() => setLooping(false), 100);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines, looping]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto"
      style={{ background: C.bg, border: `1px solid ${C.border}`, height: "480px" }}
    >
      {/* Settings icon centered at top */}
      <div className="flex items-center justify-center py-2">
        <Settings size={14} style={{ color: C.textMuted }} />
      </div>

      <div className="flex" style={{ height: "calc(100% - 26px - 28px)" }}>
        {/* Icon rail */}
        <LiminalIconRail activeIcon="terminal" />

        {/* File tree */}
        <LiminalFileTree />

        {/* Terminal area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Terminal header */}
          <div
            className="flex items-center gap-2 px-4 flex-shrink-0"
            style={{ height: "36px", borderBottom: `1px solid ${C.border}`, background: C.bgPanel }}
          >
            <Terminal size={12} style={{ color: C.accent }} />
            <span style={{ fontSize: "12px", color: C.textMuted, fontFamily: "monospace" }}>terminal</span>
          </div>

          {/* Terminal content */}
          <div className="flex-1 p-4 overflow-hidden" style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "22px" }}>
            {TERMINAL_OUTPUT.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={`${i}-${looping}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {line.type === "cmd" ? (
                  <><span style={{ color: C.accent }}>&#10095;</span> <span style={{ color: C.textBright }}>{line.text}</span></>
                ) : (
                  <span style={{ color: line.type === "ok" ? C.accent : C.textMuted }}>{line.text}</span>
                )}
              </motion.div>
            ))}
            {visibleLines >= TERMINAL_OUTPUT.length && (
              <div>
                <span style={{ color: C.accent }}>&#10095;</span>{" "}
                <span style={{ display: "inline-block", width: "7px", height: "14px", background: C.accent, animation: "cursor-blink 1s step-end infinite" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <LiminalStatusBar project="test2" ctxPercent={5} model="opus" />

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Hero Section Wrapper ──

function HeroAppSection() {
  return (
    <section className="relative pt-16 pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="relative overflow-hidden rounded-xl">
            <LiminalAgentReplica />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/40 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/40 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Hero ──

function IDEHero() {
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
          <span className="font-mono text-4xl text-accent">&gt;_</span>
        </motion.div>

        <motion.h1
          className="text-[clamp(2.75rem,7vw,5.5rem)] font-medium tracking-[-0.025em] leading-[1.08]"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <span className="text-foreground">Liminal IDE</span>
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-foreground-muted max-w-lg leading-relaxed"
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeUp}
        >
          A code editor that stays out of your way. AI-native intelligence
          meets terminal-first workflow, built entirely in Rust.
        </motion.p>

        <motion.div
          className="mt-6 inline-block px-3 py-1 border border-accent/30 text-accent text-xs uppercase tracking-widest"
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={fadeUp}
        >
          Coming Soon
        </motion.div>
      </div>
    </section>
  );
}

// ── 1.0 AI-Native Intelligence ──

function AISection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="1.0"
          label="Intelligence"
          title={"AI that understands\nyour entire codebase."}
          description="Deep language model integration that goes beyond autocomplete. Contextual refactoring, codebase-aware suggestions, and inline explanations — all running locally on your machine."
        />

        <ScrollReveal>
          <LiminalEditorReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "1.1", label: "Codebase-aware context" },
            { number: "1.2", label: "Inline refactoring" },
            { number: "1.3", label: "Local inference" },
            { number: "1.4", label: "Smart completions" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 2.0 Terminal ──

function TerminalSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="2.0"
          label="Terminal"
          title={"Your terminal,\nbuilt into the editor."}
          description="Integrated terminal with multiplexing, split panes, and shell integration. Run builds, tests, and servers without leaving the editor. Never context-switch again."
        />

        <ScrollReveal>
          <LiminalTerminalReplica />
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "2.1", label: "Split panes" },
            { number: "2.2", label: "Shell integration" },
            { number: "2.3", label: "Multiplexing" },
            { number: "2.4", label: "Task runner" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 3.0 Performance ──

function PerformanceSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="3.0"
          label="Performance"
          title={"Native Rust core.\nInstant at any scale."}
          description="Opens in under 100ms. Handles million-line codebases without breaking a sweat. Your editor should use a fraction of the memory and CPU that Electron-based tools demand."
        />

        <ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { value: "80ms", label: "Cold start", detail: "vs 920ms VS Code" },
              { value: "45 MB", label: "Memory (idle)", detail: "vs 550 MB VS Code" },
              { value: "8 MB", label: "Binary size", detail: "vs 350 MB VS Code" },
              { value: "0.3%", label: "CPU (idle)", detail: "vs 4.2% VS Code" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-mono text-3xl sm:text-4xl text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-foreground-muted mt-1.5">{stat.label}</p>
                <p className="text-[10px] text-foreground-muted/50 mt-0.5">{stat.detail}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <SubFeatures
          items={[
            { number: "3.1", label: "Rust core" },
            { number: "3.2", label: "GPU rendering" },
            { number: "3.3", label: "Async I/O" },
            { number: "3.4", label: "Tree-sitter parsing" },
          ]}
        />
      </div>
    </section>
  );
}

// ── Feature Grid ──

const GRID_FEATURES = [
  { icon: Sparkles, title: "AI-Native", description: "Deep language model integration that understands your entire codebase." },
  { icon: Terminal, title: "Terminal First", description: "Built-in terminal with multiplexing. Never leave the editor." },
  { icon: Minus, title: "Minimal UI", description: "No visual noise. The code is the interface." },
  { icon: Gauge, title: "Instant Startup", description: "Native Rust core. Opens in under 100ms." },
  { icon: Code2, title: "Language Server", description: "First-class LSP support for every language." },
  { icon: GitBranch, title: "Git Integration", description: "Built-in diff viewer, blame, and branch management." },
  { icon: Layers, title: "Multi-Buffer", description: "Work across files simultaneously with split views." },
  { icon: Cpu, title: "GPU Rendered", description: "Hardware-accelerated text rendering for smooth scrolling." },
  { icon: Zap, title: "Async I/O", description: "Non-blocking file operations. Never wait for disk." },
];

function FeatureGrid() {
  return (
    <section className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.08em] text-foreground-muted/50 mb-4">Details</p>
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-medium tracking-[-0.025em] leading-[1.12] max-w-2xl">
            Every detail, considered.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
          {GRID_FEATURES.map((feature) => {
            const Icon = feature.icon;
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

function IDEBenchmarks() {
  return (
    <BenchmarkSection
      subtitle="Performance"
      title="Your editor shouldn't need 2 GB of RAM."
      description="Open instantly. Stay fast at any project size. Use a fraction of the memory and CPU that other editors demand — so your machine can focus on building, not babysitting your tools."
      benchmarks={ideBenchmarks}
      statCards={[
        { value: "11\u00d7", label: "Faster startup", detail: "80ms vs 920ms cold start" },
        { value: "12\u00d7", label: "Less memory", detail: "45 MB vs 550 MB idle" },
        { value: "44\u00d7", label: "Smaller binary", detail: "8 MB vs 350 MB" },
        { value: "7\u00d7", label: "Faster file open", detail: "12ms vs 85ms for 10K lines" },
      ]}
    />
  );
}

// ── Tech Specs (4.0) ──

function TechSpecs() {
  const specs = [
    { label: "Language", value: "Rust" },
    { label: "Renderer", value: "GPU (wgpu)" },
    { label: "Parser", value: "Tree-sitter" },
    { label: "LSP Support", value: "Native" },
    { label: "Terminal", value: "Built-in (PTY)" },
    { label: "Config Format", value: "TOML" },
    { label: "Plugin System", value: "WASM" },
    { label: "Text Engine", value: "Rope (xi-rope)" },
    { label: "AI Runtime", value: "ONNX (local)" },
    { label: "Platforms", value: "macOS / Windows / Linux" },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="4.0"
          label="Specifications"
          title={"Under the hood."}
          description="Liminal is built from scratch in Rust with GPU-accelerated rendering, tree-sitter parsing, and native LSP support. No Electron, no compromises."
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
            { number: "4.1", label: "Zero Electron" },
            { number: "4.2", label: "WASM plugins" },
            { number: "4.3", label: "GPU rendering" },
            { number: "4.4", label: "Local AI inference" },
          ]}
        />
      </div>
    </section>
  );
}

// ── Waitlist CTA ──

function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join waitlist");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-[clamp(2.75rem,5vw,4.5rem)] font-medium tracking-[-0.025em] leading-[1.1]">
            <span className="text-foreground">Join the waitlist. </span>
            <span className="text-foreground-muted">Be the first to know when Liminal IDE is ready.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          {submitted ? (
            <div className="mt-8 p-6 border border-accent/30 text-accent text-sm max-w-md">
              Thank you. We&apos;ll be in touch.
            </div>
          ) : (
            <>
              {error && (
                <div className="mt-8 p-3 border border-red-500/30 text-red-400 text-sm max-w-md">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="mt-10 flex gap-3 max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-3 bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors rounded-full"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 rounded-full"
                >
                  {loading ? "Joining..." : "Notify Me"}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </form>
            </>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Page ──

export default function IDEPage() {
  return (
    <PageTransition>
      <IDEHero />
      <HeroAppSection />
      <AISection />
      <TerminalSection />
      <PerformanceSection />
      <FeatureGrid />
      <IDEBenchmarks />
      <TechSpecs />
      <Waitlist />
    </PageTransition>
  );
}
