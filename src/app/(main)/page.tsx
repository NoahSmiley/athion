"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProductShowcase } from "@/components/home/product-showcase";
import { BRAND } from "@/lib/constants";

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
      className="relative pt-[284px] pb-12 md:pt-[400px] md:pb-24 lg:pt-[380px] lg:pb-32 border-b border-white/[0.08] px-6 lg:px-12 overflow-hidden"
    >
      {/* Ambient glow — subtle radial gradient behind hero text */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          opacity: smoothGlow,
          top: "20%",
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
          top: "40%",
          right: "10%",
          width: "500px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(130, 100, 220, 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1344px]">
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
