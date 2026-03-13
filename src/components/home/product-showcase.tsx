"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Server } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

/* ─── Flux Mini Replica ─── */

const fluxMessages = [
  { name: "alice", color: "#a78bfa", text: "just pushed the new auth flow" },
  { name: "bob", color: "#60a5fa", text: "nice, testing it now" },
  { name: "carol", color: "#34d399", text: "the token refresh feels instant" },
  { name: "alice", color: "#a78bfa", text: "rust btw" },
];

function FluxMiniReplica() {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    setVisibleCount(0);
    let i = 0;
    const show = () => {
      i++;
      setVisibleCount(i);
      if (i < fluxMessages.length) {
        timer = setTimeout(show, 800);
      } else {
        timer = setTimeout(() => {
          setVisibleCount(0);
          i = 0;
          timer = setTimeout(show, 600);
        }, 3000);
      }
    };
    let timer = setTimeout(show, 400);
    return () => clearTimeout(timer);
  }, [inView]);

  return (
    <div ref={ref} className="flex h-[520px] bg-[#0a0a0f] text-white text-xs select-none">
      {/* Icon rail */}
      <div className="w-[36px] shrink-0 bg-[#07070b] flex flex-col items-center gap-3 pt-3 border-r border-[#1a1a22]">
        <div className="w-5 h-5 rounded-full bg-[#a78bfa]/20" />
        <div className="w-5 h-5 rounded-full bg-[#ffffff08]" />
        <div className="w-5 h-5 rounded-full bg-[#ffffff08]" />
      </div>
      {/* Sidebar */}
      <div className="w-[100px] shrink-0 bg-[#0c0c12] border-r border-[#1a1a22] pt-3 px-2">
        <p className="text-[9px] uppercase tracking-wider text-[#555] mb-2 px-1">Channels</p>
        {["general", "design", "random"].map((ch, i) => (
          <div
            key={ch}
            className={`px-2 py-1 rounded-sm text-[11px] ${i === 0 ? "bg-[#ffffff08] text-white" : "text-[#666]"}`}
          >
            # {ch}
          </div>
        ))}
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-8 border-b border-[#1a1a22] flex items-center px-3 text-[11px] text-[#888]">
          # general
        </div>
        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          {fluxMessages.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={`${msg.name}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <div className="w-5 h-5 rounded-full shrink-0 mt-0.5" style={{ background: msg.color + "30" }} />
              <div>
                <span className="text-[11px] font-medium" style={{ color: msg.color }}>{msg.name}</span>
                <p className="text-[11px] text-[#ccc] leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="h-9 border-t border-[#1a1a22] mx-3 mb-2 mt-auto flex items-center px-3 rounded-sm bg-[#0e0e14] text-[11px] text-[#555]">
          Message #general
        </div>
      </div>
    </div>
  );
}

/* ─── IDE Mini Replica ─── */

const codeLines = [
  { tokens: [{ text: "use ", c: "#c678dd" }, { text: "std::net::TcpListener;", c: "#98c379" }] },
  { tokens: [] },
  { tokens: [{ text: "fn ", c: "#c678dd" }, { text: "main", c: "#61afef" }, { text: "() {", c: "#abb2bf" }] },
  { tokens: [{ text: "    let ", c: "#c678dd" }, { text: "listener = TcpListener::bind(", c: "#abb2bf" }, { text: '"127.0.0.1:3000"', c: "#98c379" }, { text: ")", c: "#abb2bf" }] },
  { tokens: [{ text: "        .expect(", c: "#abb2bf" }, { text: '"failed to bind"', c: "#98c379" }, { text: ");", c: "#abb2bf" }] },
  { tokens: [] },
  { tokens: [{ text: "    for ", c: "#c678dd" }, { text: "stream ", c: "#abb2bf" }, { text: "in ", c: "#c678dd" }, { text: "listener.incoming() {", c: "#abb2bf" }] },
  { tokens: [{ text: "        let ", c: "#c678dd" }, { text: "stream = stream.unwrap();", c: "#abb2bf" }] },
  { tokens: [{ text: "        handle_connection(stream);", c: "#abb2bf" }] },
  { tokens: [{ text: "    }", c: "#abb2bf" }] },
  { tokens: [{ text: "}", c: "#abb2bf" }] },
];

function IDEMiniReplica() {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-[520px] bg-[#050507] text-xs select-none">
      {/* Activity bar */}
      <div className="w-[36px] shrink-0 bg-[#08080a] flex flex-col items-center gap-4 pt-3 border-r border-[#1a1a1f]">
        <span className="text-[13px] text-[#888]">&#10022;</span>
        <span className="text-[11px] text-[#555]">&#9776;</span>
        <span className="text-[11px] text-[#555]">&gt;_</span>
      </div>
      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="h-7 border-b border-[#1a1a1f] flex items-center px-3">
          <span className="text-[10px] text-[#888] bg-[#0e0e12] px-2 py-0.5 rounded-sm">main.rs</span>
        </div>
        {/* Code */}
        <div className="flex-1 p-3 font-mono text-[11px] leading-[1.7] overflow-hidden">
          {codeLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-6 shrink-0 text-right pr-3 text-[#444] select-none">{i + 1}</span>
              <span>
                {line.tokens.map((t, j) => (
                  <span key={j} style={{ color: t.c }}>{t.text}</span>
                ))}
                {i === 3 && (
                  <span
                    className="inline-block w-[1px] h-[13px] align-middle ml-px"
                    style={{ background: cursorVisible ? "#528bff" : "transparent" }}
                  />
                )}
              </span>
            </div>
          ))}
        </div>
        {/* Status bar */}
        <div className="h-6 border-t border-[#1a1a1f] bg-[#08080a] flex items-center justify-between px-3 text-[10px] text-[#555]">
          <span>main.rs</span>
          <span>Rust &middot; Ln 4, Col 52</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Hosting Mini Replica ─── */

const servers = [
  { name: "minecraft-smp", type: "Game Server", metric: "8/20 players" },
  { name: "api-prod", type: "Web Hosting", metric: "142 req/s" },
  { name: "dev-vps", type: "VPS", metric: "23% CPU" },
];

function HostingMiniReplica() {
  return (
    <div className="flex flex-col h-[520px] bg-[#0a0a0d] text-xs select-none">
      {/* Top bar */}
      <div className="h-9 border-b border-[#1a1a1f] flex items-center justify-between px-4">
        <span className="text-[11px] text-[#ccc] font-medium">Athion Hosting</span>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <PulsingDot /> All Systems Operational
        </span>
      </div>
      {/* Server cards */}
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {servers.map((s) => (
          <div key={s.name} className="border border-[#1a1a1f] rounded-sm p-3 flex items-center gap-3">
            <Server size={14} className="text-[#555] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#ccc] font-medium truncate">{s.name}</span>
                <span className="text-[9px] text-[#555]">{s.type}</span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 shrink-0">
              <PulsingDot /> Online
            </span>
            <span className="text-[10px] text-[#888] shrink-0">{s.metric}</span>
          </div>
        ))}
      </div>
      {/* Uptime bars */}
      <div className="px-4 pb-4">
        <p className="text-[9px] text-[#555] mb-2 uppercase tracking-wider">Uptime — 30 days</p>
        <div className="flex items-end gap-[2px] h-8">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-[1px] bg-emerald-500/40"
              style={{ height: `${70 + Math.sin(i * 0.7) * 20 + (i % 3) * 5}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PulsingDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </span>
  );
}

/* ─── Consulting Mini Replica ─── */

const projects = [
  { name: "E-commerce Platform", status: "In Progress", statusColor: "#f59e0b", progress: 72, tags: ["React", "Node.js"] },
  { name: "Mobile App MVP", status: "In Review", statusColor: "#a78bfa", progress: 90, tags: ["React Native"] },
  { name: "API Migration", status: "Planning", statusColor: "#60a5fa", progress: 15, tags: ["Rust", "PostgreSQL"] },
];

function ConsultingMiniReplica() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex flex-col h-[520px] bg-[#0a0a0d] text-xs select-none">
      {/* Top bar */}
      <div className="h-9 border-b border-[#1a1a1f] flex items-center justify-between px-4">
        <span className="text-[11px] text-[#ccc] font-medium">Active Projects</span>
        <span className="text-[10px] text-[#888]">3 in progress</span>
      </div>
      {/* Project rows */}
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {projects.map((p) => (
          <div key={p.name} className="border border-[#1a1a1f] rounded-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#ccc] font-medium">{p.name}</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-sm font-medium"
                style={{ color: p.statusColor, background: p.statusColor + "18" }}
              >
                {p.status}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-[#1a1a1f] rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: p.statusColor }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${p.progress}%` } : { width: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {p.tags.map((tag) => (
                  <span key={tag} className="text-[9px] text-[#666] border border-[#1a1a1f] px-1.5 py-0.5 rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[9px] text-[#555]">{p.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Showcase Block — Linear-style layout ─── */

interface ShowcaseProps {
  version: string;
  name: string;
  headline: string;
  description: string;
  href: string;
  comingSoon?: boolean;
  replica: ReactNode;
}

function ShowcaseBlock({
  version,
  name,
  headline,
  description,
  href,
  comingSoon,
  replica,
}: ShowcaseProps) {
  return (
    <div>
      {/* Two-column header — Linear style */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
        <ScrollReveal>
          <h2 className="font-[590] text-[clamp(2.5rem,5vw,4.5rem)] tracking-[-0.028em] leading-[1.05]">
            {headline}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="lg:pt-4">
            <p className="text-foreground-muted leading-relaxed text-lg max-w-lg">
              {description}
            </p>
            <Link
              href={href}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-mono tracking-tight"
            >
              <span className="text-foreground-muted/60">{version}</span>
              <span className="text-foreground/90">{name}</span>
              {comingSoon && (
                <span className="text-foreground-muted/40 text-xs">(Coming soon)</span>
              )}
              <ArrowRight size={12} className="text-foreground-muted/60 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Full-width demo replica */}
      <ScrollReveal delay={0.15}>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] hover:shadow-[0_0_60px_rgba(255,255,255,0.02)] transition-all duration-500 overflow-hidden">
          {replica}
        </div>
      </ScrollReveal>
    </div>
  );
}

/* ─── Public Export ─── */

export function ProductShowcase() {
  return (
    <section className="py-40 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-40">
          {/* Flux */}
          <ShowcaseBlock
            version="1.0"
            name="Flux"
            headline="Communicate without compromise"
            description="Voice and text chat built for teams that care about privacy. Crystal-clear 48kHz Opus audio, end-to-end encryption on everything, and lossless screen share at 60fps."
            href="/flux"
            replica={<FluxMiniReplica />}
          />

          {/* IDE */}
          <ShowcaseBlock
            version="2.0"
            name="Liminal IDE"
            headline="Code at the speed of thought"
            description="A code editor that stays out of your way. AI-native intelligence meets terminal-first workflow — built entirely in Rust, opens in 80ms."
            href="/ide"
            replica={<IDEMiniReplica />}
          />

          {/* Hosting */}
          <ShowcaseBlock
            version="3.0"
            name="Hosting"
            headline="Infrastructure that disappears"
            description="Game servers, web hosting, and VPS — all running on dedicated hardware. No shared tenancy, no noisy neighbors, no surprises."
            href="/hosting"
            replica={<HostingMiniReplica />}
          />

          {/* Consulting */}
          <ShowcaseBlock
            version="4.0"
            name="Consulting"
            headline="Engineering expertise, on demand"
            description="Custom software development, architecture reviews, and technical advisory. Five years of enterprise consulting for Fortune 100 and 500 companies — now available to teams of any size."
            href="/consulting"
            replica={<ConsultingMiniReplica />}
          />
        </div>
      </div>
    </section>
  );
}
