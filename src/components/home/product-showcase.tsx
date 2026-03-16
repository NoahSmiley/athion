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
    <div ref={ref} className="flex h-[520px] bg-[#0a0a0d] text-white text-xs select-none">
      {/* Icon rail */}
      <div className="w-[36px] shrink-0 bg-[#07070b] flex flex-col items-center gap-3 pt-3 border-r border-[#1a1a22]">
        <div className="w-5 h-5 rounded-full bg-[#a78bfa]/20" />
        <div className="w-5 h-5 rounded-full bg-[#ffffff08]" />
        <div className="w-5 h-5 rounded-full bg-[#ffffff08]" />
      </div>
      {/* Sidebar */}
      <div className="w-[100px] shrink-0 bg-[#0a0a0d] border-r border-[#1a1a22] pt-3 px-2">
        <p className="text-[9px] uppercase tracking-wider text-[#52525b] mb-2 px-1">Channels</p>
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
        <div className="h-8 border-b border-[#1a1a22] flex items-center px-3 text-[11px] text-[#71717a]">
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
        <div className="h-9 border-t border-[#1a1a22] mx-3 mb-2 mt-auto flex items-center px-3 rounded-sm bg-[#0e0e14] text-[11px] text-[#52525b]">
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
        <span className="text-[13px] text-[#71717a]">&#10022;</span>
        <span className="text-[11px] text-[#52525b]">&#9776;</span>
        <span className="text-[11px] text-[#52525b]">&gt;_</span>
      </div>
      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="h-7 border-b border-[#1a1a1f] flex items-center px-3">
          <span className="text-[10px] text-[#71717a] bg-[#0e0e12] px-2 py-0.5 rounded-sm">main.rs</span>
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
        <div className="h-6 border-t border-[#1a1a1f] bg-[#08080a] flex items-center justify-between px-3 text-[10px] text-[#52525b]">
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
            <Server size={14} className="text-[#52525b] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#ccc] font-medium truncate">{s.name}</span>
                <span className="text-[9px] text-[#52525b]">{s.type}</span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 shrink-0">
              <PulsingDot /> Online
            </span>
            <span className="text-[10px] text-[#71717a] shrink-0">{s.metric}</span>
          </div>
        ))}
      </div>
      {/* Uptime bars */}
      <div className="px-4 pb-4">
        <p className="text-[9px] text-[#52525b] mb-2 uppercase tracking-wider">Uptime — 30 days</p>
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
        <span className="text-[10px] text-[#71717a]">3 in progress</span>
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
              <span className="text-[9px] text-[#52525b]">{p.progress}%</span>
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
    <section className="pt-24 pb-32 md:pt-12 md:pb-24">
      {/* Two-column header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 pb-16 lg:pb-24 px-8">
        {/* Left: headline */}
        <ScrollReveal>
          <div className="pr-0 lg:pr-8">
            <h2
              className="font-[510] text-[1.5rem] md:text-[2.5rem] lg:text-[3rem] leading-[1.33] md:leading-[1.1] lg:leading-[1] tracking-[-0.022em]"
              style={{ textWrap: "balance", maxWidth: "18ch" }}
            >
              {headline}
            </h2>
          </div>
        </ScrollReveal>

        {/* Right: description + version label */}
        <ScrollReveal delay={0.1}>
          <div className="mt-6 lg:mt-0 px-0">
            <p
              className="font-[590] text-[1.0625rem] md:text-[1.25rem] lg:text-[1.5rem] leading-[1.4] md:leading-[1.33] tracking-[-0.012em] text-[#b4bcd0]"
              style={{ textWrap: "balance" }}
            >
              {description}
            </p>

            <Link
              href={href}
              className="group inline-flex items-center mt-6 lg:mt-12"
            >
              <span className="text-[0.9375rem] leading-[1.6] tracking-[-0.011em] text-[#86848d] tabular-nums">
                {version}
              </span>
              <span className="text-[0.9375rem] leading-[1.6] tracking-[-0.011em] text-[#b4bcd0] ml-3">
                {name}
              </span>
              {comingSoon && (
                <span className="text-[0.9375rem] leading-[1.6] text-[#86848d] ml-2">(Coming soon)</span>
              )}
              <span className="text-[0.9375rem] text-[#86848d] ml-1.5 group-hover:translate-x-0.5 transition-transform duration-200">
                →
              </span>
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Full-width demo with Linear-style vignette fade */}
      <ScrollReveal delay={0.15}>
        <div
          className="relative rounded-[22px] border border-white/[0.08] p-2 select-none"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          }}
        >
          <div className="rounded-xl overflow-hidden bg-[#0a0a0d]">
            {replica}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ─── Public Export ─── */

export function ProductShowcase() {
  const sections = [
    {
      version: "1.0",
      name: "Flux",
      headline: "Communicate without compromise",
      description:
        "Voice and text chat built for teams that care about privacy. Crystal-clear 48kHz Opus audio, end-to-end encryption on everything, and lossless screen share at 60fps.",
      href: "/flux",
      replica: <FluxMiniReplica />,
    },
    {
      version: "2.0",
      name: "Liminal IDE",
      headline: "Code at the speed of thought",
      description:
        "A code editor that stays out of your way. AI-native intelligence meets terminal-first workflow — built entirely in Rust, opens in 80ms.",
      href: "/ide",
      replica: <IDEMiniReplica />,
    },
    {
      version: "3.0",
      name: "Hosting",
      headline: "Infrastructure that disappears",
      description:
        "Game servers, web hosting, and VPS — all running on dedicated hardware. No shared tenancy, no noisy neighbors, no surprises.",
      href: "/hosting",
      comingSoon: true,
      replica: <HostingMiniReplica />,
    },
    {
      version: "4.0",
      name: "Consulting",
      headline: "Engineering expertise, on demand",
      description:
        "Custom software development, architecture reviews, and technical advisory. Five years of enterprise consulting for Fortune 100 and 500 companies — now available to teams of any size.",
      href: "/consulting",
      comingSoon: true,
      replica: <ConsultingMiniReplica />,
    },
  ];

  return (
    <div>
      {sections.map((s, i) => (
        <div key={s.version}>
          {/* Full-width border line */}
          <div className="border-t border-white/[0.08]" />
          <div className="px-6 lg:px-12">
            <div className="mx-auto max-w-[1344px]">
              <ShowcaseBlock {...s} />
            </div>
          </div>
        </div>
      ))}
      {/* Bottom border after last section */}
      <div className="border-t border-white/[0.08]" />
    </div>
  );
}
