"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Server, Code2 } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FluxLogo } from "@/components/flux-logo";

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
    <div ref={ref} className="flex h-[420px] bg-[#0a0a0f] text-white text-xs select-none">
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
    <div className="flex h-[420px] bg-[#050507] text-xs select-none">
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
    <div className="flex flex-col h-[420px] bg-[#0a0a0d] text-xs select-none">
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
    <div ref={ref} className="flex flex-col h-[420px] bg-[#0a0a0d] text-xs select-none">
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

/* ─── Showcase Blocks ─── */

interface ShowcaseProps {
  info: ReactNode;
  replica: ReactNode;
  reverse?: boolean;
}

function ShowcaseBlock({ info, replica, reverse }: ShowcaseProps) {
  return (
    <ScrollReveal>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className={reverse ? "md:order-2" : ""}>{info}</div>
        <div className={`border border-border rounded-sm overflow-hidden min-h-[360px] ${reverse ? "md:order-1" : ""}`}>
          {replica}
        </div>
      </div>
    </ScrollReveal>
  );
}

interface FeatureItem {
  text: string;
}

function ProductInfo({
  icon,
  name,
  description,
  features,
  href,
  cta = "Learn more",
  badge,
}: {
  icon: ReactNode;
  name: string;
  description: string;
  features: FeatureItem[];
  href: string;
  cta?: string;
  badge?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-accent">{icon}</div>
        {badge && (
          <span className="text-[10px] uppercase tracking-widest text-foreground-muted border border-border px-2 py-0.5">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-serif text-3xl sm:text-4xl tracking-[-0.02em]">{name}</h3>
      <p className="mt-3 text-foreground-muted leading-relaxed">{description}</p>
      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f.text} className="flex items-center gap-2 text-sm text-foreground-muted">
            <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
            {f.text}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent hover:text-foreground transition-colors"
      >
        {cta} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

/* ─── Public Export ─── */

export function ProductShowcase() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">What we build</p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight max-w-2xl">
            Software, hosting, and consulting — under one roof.
          </h2>
        </ScrollReveal>

        <div className="mt-24 flex flex-col gap-32">
          {/* Flux — info left, demo right */}
          <ShowcaseBlock
            info={
              <ProductInfo
                icon={<FluxLogo size={24} />}
                name="Flux"
                description="Voice & text chat with crystal audio, E2EE, and lossless screen share."
                features={[
                  { text: "48kHz Opus voice — studio quality" },
                  { text: "End-to-end encrypted by default" },
                  { text: "Lossless screen share at 60fps" },
                  { text: "AI noise suppression" },
                ]}
                href="/flux"
              />
            }
            replica={<FluxMiniReplica />}
          />

          {/* IDE — demo left, info right */}
          <ShowcaseBlock
            reverse
            info={
              <ProductInfo
                icon={<span className="font-mono text-base">&gt;_</span>}
                name="Liminal IDE"
                description="AI-native code editor built in Rust. Opens in 80ms."
                badge="Free"
                features={[
                  { text: "Inline AI editing and generation" },
                  { text: "Terminal-first workflow" },
                  { text: "Minimal, distraction-free UI" },
                  { text: "Native Rust performance" },
                ]}
                href="/ide"
              />
            }
            replica={<IDEMiniReplica />}
          />

          {/* Hosting — info left, demo right */}
          <ShowcaseBlock
            info={
              <ProductInfo
                icon={<Server size={24} />}
                name="Hosting"
                description="Game servers, web & app hosting, and VPS — all on dedicated hardware."
                features={[
                  { text: "Always-on with 99.9% uptime" },
                  { text: "Automatic daily backups" },
                  { text: "Full SSH and root access" },
                  { text: "Custom domains and SSL" },
                ]}
                href="/hosting"
              />
            }
            replica={<HostingMiniReplica />}
          />

          {/* Consulting — demo left, info right */}
          <ShowcaseBlock
            reverse
            info={
              <ProductInfo
                icon={<Code2 size={24} />}
                name="Consulting"
                description="Custom software development, architecture reviews, and technical advisory."
                features={[
                  { text: "Full-stack web applications" },
                  { text: "Mobile apps — iOS and Android" },
                  { text: "Infrastructure and DevOps" },
                  { text: "Technical advisory and audits" },
                ]}
                href="/consulting"
                cta="Get a quote"
              />
            }
            replica={<ConsultingMiniReplica />}
          />
        </div>
      </div>
    </section>
  );
}
