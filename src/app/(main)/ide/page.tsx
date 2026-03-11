"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Terminal, Minus, Gauge, ArrowRight, Code2, Layers, Cpu, Zap, Braces, GitBranch, Check, ChevronRight, ChevronDown, FileText, FolderOpen, Folder } from "lucide-react";
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

// ── Shared IDE Sub-Components ──

const FILE_TREE = [
  { type: "folder" as const, name: "src", expanded: true, children: [
    { name: "main.rs", active: true, modified: false },
    { name: "editor.rs", active: false, modified: true },
    { name: "parser.rs", active: false, modified: false },
    { name: "ai.rs", active: false, modified: false },
  ]},
  { type: "folder" as const, name: "tests", expanded: false, children: [
    { name: "integration.rs", active: false, modified: false },
  ]},
];

function IDEFileTree() {
  return (
    <div
      className="flex-shrink-0 flex-col hidden md:flex overflow-hidden"
      style={{
        width: "200px",
        background: "#0e0e0e",
        borderRight: "1px solid #161616",
        fontSize: "12px",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div className="px-3 py-2.5" style={{ borderBottom: "1px solid #161616" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em" }}>Explorer</span>
      </div>
      <div className="py-1">
        {FILE_TREE.map((folder) => (
          <div key={folder.name}>
            <div className="flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-white/5">
              {folder.expanded ? <ChevronDown size={10} style={{ color: "#555" }} /> : <ChevronRight size={10} style={{ color: "#555" }} />}
              {folder.expanded ? <FolderOpen size={12} style={{ color: "#f59e0b" }} /> : <Folder size={12} style={{ color: "#f59e0b" }} />}
              <span style={{ color: "#ccc" }}>{folder.name}</span>
            </div>
            {folder.expanded && folder.children.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-1.5 py-1 cursor-pointer"
                style={{
                  paddingLeft: "28px",
                  paddingRight: "8px",
                  background: file.active ? "rgba(255,255,255,0.08)" : "transparent",
                }}
              >
                <FileText size={12} style={{ color: file.active ? "#6366f1" : "#555" }} />
                <span style={{ color: file.active ? "#fff" : "#888", flex: 1 }}>{file.name}</span>
                {file.modified && (
                  <span style={{ color: "#f59e0b", fontSize: "14px", lineHeight: 1 }}>●</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function IDETabBar({ tabs, activeTab }: { tabs: string[]; activeTab: number }) {
  return (
    <div
      className="flex items-center gap-0 flex-shrink-0"
      style={{ height: "38px", borderBottom: "1px solid #161616", background: "#0e0e0e" }}
    >
      {tabs.map((tab, i) => (
        <div
          key={tab}
          className="flex items-center gap-2 px-4 relative"
          style={{
            height: "100%",
            background: i === activeTab ? "#0a0a0a" : "transparent",
            borderRight: "1px solid #161616",
          }}
        >
          {i === activeTab && (
            <div className="absolute top-0 left-0 right-0" style={{ height: "2px", background: "#6366f1" }} />
          )}
          <Braces size={12} style={{ color: i === activeTab ? "#6366f1" : "#555" }} />
          <span style={{ fontSize: "12px", color: i === activeTab ? "#e8e8e8" : "#555" }}>{tab}</span>
        </div>
      ))}
    </div>
  );
}

function IDEStatusBar({ file, language, line, col, startupTime }: { file: string; language: string; line: number; col: number; startupTime: string }) {
  return (
    <div
      className="flex items-center justify-between px-3 flex-shrink-0"
      style={{ height: "26px", borderTop: "1px solid #161616", background: "#0e0e0e", fontSize: "11px" }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: "#43b581" }}>● Ready</span>
        <span style={{ color: "#555" }}>{file}</span>
        <span style={{ color: "#555" }}>{language}</span>
      </div>
      <div className="flex items-center gap-3">
        <span style={{ color: "#555" }}>Ln {line}, Col {col}</span>
        <span style={{ color: "#555" }}>{startupTime}</span>
      </div>
    </div>
  );
}

// ── Static Rust Code Blocks ──

function RustEditorCode() {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "22px" }}>
      <div><span style={{ color: "#c678dd" }}>use</span> <span style={{ color: "#e5c07b" }}>liminal</span><span style={{ color: "#555" }}>::</span><span style={{ color: "#e5c07b" }}>Editor</span><span style={{ color: "#555" }}>;</span></div>
      <div><span style={{ color: "#c678dd" }}>use</span> <span style={{ color: "#e5c07b" }}>liminal</span><span style={{ color: "#555" }}>::</span><span style={{ color: "#e5c07b" }}>AI</span><span style={{ color: "#555" }}>;</span></div>
      <div style={{ minHeight: "22px" }} />
      <div><span style={{ color: "#c678dd" }}>impl</span> <span style={{ color: "#e5c07b" }}>Editor</span> <span style={{ color: "#555" }}>{"{"}</span></div>
      <div>{"    "}<span style={{ color: "#c678dd" }}>pub fn</span> <span style={{ color: "#61afef" }}>new</span><span style={{ color: "#555" }}>(</span><span style={{ color: "#e5c07b" }}>config</span>: <span style={{ color: "#e5c07b" }}>Config</span><span style={{ color: "#555" }}>)</span> <span style={{ color: "#555" }}>-&gt;</span> <span style={{ color: "#e5c07b" }}>Self</span> <span style={{ color: "#555" }}>{"{"}</span></div>
      <div>{"        "}<span style={{ color: "#c678dd" }}>let</span> renderer = <span style={{ color: "#e5c07b" }}>GpuRenderer</span>::<span style={{ color: "#61afef" }}>init</span><span style={{ color: "#555" }}>(</span>&config<span style={{ color: "#555" }}>);</span></div>
      <div>{"        "}<span style={{ color: "#c678dd" }}>let</span> parser = <span style={{ color: "#e5c07b" }}>TreeSitter</span>::<span style={{ color: "#61afef" }}>new</span><span style={{ color: "#555" }}>();</span></div>
      <div>{"        "}<span style={{ color: "#c678dd" }}>let</span> lsp = <span style={{ color: "#e5c07b" }}>LspClient</span>::<span style={{ color: "#61afef" }}>connect</span><span style={{ color: "#555" }}>(</span>&config<span style={{ color: "#555" }}>);</span></div>
      <div style={{ minHeight: "22px" }} />
      <div>{"        "}<span style={{ color: "#e5c07b" }}>Self</span> <span style={{ color: "#555" }}>{"{"}</span> renderer, parser, lsp,</div>
      <div>{"            "}ai: <span style={{ color: "#e5c07b" }}>AI</span>::<span style={{ color: "#61afef" }}>local</span><span style={{ color: "#555" }}>(</span>&config<span style={{ color: "#555" }}>),</span></div>
      <div>{"            "}buffers: <span style={{ color: "#e5c07b" }}>Vec</span>::<span style={{ color: "#61afef" }}>new</span><span style={{ color: "#555" }}>(),</span></div>
      <div>{"        "}<span style={{ color: "#555" }}>{"}"}</span></div>
      <div>{"    "}<span style={{ color: "#555" }}>{"}"}</span></div>
      <div style={{ minHeight: "22px" }} />
      <div>{"    "}<span style={{ color: "#c678dd" }}>pub fn</span> <span style={{ color: "#61afef" }}>open</span><span style={{ color: "#555" }}>(</span>&<span style={{ color: "#c678dd" }}>mut</span> <span style={{ color: "#e5c07b" }}>self</span>, <span style={{ color: "#e5c07b" }}>path</span>: &<span style={{ color: "#e5c07b" }}>Path</span><span style={{ color: "#555" }}>)</span> <span style={{ color: "#555" }}>{"{"}</span></div>
      <div>{"        "}<span style={{ color: "#c678dd" }}>let</span> buf = <span style={{ color: "#e5c07b" }}>Buffer</span>::<span style={{ color: "#61afef" }}>from_file</span><span style={{ color: "#555" }}>(</span>path<span style={{ color: "#555" }}>);</span></div>
      <div>{"        "}<span style={{ color: "#e5c07b" }}>self</span>.buffers.<span style={{ color: "#61afef" }}>push</span><span style={{ color: "#555" }}>(</span>buf<span style={{ color: "#555" }}>);</span></div>
      <div>{"    "}<span style={{ color: "#555" }}>{"}"}</span></div>
      <div><span style={{ color: "#555" }}>{"}"}</span></div>
    </div>
  );
}

function RustAuthCode({ highlightLines }: { highlightLines?: boolean }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "22px" }}>
      <div><span style={{ color: "#c678dd" }}>use</span> <span style={{ color: "#e5c07b" }}>liminal</span><span style={{ color: "#555" }}>::</span><span style={{ color: "#e5c07b" }}>auth</span><span style={{ color: "#555" }}>;</span></div>
      <div style={{ minHeight: "22px" }} />
      <div><span style={{ color: "#c678dd" }}>pub struct</span> <span style={{ color: "#e5c07b" }}>AuthMiddleware</span> <span style={{ color: "#555" }}>{"{"}</span></div>
      <div>{"    "}<span style={{ color: "#e5c07b" }}>provider</span>: <span style={{ color: "#e5c07b" }}>AuthProvider</span>,</div>
      <div>{"    "}<span style={{ color: "#e5c07b" }}>cache</span>: <span style={{ color: "#e5c07b" }}>TokenCache</span>,</div>
      <div>{"    "}<span style={{ color: "#e5c07b" }}>config</span>: <span style={{ color: "#e5c07b" }}>AuthConfig</span>,</div>
      <div><span style={{ color: "#555" }}>{"}"}</span></div>
      <div style={{ minHeight: "22px" }} />
      <div
        style={{
          background: highlightLines ? "rgba(99,102,241,0.08)" : "transparent",
          transition: "background 0.5s",
        }}
      ><span style={{ color: "#c678dd" }}>impl</span> <span style={{ color: "#e5c07b" }}>AuthMiddleware</span> <span style={{ color: "#555" }}>{"{"}</span></div>
      <div
        style={{
          background: highlightLines ? "rgba(99,102,241,0.08)" : "transparent",
          transition: "background 0.5s",
        }}
      >{"    "}<span style={{ color: "#c678dd" }}>pub async fn</span> <span style={{ color: "#61afef" }}>validate</span><span style={{ color: "#555" }}>(</span></div>
      <div
        style={{
          background: highlightLines ? "rgba(99,102,241,0.08)" : "transparent",
          transition: "background 0.5s",
        }}
      >{"        "}&<span style={{ color: "#e5c07b" }}>self</span>,</div>
      <div
        style={{
          background: highlightLines ? "rgba(99,102,241,0.08)" : "transparent",
          transition: "background 0.5s",
        }}
      >{"        "}<span style={{ color: "#e5c07b" }}>token</span>: &<span style={{ color: "#e5c07b" }}>str</span></div>
      <div
        style={{
          background: highlightLines ? "rgba(99,102,241,0.08)" : "transparent",
          transition: "background 0.5s",
        }}
      >{"    "}<span style={{ color: "#555" }}>)</span> <span style={{ color: "#555" }}>-&gt;</span> <span style={{ color: "#e5c07b" }}>Result</span><span style={{ color: "#555" }}>&lt;</span><span style={{ color: "#e5c07b" }}>Claims</span><span style={{ color: "#555" }}>&gt;</span> <span style={{ color: "#555" }}>{"{"}</span></div>
      <div>{"        "}<span style={{ color: "#c678dd" }}>let</span> claims = <span style={{ color: "#e5c07b" }}>self</span>.provider</div>
      <div>{"            "}.<span style={{ color: "#61afef" }}>decode</span><span style={{ color: "#555" }}>(</span>token<span style={{ color: "#555" }}>)</span></div>
      <div>{"            "}.<span style={{ color: "#c678dd" }}>await</span><span style={{ color: "#555" }}>?;</span></div>
      <div>{"        "}<span style={{ color: "#e5c07b" }}>self</span>.cache.<span style={{ color: "#61afef" }}>store</span><span style={{ color: "#555" }}>(</span>&claims<span style={{ color: "#555" }}>);</span></div>
      <div>{"        "}<span style={{ color: "#e5c07b" }}>Ok</span><span style={{ color: "#555" }}>(</span>claims<span style={{ color: "#555" }}>)</span></div>
      <div>{"    "}<span style={{ color: "#555" }}>{"}"}</span></div>
      <div><span style={{ color: "#555" }}>{"}"}</span></div>
    </div>
  );
}

function RustTerminalCode() {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", lineHeight: "20px" }}>
      <div><span style={{ color: "#c678dd" }}>use</span> <span style={{ color: "#e5c07b" }}>liminal</span><span style={{ color: "#555" }}>::{"{"}</span><span style={{ color: "#e5c07b" }}>Editor</span>, <span style={{ color: "#e5c07b" }}>AI</span><span style={{ color: "#555" }}>{"}"}</span><span style={{ color: "#555" }}>;</span></div>
      <div style={{ minHeight: "20px" }} />
      <div><span style={{ color: "#5c6370" }}>// Zero-config, instant startup</span></div>
      <div><span style={{ color: "#c678dd" }}>fn</span> <span style={{ color: "#61afef" }}>main</span><span style={{ color: "#555" }}>()</span> <span style={{ color: "#555" }}>{"{"}</span></div>
      <div>{"    "}<span style={{ color: "#c678dd" }}>let</span> editor = <span style={{ color: "#e5c07b" }}>Editor</span>::<span style={{ color: "#61afef" }}>new</span><span style={{ color: "#555" }}>()</span></div>
      <div>{"        "}.<span style={{ color: "#61afef" }}>theme</span><span style={{ color: "#555" }}>(</span><span style={{ color: "#98c379" }}>&quot;midnight&quot;</span><span style={{ color: "#555" }}>)</span></div>
      <div>{"        "}.<span style={{ color: "#61afef" }}>ai</span><span style={{ color: "#555" }}>(</span><span style={{ color: "#e5c07b" }}>AI</span>::<span style={{ color: "#61afef" }}>local</span><span style={{ color: "#555" }}>())</span></div>
      <div>{"        "}.<span style={{ color: "#61afef" }}>terminal</span><span style={{ color: "#555" }}>(</span><span style={{ color: "#c678dd" }}>true</span><span style={{ color: "#555" }}>)</span></div>
      <div>{"        "}.<span style={{ color: "#61afef" }}>build</span><span style={{ color: "#555" }}>();</span></div>
      <div style={{ minHeight: "20px" }} />
      <div>{"    "}editor.<span style={{ color: "#61afef" }}>run</span><span style={{ color: "#555" }}>();</span></div>
      <div><span style={{ color: "#555" }}>{"}"}</span></div>
    </div>
  );
}

// ── AI Panel (shared between hero + AI section) ──

function AIPanelContent({ stage }: { stage: number }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid #161616" }}>
        <Sparkles size={12} style={{ color: "#6366f1" }} />
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#e8e8e8" }}>AI Assist</span>
      </div>
      <div className="flex-1 p-3 overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{ background: "#111", border: "1px solid #1a1a1a" }}
            >
              <span style={{ fontSize: "12px", color: "#555" }}>Ask anything...</span>
            </motion.div>
          )}
          {stage === 1 && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>
                Analyzing <span style={{ color: "#6366f1", fontFamily: "monospace" }}>editor.rs</span>
                <span className="inline-flex gap-0.5 ml-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      style={{ color: "#6366f1", fontSize: "12px" }}
                    >.</motion.span>
                  ))}
                </span>
              </p>
            </motion.div>
          )}
          {stage === 2 && (
            <motion.div
              key="suggestion"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p style={{ fontSize: "12px", color: "#ccc", lineHeight: 1.6 }}>
                The <span style={{ color: "#6366f1", fontFamily: "monospace" }}>validate</span> method can be simplified by extracting the token decoding into a helper and using early returns for error cases.
              </p>
            </motion.div>
          )}
          {stage === 3 && (
            <motion.div
              key="diff"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p style={{ fontSize: "12px", color: "#ccc", lineHeight: 1.6, marginBottom: "12px" }}>
                Refactored with extracted helpers and typed error responses.
              </p>
              <div className="flex flex-wrap gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-2.5 py-1 rounded text-xs"
                  style={{ background: "#43b58120", color: "#43b581", fontFamily: "monospace" }}
                >
                  +18 lines
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="px-2.5 py-1 rounded text-xs"
                  style={{ background: "#ff444420", color: "#ff4444", fontFamily: "monospace" }}
                >
                  -24 lines
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="px-2.5 py-1 rounded text-xs flex items-center gap-1"
                  style={{ background: "#6366f120", color: "#6366f1" }}
                >
                  <Check size={10} /> 2 files
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Hero: LiminalIDEHeroReplica ──

function LiminalIDEHeroReplica() {
  const [aiStage, setAiStage] = useState(0);

  useEffect(() => {
    const durations = [5000, 3000, 4000, 5000];
    const timeout = setTimeout(() => {
      setAiStage((s) => (s + 1) % 4);
    }, durations[aiStage]);
    return () => clearTimeout(timeout);
  }, [aiStage]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full mx-auto"
      style={{ background: "#0a0a0a", border: "1px solid #161616" }}
    >
      <div className="flex" style={{ height: "680px" }}>
        {/* File Tree */}
        <IDEFileTree />

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <IDETabBar tabs={["main.rs", "editor.rs", "parser.rs"]} activeTab={0} />

          <div className="flex-1 flex min-w-0">
            {/* Code area with line numbers */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-shrink-0 pt-4 pb-4 pr-2 select-none" style={{ width: "48px", background: "#0a0a0a", borderRight: "1px solid #111" }}>
                {Array.from({ length: 18 }, (_, i) => (
                  <div key={i} className="text-right pr-2" style={{ fontSize: "12px", lineHeight: "22px", color: "#444", fontFamily: "monospace" }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="flex-1 pt-4 pb-4 pl-4 overflow-x-auto">
                <RustEditorCode />
                {/* Blinking cursor */}
                <div style={{ minHeight: "22px", marginTop: "2px" }}>
                  <span style={{ display: "inline-block", width: "7px", height: "16px", background: "#e8e8e8", animation: "cursor-blink 1s step-end infinite" }} />
                </div>
              </div>
            </div>

            {/* AI Panel */}
            <div
              className="flex-shrink-0 hidden lg:flex flex-col"
              style={{ width: "240px", borderLeft: "1px solid #161616", background: "#0c0c0c" }}
            >
              <AIPanelContent stage={aiStage} />
            </div>
          </div>

          <IDEStatusBar file="main.rs" language="Rust" line={18} col={1} startupTime="80ms startup" />
        </div>
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

// ── Hero Section Wrapper (matches Flux pattern) ──

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
            <LiminalIDEHeroReplica />
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

// ── 1.0 AI-Native Intelligence (with inline AI panel) ──

function LiminalAIReplica() {
  const [aiStage, setAiStage] = useState(0);
  const [highlightLines, setHighlightLines] = useState(false);

  useEffect(() => {
    const durations = [3000, 3000, 3000, 3000];
    const timeout = setTimeout(() => {
      setAiStage((s) => (s + 1) % 4);
    }, durations[aiStage]);
    return () => clearTimeout(timeout);
  }, [aiStage]);

  useEffect(() => {
    setHighlightLines(aiStage === 1 || aiStage === 2);
  }, [aiStage]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[900px] mx-auto"
      style={{ background: "#0a0a0a", border: "1px solid #161616", height: "480px" }}
    >
      <IDETabBar tabs={["auth.rs", "main.rs"]} activeTab={0} />

      <div className="flex" style={{ height: "calc(100% - 38px - 26px)" }}>
        {/* Editor with auth.rs code */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-shrink-0 pt-4 pb-4 pr-2 select-none" style={{ width: "48px", background: "#0a0a0a", borderRight: "1px solid #111" }}>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="text-right pr-2" style={{ fontSize: "12px", lineHeight: "22px", color: "#444", fontFamily: "monospace" }}>
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 pt-4 pb-4 pl-4 overflow-x-auto">
            <RustAuthCode highlightLines={highlightLines} />
          </div>
        </div>

        {/* AI Panel */}
        <div
          className="flex-shrink-0 flex flex-col"
          style={{ width: "240px", borderLeft: "1px solid #161616", background: "#0c0c0c" }}
        >
          <AIPanelContent stage={aiStage} />
        </div>
      </div>

      <IDEStatusBar file="auth.rs" language="Rust" line={14} col={5} startupTime="80ms startup" />
    </div>
  );
}

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
          <LiminalAIReplica />
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

// ── 2.0 Terminal (split view: static code + animated terminal) ──

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
      style={{ background: "#0a0a0a", border: "1px solid #161616", height: "480px" }}
    >
      {/* Top: static code editor — 60% */}
      <div style={{ height: "60%", borderBottom: "1px solid #161616" }}>
        <IDETabBar tabs={["main.rs"]} activeTab={0} />
        <div className="flex" style={{ height: "calc(100% - 38px)" }}>
          <div className="flex-shrink-0 pt-3 pb-3 pr-2 select-none" style={{ width: "40px", background: "#0a0a0a", borderRight: "1px solid #111" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="text-right pr-2" style={{ fontSize: "11px", lineHeight: "20px", color: "#444", fontFamily: "monospace" }}>
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 pt-3 pb-3 pl-3 overflow-hidden">
            <RustTerminalCode />
          </div>
        </div>
      </div>

      {/* Bottom: animated terminal — 40% */}
      <div className="flex flex-col" style={{ height: "40%" }}>
        <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: "1px solid #161616", background: "#0e0e0e" }}>
          <Terminal size={12} style={{ color: "#43b581" }} />
          <span style={{ fontSize: "12px", color: "#888" }}>Terminal</span>
        </div>
        <div className="flex-1 p-3 overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", lineHeight: "20px" }}>
          {TERMINAL_OUTPUT.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={`${i}-${looping}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              {line.type === "cmd" ? (
                <><span style={{ color: "#43b581" }}>&#10095;</span> <span style={{ color: "#e8e8e8" }}>{line.text}</span></>
              ) : (
                <span style={{ color: line.type === "ok" ? "#43b581" : "#888" }}>{line.text}</span>
              )}
            </motion.div>
          ))}
          {visibleLines >= TERMINAL_OUTPUT.length && (
            <div>
              <span style={{ color: "#43b581" }}>&#10095;</span>{" "}
              <span style={{ display: "inline-block", width: "7px", height: "14px", background: "#43b581", animation: "cursor-blink 1s step-end infinite" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
