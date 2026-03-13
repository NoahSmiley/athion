"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ScrollSlide, ScrollText } from "@/components/parallax";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";
import { ProductShowcase } from "@/components/home/product-showcase";
import { BRAND, VALUES } from "@/lib/constants";

const homeBenchmarks: BenchmarkGroup[] = [
  {
    metric: "Memory Usage (Idle)",
    ours: { label: "Flux", value: 48 },
    theirs: { label: "Discord", value: 320 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "App Binary Size",
    ours: { label: "Flux", value: 12 },
    theirs: { label: "Discord", value: 300 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "Cold Start Time",
    ours: { label: "Liminal IDE", value: 80 },
    theirs: { label: "VS Code", value: 920 },
    unit: "ms",
    lowerIsBetter: true,
  },
  {
    metric: "CPU Usage (Idle)",
    ours: { label: "Liminal IDE", value: 0.3 },
    theirs: { label: "VS Code", value: 4.2 },
    unit: "%",
    lowerIsBetter: true,
  },
];

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], [0, -80]);
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
      <motion.div
        className="mx-auto max-w-7xl px-6 w-full pt-32 pb-20"
        style={{ opacity: smoothOpacity, y: smoothY }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end">
          {/* Left — massive headline */}
          <div>
            <ScrollReveal>
              <h1 className="gradient-text font-[590] text-[clamp(3.5rem,8vw,7rem)] tracking-[-0.032em] leading-[0.95] whitespace-pre-line">
                {BRAND.tagline}
              </h1>
            </ScrollReveal>
          </div>

          {/* Right — description + CTAs */}
          <div className="lg:pb-3">
            <ScrollReveal delay={0.15}>
              <p className="text-lg text-foreground-muted max-w-md leading-relaxed">
                {BRAND.description}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-150"
                >
                  Get Started
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground-muted text-sm hover:text-foreground hover:border-border-light hover:bg-white/[0.03] rounded-[6px] active:scale-[0.98] transition-all duration-150"
                >
                  Learn More
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <ScrollReveal delay={0.45}>
          <div className="mt-24 flex flex-col items-center gap-2 text-foreground-muted">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-foreground-muted/40 to-transparent animate-pulse" />
          </div>
        </ScrollReveal>
      </motion.div>
    </section>
  );
}

function Performance() {
  return (
    <BenchmarkSection
      subtitle="Performance"
      title="Lighter. Faster. By design."
      description="Software shouldn't fight your hardware for attention. Every Athion product is built to use less memory, start instantly, and stay out of the way while you work."
      benchmarks={homeBenchmarks}
      statCards={[
        { value: "6×", label: "Less memory", detail: "Flux vs Discord at idle" },
        { value: "25×", label: "Smaller install", detail: "Flux vs Discord bundle" },
        { value: "11×", label: "Faster startup", detail: "IDE vs VS Code cold start" },
        { value: "14×", label: "Lower CPU", detail: "IDE vs VS Code at idle" },
      ]}
    />
  );
}

function Philosophy() {
  return (
    <section className="py-40 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <ScrollReveal>
              <p className="overline mb-4">Philosophy</p>
            </ScrollReveal>
            <ScrollText
              text="The best software is the kind you don't notice."
              tag="h2"
              className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
            />
          </div>

          <div className="flex flex-col gap-8 md:pt-12">
            <ScrollReveal>
              <p className="text-foreground-muted leading-relaxed text-lg">
                We believe the most elegant tools are invisible. They don&apos;t
                demand your attention — they amplify your intention.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-foreground-muted leading-relaxed text-lg">
                Every pixel, every millisecond, every interaction is considered.
                Not to impress, but to disappear. What remains is your work,
                undisturbed.
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((value, i) => (
            <ScrollSlide key={value.title} from={i % 2 === 0 ? "left" : "right"} distance={40}>
              <div className="border-t border-border pt-6">
                <h3 className="font-[590] text-lg tracking-[-0.012em]">{value.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            </ScrollSlide>
          ))}
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
      <Performance />
      <Philosophy />
    </PageTransition>
  );
}
