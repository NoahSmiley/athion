"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Terminal, Minus, Gauge, ArrowRight, Code2, Layers, Cpu, Zap, Braces, GitBranch, Check } from "lucide-react";
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

// ── Section Header (matching Flux page pattern) ──

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

// ── Editor Replica (animated — types out code line by line) ──

const CODE_LINES = [
  { parts: [{ t: "use", c: "#c678dd" }, { t: " liminal", c: "#e5c07b" }, { t: "::", c: "#555" }, { t: "Editor", c: "#e5c07b" }, { t: ";", c: "#555" }] },
  { parts: [{ t: "use", c: "#c678dd" }, { t: " liminal", c: "#e5c07b" }, { t: "::", c: "#555" }, { t: "AI", c: "#e5c07b" }, { t: ";", c: "#555" }] },
  { parts: [] },
  { parts: [{ t: "// Zero-config, instant startup", c: "#5c6370" }] },
  { parts: [{ t: "fn", c: "#c678dd" }, { t: " main", c: "#61afef" }, { t: "()", c: "#555" }, { t: " {", c: "#555" }] },
  { parts: [{ t: "    ", c: "" }, { t: "let", c: "#c678dd" }, { t: " editor ", c: "#e8e8e8" }, { t: "=", c: "#555" }, { t: " Editor", c: "#e5c07b" }, { t: "::", c: "#555" }, { t: "new", c: "#61afef" }, { t: "()", c: "#555" }] },
  { parts: [{ t: "        .", c: "#555" }, { t: "theme", c: "#61afef" }, { t: "(", c: "#555" }, { t: '"midnight"', c: "#98c379" }, { t: ")", c: "#555" }] },
  { parts: [{ t: "        .", c: "#555" }, { t: "ai", c: "#61afef" }, { t: "(", c: "#555" }, { t: "AI", c: "#e5c07b" }, { t: "::", c: "#555" }, { t: "local", c: "#61afef" }, { t: "())", c: "#555" }] },
  { parts: [{ t: "        .", c: "#555" }, { t: "terminal", c: "#61afef" }, { t: "(", c: "#555" }, { t: "true", c: "#c678dd" }, { t: ")", c: "#555" }] },
  { parts: [{ t: "        .", c: "#555" }, { t: "build", c: "#61afef" }, { t: "();", c: "#555" }] },
  { parts: [] },
  { parts: [{ t: "    editor.", c: "#e8e8e8" }, { t: "run", c: "#61afef" }, { t: "();", c: "#555" }] },
  { parts: [{ t: "}", c: "#555" }] },
];

function EditorReplica() {
  const [visibleLines, setVisibleLines] = useState(0);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
    // Type out lines one by one
    if (visibleLines < CODE_LINES.length) {
      const timeout = setTimeout(() => {
        setVisibleLines((v) => v + 1);
      }, visibleLines === 0 ? 300 : 120 + Math.random() * 80);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines]);

  return (
    <ScrollReveal>
      <div
        className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto"
        style={{ background: "#0a0a0a", border: "1px solid #161616" }}
      >
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b" style={{ borderColor: "#161616", background: "#0e0e0e" }}>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#0a0a0a", borderRight: "1px solid #161616" }}>
            <Braces size={12} style={{ color: "#6366f1" }} />
            <span style={{ fontSize: "12px", color: "#e8e8e8" }}>main.rs</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderRight: "1px solid #161616" }}>
            <Braces size={12} style={{ color: "#555" }} />
            <span style={{ fontSize: "12px", color: "#555" }}>lib.rs</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Braces size={12} style={{ color: "#555" }} />
            <span style={{ fontSize: "12px", color: "#555" }}>config.toml</span>
          </div>
        </div>

        <div className="flex">
          {/* Line numbers */}
          <div className="flex-shrink-0 pt-4 pb-4 pr-2 select-none" style={{ width: "48px", background: "#0a0a0a", borderRight: "1px solid #111" }}>
            {Array.from({ length: Math.max(14, visibleLines) }, (_, i) => (
              <div key={i} className="text-right pr-2" style={{ fontSize: "12px", lineHeight: "22px", color: i < visibleLines ? "#444" : "#222", fontFamily: "monospace", transition: "color 0.3s" }}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code area */}
          <div className="flex-1 pt-4 pb-4 pl-4 overflow-x-auto" style={{ minHeight: `${14 * 22 + 32}px` }}>
            <div style={{ fontSize: "13px", lineHeight: "22px", fontFamily: "'JetBrains Mono', monospace" }}>
              {CODE_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  style={{ minHeight: "22px" }}
                >
                  {line.parts.map((part, j) => (
                    <span key={j} style={{ color: part.c || "#e8e8e8" }}>{part.t}</span>
                  ))}
                </motion.div>
              ))}
              {/* Cursor */}
              {visibleLines < CODE_LINES.length && (
                <div style={{ minHeight: "22px" }}>
                  <span style={{ display: "inline-block", width: "7px", height: "16px", background: "#e8e8e8", animation: "cursor-blink 1s step-end infinite" }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{ borderTop: "1px solid #161616", background: "#0e0e0e" }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "11px", color: "#43b581" }}>● Ready</span>
            <span style={{ fontSize: "11px", color: "#555" }}>Rust</span>
            <span style={{ fontSize: "11px", color: "#555" }}>UTF-8</span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "11px", color: "#555" }}>Ln {Math.max(1, visibleLines)}, Col {visibleLines >= CODE_LINES.length ? 2 : 1}</span>
            <span style={{ fontSize: "11px", color: "#555" }}>80ms startup</span>
          </div>
        </div>

        <style>{`
          @keyframes cursor-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>
    </ScrollReveal>
  );
}

// ── Terminal Replica (animated — commands run sequentially) ──

const TERMINAL_LINES = [
  { type: "cmd" as const, text: "cargo build --release" },
  { type: "out" as const, text: "   Compiling liminal-core v0.1.0", color: "#888" },
  { type: "out" as const, text: "   Compiling liminal-editor v0.1.0", color: "#888" },
  { type: "ok" as const, text: "    Finished release [optimized] target(s) in 2.4s" },
  { type: "gap" as const, text: "" },
  { type: "cmd" as const, text: "cargo test" },
  { type: "out" as const, text: "running 47 tests", color: "#888" },
  { type: "ok" as const, text: "test result: ok. 47 passed; 0 failed; 0 ignored" },
];

function TerminalReplica() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < TERMINAL_LINES.length) {
      const line = TERMINAL_LINES[visibleLines];
      const delay = line.type === "cmd" ? 600 : line.type === "gap" ? 400 : 200 + Math.random() * 150;
      const timeout = setTimeout(() => setVisibleLines((v) => v + 1), delay);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[800px] mx-auto"
      style={{ background: "#0a0a0a", border: "1px solid #161616" }}
    >
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid #161616", background: "#0e0e0e" }}>
        <Terminal size={12} style={{ color: "#43b581" }} />
        <span style={{ fontSize: "12px", color: "#888" }}>zsh — project/liminal</span>
      </div>
      <div className="p-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", lineHeight: "20px", minHeight: "200px" }}>
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            style={{ marginTop: line.type === "gap" ? "8px" : undefined }}
          >
            {line.type === "cmd" ? (
              <><span style={{ color: "#43b581" }}>❯</span> <span style={{ color: "#e8e8e8" }}>{line.text}</span></>
            ) : (
              <span style={{ color: line.type === "ok" ? "#43b581" : line.color || "#888" }}>{line.text}</span>
            )}
          </motion.div>
        ))}
        {visibleLines >= TERMINAL_LINES.length && (
          <div style={{ marginTop: "8px" }}>
            <span style={{ color: "#43b581" }}>❯</span> <span style={{ display: "inline-block", width: "7px", height: "14px", background: "#43b581", animation: "cursor-blink 1s step-end infinite" }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── AI Assist Replica (animated — shows refactoring progress) ──

function AIAssistReplica() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const stages = [800, 1200, 800, 600]; // delays between stages
    if (stage < 4) {
      const timeout = setTimeout(() => setStage((s) => s + 1), stages[stage]);
      return () => clearTimeout(timeout);
    }
  }, [stage]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[800px] mx-auto p-8"
      style={{ background: "#0a0a0a", border: "1px solid #161616" }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 40, height: 40, background: "#6366f120" }}>
          <Sparkles size={18} style={{ color: "#6366f1" }} />
        </div>
        <div className="flex-1">
          <p style={{ fontSize: "13px", color: "#e8e8e8", fontWeight: 600 }}>AI Assist</p>
          <AnimatePresence mode="wait">
            {stage < 2 ? (
              <motion.p
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: "12px", color: "#888", marginTop: "4px", lineHeight: 1.5 }}
              >
                Analyzing <span style={{ color: "#6366f1", fontFamily: "monospace" }}>auth_middleware.rs</span>
                <span style={{ display: "inline-flex", gap: "2px", marginLeft: "4px" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      style={{ color: "#6366f1" }}
                    >.</motion.span>
                  ))}
                </span>
              </motion.p>
            ) : (
              <motion.p
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: "12px", color: "#888", marginTop: "4px", lineHeight: 1.5 }}
              >
                Refactoring <span style={{ color: "#6366f1", fontFamily: "monospace" }}>auth_middleware.rs</span> — extracted 3 helper functions, simplified error handling, added typed responses.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2">
        {stage >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-1.5 rounded-md text-xs"
            style={{ background: "#43b58120", color: "#43b581", fontFamily: "monospace" }}
          >
            +42 lines
          </motion.div>
        )}
        {stage >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-1.5 rounded-md text-xs"
            style={{ background: "#ff444420", color: "#ff4444", fontFamily: "monospace" }}
          >
            -67 lines
          </motion.div>
        )}
        {stage >= 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1"
            style={{ background: "#6366f120", color: "#6366f1" }}
          >
            <Check size={10} /> 3 files changed
          </motion.div>
        )}
      </div>
    </div>
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
          <AIAssistReplica />
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

// ── 2.0 Terminal First ──

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
          <TerminalReplica />
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

// ── 3.0 Minimal Interface ──

function InterfaceSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="3.0"
          label="Interface"
          title={"No visual noise.\nThe code is the interface."}
          description="A distraction-free environment where the editor disappears and the code takes center stage. Keyboard-driven navigation, command palette, and a UI that only shows what you need."
        />

        <EditorReplica />

        <SubFeatures
          items={[
            { number: "3.1", label: "Command palette" },
            { number: "3.2", label: "Keyboard-driven" },
            { number: "3.3", label: "Zen mode" },
            { number: "3.4", label: "Custom themes" },
          ]}
        />
      </div>
    </section>
  );
}

// ── 4.0 Performance ──

function PerformanceSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          number="4.0"
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
            { number: "4.1", label: "Rust core" },
            { number: "4.2", label: "GPU rendering" },
            { number: "4.3", label: "Async I/O" },
            { number: "4.4", label: "Tree-sitter parsing" },
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

// ── Tech Specs ──

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
          number="5.0"
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
            { number: "5.1", label: "Zero Electron" },
            { number: "5.2", label: "WASM plugins" },
            { number: "5.3", label: "GPU rendering" },
            { number: "5.4", label: "Local AI inference" },
          ]}
        />
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
        { value: "11×", label: "Faster startup", detail: "80ms vs 920ms cold start" },
        { value: "12×", label: "Less memory", detail: "45 MB vs 550 MB idle" },
        { value: "44×", label: "Smaller binary", detail: "8 MB vs 350 MB" },
        { value: "7×", label: "Faster file open", detail: "12ms vs 85ms for 10K lines" },
      ]}
    />
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
      <AISection />
      <TerminalSection />
      <InterfaceSection />
      <PerformanceSection />
      <FeatureGrid />
      <IDEBenchmarks />
      <TechSpecs />
      <Waitlist />
    </PageTransition>
  );
}
