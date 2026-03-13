"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Terminal, Minus, Gauge, ArrowRight, Code2, Layers, Cpu, Zap, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";

// ── Benchmark Data ──

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
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: EASE } }),
};

// ── Section Header ──

function SectionHeader({ number, label, title, description }: { number: string; label: string; title: string; description: string }) {
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
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-[590] tracking-[-0.022em] leading-[1.12] text-foreground whitespace-pre-line">{title}</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-foreground-muted leading-relaxed lg:pt-2">{description}</p>
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

// ── Exact Liminal IDE Colors (from index.css) ──

const L = {
  bg: "#050507",
  card: "#0a0a0d",
  border: "#1a1a1f",
  panelBorder: "#222228",
  // zinc scale
  z200: "#e4e4e7",
  z300: "#d4d4d8",
  z400: "#a1a1aa",
  z500: "#71717a",
  z600: "#52525b",
  z700: "#3f3f46",
  z800: "#27272a",
  z900: "#18181b",
  // accents
  cyan400: "#22d3ee",
  cyan500: "#06b6d4",
  sky400: "#38bdf8",
  sky500: "#0ea5e9",
  amber500: "#f59e0b",
  purple400: "#c084fc",
  // file type dots
  dotTs: "#38bdf8",
  dotJs: "#fbbf24",
  dotJson: "#eab308",
  dotRs: "#fb923c",
  dotCss: "#c084fc",
  dotHtml: "#f87171",
  dotMd: "#a1a1aa",
  dotGitignore: "#3f3f46",
};

// ══════════════════════════════════════════════════
// LIMINAL IDE REPLICA COMPONENTS
// Pixel-perfect from actual source code
// ══════════════════════════════════════════════════

// ── Activity Bar (42px, from activity-bar.tsx) ──

function ActivityBar({ activeView, activeSidebar }: { activeView: "chat" | "editor" | "terminal" | "settings"; activeSidebar?: "files" | "search" | "git" | null }) {
  const btn = "relative w-[34px] h-[34px] flex items-center justify-center rounded-[3px] mb-0.5";

  const sidebarItems = [
    { id: "files",   label: "\u229E", size: "text-[14px]" },
    { id: "search",  label: "\u2315", size: "text-[21px]" },
    { id: "git",     label: "\u2387", size: "text-[14px]" },
    { id: "plugins", label: "\u29C9", size: "text-[14px]" },
  ];

  return (
    <div
      className="flex flex-col items-center shrink-0 pt-1 pb-2 hidden md:flex"
      style={{ width: "42px", background: L.bg, borderRight: `1px solid ${L.border}30` }}
    >
      {/* Agent / Editor toggle */}
      <div className="flex flex-col items-center gap-0.5 mb-1 px-[3px] w-full">
        <div
          className="w-full h-[34px] flex items-center justify-center rounded-[4px]"
          style={{
            fontSize: "18px",
            background: activeView === "chat" ? `${L.cyan500}15` : "transparent",
            color: activeView === "chat" ? L.cyan400 : L.z600,
          }}
        >
          {"\u2726"}
        </div>
        <div
          className="w-full h-[34px] flex items-center justify-center rounded-[4px] font-mono"
          style={{
            fontSize: "7px",
            background: activeView === "editor" ? `${L.cyan500}15` : "transparent",
            color: activeView === "editor" ? L.cyan400 : L.z600,
          }}
        >
          {"</>"}
        </div>
      </div>

      <div className="mb-1" style={{ width: "20px", borderTop: `1px solid ${L.z800}66` }} />

      {/* Sidebar tabs */}
      {sidebarItems.map((item) => {
        const active = activeSidebar === item.id;
        return (
          <div key={item.id} className={`${btn} ${item.size}`} style={{ color: active ? L.z300 : L.z700 }}>
            {active && <div className="absolute left-0 rounded-r" style={{ top: "6px", bottom: "6px", width: "2px", background: L.z400 }} />}
            {item.label}
          </div>
        );
      })}

      <div className="flex-1" />

      {/* Bottom icons */}
      <div className={`${btn} text-[14px]`} style={{ color: L.z700 }}>{"\u229B"}</div>
      <div className={`${btn} text-[12px] font-mono`} style={{ color: activeView === "terminal" ? L.z300 : L.z700 }}>
        {activeView === "terminal" && <div className="absolute left-0 rounded-r" style={{ top: "6px", bottom: "6px", width: "2px", background: L.z400 }} />}
        {">"}_
      </div>
      <div className={`${btn} text-[15px]`} style={{ color: L.z700 }}>{"\u21CB"}</div>
      <div className={`${btn} text-[15px]`} style={{ color: activeView === "settings" ? L.z300 : L.z700 }}>
        {activeView === "settings" && <div className="absolute left-0 rounded-r" style={{ top: "6px", bottom: "6px", width: "2px", background: L.z400 }} />}
        {"\u2699"}
      </div>
    </div>
  );
}

// ── File Tree (from file-tree.tsx + file-tree-panel.tsx) ──

function LiminalFileTree({ items }: { items: { name: string; isDir?: boolean; expanded?: boolean; depth: number; dotColor?: string; children?: typeof items }[] }) {
  return (
    <div
      className="flex flex-col shrink-0 overflow-hidden hidden md:flex"
      style={{ width: "192px", background: L.bg, borderRight: `1px solid ${L.border}30` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 px-3 pt-2">
        <span style={{ fontSize: "10px", color: L.z600, textTransform: "uppercase", letterSpacing: "0.05em" }}>files</span>
        <span style={{ fontSize: "11px", color: L.z600 }}>+</span>
      </div>
      {/* Tree rows */}
      <div className="px-2 flex-1 overflow-hidden" style={{ fontSize: "12px" }}>
        {items.map((item, i) => (
          <TreeRowRecursive key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

type TreeItem = { name: string; isDir?: boolean; expanded?: boolean; depth: number; dotColor?: string; children?: TreeItem[] };

function TreeRowRecursive({ item }: { item: TreeItem }) {
  return (
    <>
      <div
        className="flex items-center gap-1 px-1 py-0.5 rounded-sm"
        style={{ paddingLeft: `${item.depth * 12 + 4}px` }}
      >
        <span className="shrink-0 text-center" style={{ width: "12px", fontSize: "10px", color: L.z700 }}>
          {item.isDir ? (item.expanded ? "\u25BE" : "\u25B8") : ""}
        </span>
        {!item.isDir && item.dotColor && (
          <span className="shrink-0 rounded-full" style={{ width: "6px", height: "6px", background: item.dotColor, opacity: 0.6 }} />
        )}
        <span className="truncate" style={{ color: L.z500, flex: 1 }}>{item.name}</span>
      </div>
      {item.isDir && item.expanded && item.children?.map((child, i) => (
        <TreeRowRecursive key={i} item={child} />
      ))}
    </>
  );
}

// ── Tab Bar (from tab-bar.tsx) ──

function LiminalTabBar({ tabs }: { tabs: { name: string; active?: boolean; dirty?: boolean; dotColor: string }[] }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto shrink-0" style={{ borderBottom: `1px solid ${L.border}` }}>
      {tabs.map((tab) => (
        <div
          key={tab.name}
          className="relative flex items-center gap-1.5 px-3 py-1.5 shrink-0"
          style={{ color: tab.active ? L.z200 : L.z600 }}
        >
          <span className="shrink-0 rounded-full" style={{ width: "6px", height: "6px", background: tab.dotColor, opacity: tab.active ? 0.8 : 0.4 }} />
          {tab.dirty && <span style={{ fontSize: "8px", color: `${L.amber500}cc` }}>{"\u25CF"}</span>}
          <span className="truncate" style={{ maxWidth: "120px", fontSize: "11px" }}>{tab.name}</span>
          {tab.active && (
            <div className="absolute bottom-0 left-2 right-2" style={{ height: "1px", background: `${L.sky500}80` }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Breadcrumb (from breadcrumb-bar.tsx) ──

function LiminalBreadcrumb({ segments }: { segments: string[] }) {
  return (
    <div
      className="flex items-center gap-0 px-4 py-1.5 overflow-x-auto shrink-0"
      style={{ fontSize: "11px", borderBottom: `1px solid ${L.border}33` }}
    >
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center shrink-0">
          {i > 0 && <span className="mx-1.5" style={{ color: L.z800 }}>{"\u203A"}</span>}
          <span style={{ color: i === segments.length - 1 ? L.z400 : L.z600 }}>{seg}</span>
        </span>
      ))}
    </div>
  );
}

// ── Status Bar Top (from status-bar.tsx — just centered logo) ──

function LiminalStatusBarTop() {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{ height: "38px", borderBottom: `1px solid ${L.border}99`, background: L.bg }}
    >
      {/* Brain/logo dot */}
      <div className="rounded-full" style={{ width: "8px", height: "8px", background: L.z700, opacity: 0.5 }} />
    </div>
  );
}

// ── Status Footer (from status-footer.tsx) ──

function LiminalStatusFooter({ project, branch, ctxPercent, fileName, language, model }: {
  project: string;
  branch?: string;
  ctxPercent: number;
  fileName?: string;
  language?: string;
  model: string;
}) {
  return (
    <div
      className="flex items-center px-4 gap-4 shrink-0"
      style={{ height: "22px", borderTop: `1px solid ${L.border}4d`, fontSize: "11px", color: L.z600, background: L.bg }}
    >
      {/* Project */}
      <span className="shrink-0">{project} <span style={{ color: L.z700 }}>{"\u25CF"}</span></span>

      {/* Git branch */}
      {branch && (
        <span className="flex items-center gap-1.5 shrink-0">
          <span style={{ fontSize: "10px" }}>{"\u2387"}</span>
          <span>{branch}</span>
        </span>
      )}

      {/* Context bar */}
      <div className="flex-1 flex items-center gap-1.5">
        <span style={{ fontSize: "10px", color: L.z700, flexShrink: 0 }}>ctx</span>
        <div className="flex-1 rounded-full overflow-hidden" style={{ height: "4px", background: `${L.z800}99` }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${ctxPercent}%`,
              background: ctxPercent > 80 ? `${L.amber500}b3` : `${L.cyan500}80`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <span style={{ fontSize: "10px", color: L.z700, flexShrink: 0 }}>{ctxPercent}%</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 shrink-0">
        {fileName && <span style={{ color: L.z500 }}>{fileName}</span>}
        {language && <span>{language}</span>}
        <span className="flex items-center gap-1.5">
          {model}
          <span className="rounded-full" style={{ width: "6px", height: "6px", background: `${L.sky400}99` }} />
        </span>
      </div>
    </div>
  );
}

// ── Message Bubble (from message-bubble.tsx) ──

type ChatMsg =
  | { role: "user"; text: string }
  | { role: "liminal"; text?: string; parts?: { type: "text" | "code"; text: string }[] }
  | { role: "tool"; summary: string; done: boolean };

function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "tool") {
    return (
      <div className="py-0.5 pl-1">
        <div className="flex items-center gap-2" style={{ fontSize: "10px" }}>
          <span style={{ color: msg.done ? `${L.sky500}b3` : `${L.amber500}cc` }}>
            {msg.done ? "\u25C6" : "\u25C7"}
          </span>
          <span style={{ color: L.z500 }}>{msg.summary}</span>
        </div>
      </div>
    );
  }

  if (msg.role === "user") {
    return (
      <div className="mb-4">
        <div
          className="rounded-r-[3px] pl-4 py-2 pr-3"
          style={{ borderLeft: `2px solid ${L.cyan500}4d`, background: "rgba(255,255,255,0.02)" }}
        >
          <div style={{ fontSize: "9px", color: L.z600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>you</div>
          <div style={{ fontSize: "11px", color: L.z300, lineHeight: 1.6, letterSpacing: "0.01em", whiteSpace: "pre-wrap" }}>
            {msg.text}
          </div>
        </div>
      </div>
    );
  }

  // liminal
  const renderContent = () => {
    if (msg.parts) {
      return msg.parts.map((part, i) =>
        part.type === "code" ? (
          <span key={i} className="rounded-[3px] px-1.5 py-0.5" style={{ background: `${L.cyan500}18`, color: L.cyan400, fontSize: "11px", fontFamily: "monospace" }}>
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      );
    }
    return msg.text;
  };

  return (
    <div className="mb-4 pl-1">
      <div style={{ fontSize: "9px", color: L.z600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>liminal</div>
      <div style={{ fontSize: "11px", color: L.z200, lineHeight: 1.6, letterSpacing: "0.01em" }}>
        {renderContent()}
      </div>
    </div>
  );
}

// ── Input Bar (from input-bar.tsx) ──

function LiminalInputBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <div
        className="flex items-center rounded-[3px]"
        style={{ border: `1px solid ${L.border}80`, background: `${L.card}cc`, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}
      >
        <span className="flex-1 px-3 py-2.5" style={{ fontSize: "11px", color: L.z700, letterSpacing: "0.01em" }}>
          {placeholder}
        </span>
        <span className="pr-2 shrink-0" style={{ fontSize: "14px", color: L.z700 }}>
          {"\u263A"}
        </span>
      </div>
    </div>
  );
}

// ── Streaming Cursor ──

function StreamingCursor() {
  return <span className="inline-block rounded-sm" style={{ width: "6px", height: "13px", background: `${L.sky500}4d`, animation: "liminal-blink 1s step-end infinite" }} />;
}

// ── Thinking Dots ──

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            style={{ fontSize: "10px", color: `${L.sky500}b3` }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
          >
            {"\u25C6"}
          </motion.span>
        ))}
      </div>
      <span style={{ fontSize: "11px", color: L.z600 }}>thinking</span>
    </div>
  );
}

// ══════════════════════════════════════════════════
// HERO REPLICA — AGENT CHAT MODE
// ══════════════════════════════════════════════════

const HERO_CHAT: ChatMsg[] = [
  { role: "tool", summary: "read 2 files, edited 1 file, ran 1 command", done: true },
  { role: "liminal", text: "Done. Guided mode working yet?" },
  { role: "liminal", parts: [
    { type: "code", text: "style.css" },
    { type: "text", text: " gives the calculator its visual layout \u2014 the dark background, grid button arrangement, colors for operators and the equals button. Without it the HTML is just unstyled browser elements, basically unusable." },
  ]},
  { role: "liminal", parts: [
    { type: "text", text: "Still need to write " },
    { type: "code", text: "app.js" },
    { type: "text", text: " to finish the rebuild. Want me to continue?" },
  ]},
  { role: "user", text: "what? Im asking why do we need this file" },
  { role: "liminal", parts: [
    { type: "text", text: "Same answer \u2014 " },
    { type: "code", text: "style.css" },
    { type: "text", text: " handles all the visual styling. The dark theme, the grid layout for buttons, the orange operator colors, the rounded corners. It\u2019s what makes it look like a calculator instead of a pile of plain HTML buttons." },
  ]},
  { role: "user", text: "lets delete all these files again sorry" },
  { role: "tool", summary: "ran 1 command", done: true },
  { role: "liminal", text: "Gone. Rebuild?" },
  { role: "user", text: "yes" },
  { role: "user", text: "why do we need this file?" },
  { role: "liminal", parts: [
    { type: "code", text: "index.html" },
    { type: "text", text: " is the entry point of the app \u2014 it defines the structure of the calculator: the display area, the button grid, and links to the CSS and JS files. Without it there\u2019s nothing to load in the browser." },
  ]},
  { role: "liminal", parts: [
    { type: "text", text: "Want me to continue with " },
    { type: "code", text: "style.css" },
    { type: "text", text: " and " },
    { type: "code", text: "app.js" },
    { type: "text", text: "?" },
  ]},
  { role: "user", text: "Yes" },
];

const HERO_FILE_TREE: TreeItem[] = [
  { name: ".claude", isDir: true, expanded: false, depth: 0 },
  { name: ".vite", isDir: true, expanded: true, depth: 0, children: [
    { name: "deps_temp_1e2cdd98", isDir: true, expanded: false, depth: 1 },
    { name: "deps_temp_b663b425", isDir: true, expanded: true, depth: 1, children: [
      { name: "package.json", depth: 2, dotColor: L.dotJson },
    ]},
  ]},
  { name: ".vscode", isDir: true, expanded: false, depth: 0 },
  { name: ".gitignore", depth: 0, dotColor: L.dotGitignore },
];

function LiminalAgentReplica() {
  const [visibleMsgs, setVisibleMsgs] = useState(10);
  const hasMounted = useRef(false);

  useEffect(() => { hasMounted.current = true; }, []);

  useEffect(() => {
    if (visibleMsgs < HERO_CHAT.length) {
      const timeout = setTimeout(() => setVisibleMsgs((v) => v + 1), 2500);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setVisibleMsgs(8), 4000);
      return () => clearTimeout(timeout);
    }
  }, [visibleMsgs]);

  return (
    <div className="rounded-xl overflow-hidden w-full mx-auto" style={{ background: L.bg, border: `1px solid ${L.border}` }}>
      <LiminalStatusBarTop />
      <div className="flex" style={{ height: "600px" }}>
        <ActivityBar activeView="chat" activeSidebar="files" />
        <LiminalFileTree items={HERO_FILE_TREE} />

        {/* Main chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden px-5 py-3 flex flex-col gap-0 justify-end">
            <AnimatePresence initial={false} mode="popLayout">
              {HERO_CHAT.slice(0, visibleMsgs).map((msg, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={hasMounted.current ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <MessageBubble msg={msg} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <LiminalInputBar placeholder="message liminal" />
        </div>
      </div>
      <LiminalStatusFooter project="test2" branch="main" ctxPercent={5} model="opus" />

      <style>{`
        @keyframes liminal-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION 1.0 — EDITOR MODE REPLICA
// ══════════════════════════════════════════════════

function LiminalEditorReplica() {
  return (
    <div className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto" style={{ background: L.bg, border: `1px solid ${L.border}`, height: "480px" }}>
      <LiminalStatusBarTop />
      <div className="flex" style={{ height: "calc(100% - 38px - 22px)" }}>
        <ActivityBar activeView="editor" activeSidebar="files" />
        <LiminalFileTree items={HERO_FILE_TREE} />

        <div className="flex-1 flex flex-col min-w-0">
          <LiminalTabBar tabs={[
            { name: ".gitignore", dotColor: L.dotGitignore },
            { name: "package.json", active: true, dirty: true, dotColor: L.dotJson },
          ]} />
          <LiminalBreadcrumb segments={["Users", "noahsmile", "test2", ".vite", "deps_temp_b663b425", "package.json"]} />

          {/* Editor with line numbers */}
          <div className="flex-1 flex overflow-hidden">
            <div className="shrink-0 pt-3 select-none" style={{ width: "40px" }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="text-right pr-3" style={{ fontSize: "12px", lineHeight: "22px", color: L.z700, fontFamily: "monospace" }}>{n}</div>
              ))}
            </div>
            <div className="flex-1 pt-3 pl-2" style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: "22px" }}>
              <div>
                <span style={{ color: L.z300 }}>{"{"}</span>
                <span style={{ color: L.z700, marginLeft: "6px", fontSize: "9px" }}>{"\u2304"}</span>
              </div>
              <div>{"    "}<span style={{ color: L.z300 }}>&quot;type&quot;</span>: <span style={{ color: L.z300 }}>&quot;module&quot;</span></div>
              <div><span style={{ color: L.z300 }}>{"}"}</span></div>
              <div />
            </div>
          </div>
        </div>
      </div>
      <LiminalStatusFooter project="test2" ctxPercent={5} fileName="package.json" language="JSON" model="opus" />
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION 2.0 — TERMINAL REPLICA
// ══════════════════════════════════════════════════

const TERMINAL_LINES = [
  { type: "cmd" as const, text: "cargo run --release" },
  { type: "out" as const, text: "   Compiling liminal-core v0.1.0" },
  { type: "out" as const, text: "   Compiling liminal-editor v0.1.0" },
  { type: "ok" as const, text: "    Finished release in 2.4s" },
  { type: "ok" as const, text: "     Running target/release/liminal" },
  { type: "exit" as const, text: "process exited with code 0", code: 0 },
  { type: "cmd" as const, text: "cargo test" },
  { type: "out" as const, text: "running 98 tests" },
  { type: "ok" as const, text: "test result: ok. 98 passed; 0 failed; 0 ignored" },
  { type: "exit" as const, text: "process exited with code 0", code: 0 },
];

function LiminalTerminalReplica() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    if (visibleLines < TERMINAL_LINES.length) {
      const line = TERMINAL_LINES[visibleLines];
      const delay = line.type === "cmd" ? 600 : line.type === "exit" ? 400 : 200 + Math.random() * 150;
      const timeout = setTimeout(() => setVisibleLines((v) => v + 1), delay);
      return () => clearTimeout(timeout);
    } else if (!looping) {
      const timeout = setTimeout(() => { setLooping(true); setVisibleLines(0); setTimeout(() => setLooping(false), 100); }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines, looping]);

  return (
    <div className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto" style={{ background: L.bg, border: `1px solid ${L.border}`, height: "480px" }}>
      <LiminalStatusBarTop />
      <div className="flex" style={{ height: "calc(100% - 38px - 22px)" }}>
        <ActivityBar activeView="terminal" activeSidebar={null} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Terminal tab bar */}
          <div className="flex items-center gap-0 shrink-0" style={{ borderBottom: `1px solid ${L.border}` }}>
            <div className="px-3 py-1.5 flex items-center gap-1.5" style={{ borderRight: `1px solid ${L.z800}66`, color: L.z300, fontSize: "11px" }}>
              <span>term1</span>
              <span style={{ fontSize: "9px", color: L.z700 }}>{"\u00D7"}</span>
            </div>
            <div className="px-2 py-1.5" style={{ fontSize: "11px", color: L.z600 }}>+</div>
          </div>

          {/* Terminal output */}
          <div className="flex-1 p-4 overflow-hidden" style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: "22px" }}>
            {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div key={`${i}-${looping}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                {line.type === "cmd" ? (
                  <div><span style={{ color: L.z600, fontSize: "10px" }}>$</span> <span style={{ color: L.z300 }}>{line.text}</span></div>
                ) : line.type === "exit" ? (
                  <div className="flex items-center gap-2 mt-1" style={{ fontSize: "11px", color: L.sky500 }}>
                    {line.text}
                  </div>
                ) : (
                  <div style={{ color: line.type === "ok" ? L.z400 : L.z400, whiteSpace: "pre-wrap" }}>{line.text}</div>
                )}
              </motion.div>
            ))}
            {visibleLines >= TERMINAL_LINES.length && (
              <div className="mt-1">
                <span style={{ color: L.z600, fontSize: "10px" }}>$</span>{" "}
                <span className="inline-block rounded-sm" style={{ width: "6px", height: "13px", background: `${L.sky500}4d`, animation: "liminal-blink 1s step-end infinite" }} />
              </div>
            )}
          </div>

          {/* Terminal input */}
          <div className="px-4 pb-3 shrink-0">
            <div className="flex items-center gap-2" style={{ fontSize: "12px" }}>
              <span style={{ fontSize: "10px", color: L.z600 }}>$</span>
              <span style={{ color: L.z700, fontSize: "11px" }}>type command...</span>
            </div>
          </div>
        </div>
      </div>
      <LiminalStatusFooter project="test2" branch="main" ctxPercent={5} model="opus" />

      <style>{`
        @keyframes liminal-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════
// MARKETING PAGE SECTIONS
// ══════════════════════════════════════════════════

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

function IDEHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-6">
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-4">
          <span className="font-mono text-4xl text-accent">&gt;_</span>
        </motion.div>
        <motion.h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-[590] tracking-[-0.022em] leading-[1.08]" initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <span className="text-foreground">Liminal IDE</span>
        </motion.h1>
        <motion.p className="mt-4 text-lg text-foreground-muted max-w-lg leading-relaxed" initial="hidden" animate="visible" custom={0.1} variants={fadeUp}>
          A code editor that stays out of your way. AI-native intelligence
          meets terminal-first workflow, built entirely in Rust.
        </motion.p>
        <motion.div className="mt-6 inline-block px-3 py-1 border border-accent/30 text-accent text-xs uppercase tracking-widest" initial="hidden" animate="visible" custom={0.2} variants={fadeUp}>
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
        <SectionHeader number="1.0" label="Intelligence" title={"AI that understands\nyour entire codebase."} description="Deep language model integration that goes beyond autocomplete. Contextual refactoring, codebase-aware suggestions, and inline explanations — all running locally on your machine." />
        <ScrollReveal><LiminalEditorReplica /></ScrollReveal>
        <SubFeatures items={[
          { number: "1.1", label: "Codebase-aware context" },
          { number: "1.2", label: "Inline refactoring" },
          { number: "1.3", label: "Local inference" },
          { number: "1.4", label: "Smart completions" },
        ]} />
      </div>
    </section>
  );
}

// ── 2.0 Terminal ──

function TerminalSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader number="2.0" label="Terminal" title={"Your terminal,\nbuilt into the editor."} description="Integrated terminal with multiplexing, split panes, and shell integration. Run builds, tests, and servers without leaving the editor. Never context-switch again." />
        <ScrollReveal><LiminalTerminalReplica /></ScrollReveal>
        <SubFeatures items={[
          { number: "2.1", label: "Split panes" },
          { number: "2.2", label: "Shell integration" },
          { number: "2.3", label: "Multiplexing" },
          { number: "2.4", label: "Task runner" },
        ]} />
      </div>
    </section>
  );
}

// ── 3.0 Performance ──

function PerformanceSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader number="3.0" label="Performance" title={"Native Rust core.\nInstant at any scale."} description="Opens in under 100ms. Handles million-line codebases without breaking a sweat. Your editor should use a fraction of the memory and CPU that Electron-based tools demand." />
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
        <SubFeatures items={[
          { number: "3.1", label: "Rust core" },
          { number: "3.2", label: "GPU rendering" },
          { number: "3.3", label: "Async I/O" },
          { number: "3.4", label: "Tree-sitter parsing" },
        ]} />
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
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-[590] tracking-[-0.022em] leading-[1.12] max-w-2xl">Every detail, considered.</h2>
        </ScrollReveal>
        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
          {GRID_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title}>
                <div className="bg-background p-8 h-full">
                  <Icon size={16} className="text-foreground-muted mb-4" />
                  <h3 className="text-sm font-medium text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">{feature.description}</p>
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
        <SectionHeader number="4.0" label="Specifications" title={"Under the hood."} description="Liminal is built from scratch in Rust with GPU-accelerated rendering, tree-sitter parsing, and native LSP support. No Electron, no compromises." />
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
        <SubFeatures items={[
          { number: "4.1", label: "Zero Electron" },
          { number: "4.2", label: "WASM plugins" },
          { number: "4.3", label: "GPU rendering" },
          { number: "4.4", label: "Local AI inference" },
        ]} />
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
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to join waitlist"); }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <section className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-[clamp(2.75rem,5vw,4.5rem)] font-[590] tracking-[-0.022em] leading-[1.1]">
            <span className="text-foreground">Join the waitlist. </span>
            <span className="text-foreground-muted">Be the first to know when Liminal IDE is ready.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          {submitted ? (
            <div className="mt-8 p-6 border border-accent/30 text-accent text-sm max-w-md">Thank you. We&apos;ll be in touch.</div>
          ) : (
            <>
              {error && <div className="mt-8 p-3 border border-red-500/30 text-red-400 text-sm max-w-md">{error}</div>}
              <form onSubmit={handleSubmit} className="mt-10 flex gap-3 max-w-md">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 px-4 py-3 bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors rounded-full" />
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium hover:opacity-90 shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 rounded-full">
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
