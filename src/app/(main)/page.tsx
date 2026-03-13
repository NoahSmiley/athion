"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { ArrowRight, Server } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProductShowcase } from "@/components/home/product-showcase";
import { BRAND } from "@/lib/constants";

/* ─── Mini product tiles for the hero composite ─── */

function HeroFluxTile() {
  const messages = [
    { name: "alice", color: "#a78bfa", text: "just pushed the new auth flow" },
    { name: "bob", color: "#60a5fa", text: "nice, testing it now" },
    { name: "carol", color: "#34d399", text: "the token refresh feels instant" },
  ];
  return (
    <div className="w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden border border-white/[0.06] text-xs select-none flex">
      <div className="w-[72px] shrink-0 bg-[#0c0c12] border-r border-[#1a1a22] pt-3 px-2">
        <p className="text-[8px] uppercase tracking-wider text-[#555] mb-1.5 px-0.5">Channels</p>
        {["general", "design"].map((ch, i) => (
          <div key={ch} className={`px-1.5 py-0.5 rounded-sm text-[9px] ${i === 0 ? "bg-[#ffffff08] text-white" : "text-[#555]"}`}>
            # {ch}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-6 border-b border-[#1a1a22] flex items-center px-2 text-[9px] text-[#666]"># general</div>
        <div className="flex-1 p-2 space-y-2 overflow-hidden">
          {messages.map((msg, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5" style={{ background: msg.color + "30" }} />
              <div>
                <span className="text-[9px] font-medium" style={{ color: msg.color }}>{msg.name}</span>
                <p className="text-[9px] text-[#999] leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroIDETile() {
  return (
    <div className="w-full h-full bg-[#050507] rounded-xl overflow-hidden border border-white/[0.06] text-xs select-none flex">
      <div className="w-[28px] shrink-0 bg-[#08080a] border-r border-[#1a1a1f] flex flex-col items-center gap-2 pt-2">
        <span className="text-[10px] text-[#666]">&#10022;</span>
        <span className="text-[8px] text-[#444]">&#9776;</span>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-5 border-b border-[#1a1a1f] flex items-center px-2">
          <span className="text-[8px] text-[#666] bg-[#0e0e12] px-1.5 py-0.5 rounded-sm">main.rs</span>
        </div>
        <div className="flex-1 p-2 font-mono text-[8px] leading-[1.6] overflow-hidden">
          <div><span className="text-[#c678dd]">use </span><span className="text-[#98c379]">std::net::TcpListener;</span></div>
          <div className="h-2" />
          <div><span className="text-[#c678dd]">fn </span><span className="text-[#61afef]">main</span><span className="text-[#abb2bf]">() {"{"}</span></div>
          <div><span className="text-[#c678dd]">    let </span><span className="text-[#abb2bf]">listener = TcpListener::bind(</span></div>
          <div><span className="text-[#98c379]">        &quot;127.0.0.1:3000&quot;</span><span className="text-[#abb2bf]">);</span></div>
        </div>
      </div>
    </div>
  );
}

function HeroHostingTile() {
  return (
    <div className="w-full h-full bg-[#0a0a0d] rounded-xl overflow-hidden border border-white/[0.06] text-xs select-none flex flex-col">
      <div className="h-6 border-b border-[#1a1a1f] flex items-center justify-between px-3">
        <span className="text-[9px] text-[#ccc] font-medium">Athion Hosting</span>
        <span className="flex items-center gap-1 text-[8px] text-emerald-400">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          Online
        </span>
      </div>
      <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
        {[{ name: "minecraft-smp", metric: "8/20" }, { name: "api-prod", metric: "142 req/s" }].map((s) => (
          <div key={s.name} className="border border-[#1a1a1f] rounded-sm p-2 flex items-center gap-2">
            <Server size={10} className="text-[#555] shrink-0" />
            <span className="text-[9px] text-[#ccc] truncate">{s.name}</span>
            <span className="text-[8px] text-[#666] ml-auto shrink-0">{s.metric}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroComposite() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative mt-16 md:mt-24">
      {/* 3D perspective container */}
      <div
        className="relative mx-auto"
        style={{
          perspective: "1200px",
          maxWidth: "1100px",
        }}
      >
        <motion.div
          className="grid grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0, rotateX: 8, y: 40 }}
          animate={inView ? { opacity: 1, rotateX: 2, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="h-[180px] md:h-[260px]">
            <HeroFluxTile />
          </div>
          <div className="h-[180px] md:h-[260px]">
            <HeroIDETile />
          </div>
          <div className="h-[180px] md:h-[260px]">
            <HeroHostingTile />
          </div>
        </motion.div>
      </div>

      {/* Bottom vignette fade — Linear style */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}

/* ─── Hero ─── */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const smoothGlow = useSpring(glowOpacity, { stiffness: 80, damping: 30 });

  return (
    <section
      ref={ref}
      className="relative pt-[180px] md:pt-[260px] lg:pt-[280px] pb-24 md:pb-32 lg:pb-40 border-b border-white/[0.08] overflow-hidden"
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          opacity: smoothGlow,
          top: "15%",
          left: "5%",
          width: "700px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(90, 90, 200, 0.06) 0%, rgba(90, 90, 200, 0.02) 40%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          opacity: smoothGlow,
          top: "30%",
          right: "10%",
          width: "500px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(130, 100, 220, 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1344px] px-6 lg:px-12">
        {/* Title */}
        <ScrollReveal>
          <h1 className="font-[510] text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] tracking-[-0.022em] leading-[1.1] md:leading-[1.1] lg:leading-[1.06] whitespace-pre-line px-8">
            <span
              className="bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #f7f8f8 0%, #d0d6e0 50%, #f7f8f8 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "hero-shimmer 8s ease-in-out infinite",
              }}
            >
              {BRAND.tagline}
            </span>
          </h1>
        </ScrollReveal>

        {/* Description row */}
        <div className="mt-5 md:mt-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6 px-8">
          <ScrollReveal delay={0.15}>
            <p className="text-[0.9375rem] leading-[1.6] tracking-[-0.011em] text-[#b4bcd0] max-w-lg">
              {BRAND.description}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#111] text-sm font-[510] rounded-full hover:bg-white/90 active:scale-[0.98] transition-all duration-150"
              >
                Get Started
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] text-[#b4bcd0] text-sm font-[510] hover:text-white hover:border-white/[0.15] rounded-full active:scale-[0.98] transition-all duration-150"
              >
                Learn More
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Product composite image */}
        <HeroComposite />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <ProductShowcase />
    </PageTransition>
  );
}
