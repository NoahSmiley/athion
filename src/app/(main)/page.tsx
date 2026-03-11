"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Server, Code2 } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import { ScrollSlide, ScrollText } from "@/components/parallax";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";
import { BrainLogo } from "@/components/brain-logo";
import { FluxLogo } from "@/components/flux-logo";
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
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 0.6], [0, -80]);
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <section ref={ref} className="relative min-h-[120vh] flex items-center justify-center">
      <motion.div
        className="text-center px-6 max-w-4xl"
        style={{ opacity: smoothOpacity, scale: smoothScale, y: smoothY }}
      >
        <ScrollReveal>
          <BrainLogo size={64} className="mx-auto mb-8 opacity-60" />
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl tracking-[-0.03em] leading-[0.9]">
            {BRAND.tagline}
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <p className="mt-8 text-lg sm:text-xl text-foreground-muted max-w-lg mx-auto leading-relaxed">
            {BRAND.description}
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.4}>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-none hover:bg-accent-hover transition-colors"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground-muted text-sm hover:text-foreground hover:border-border-light transition-colors"
            >
              Learn More
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.55}>
          <div className="mt-20 flex flex-col items-center gap-2 text-foreground-muted">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <div className="w-px h-8 bg-border-light" />
          </div>
        </ScrollReveal>
      </motion.div>
    </section>
  );
}

function Products() {
  const items = [
    {
      icon: <span className="font-mono text-base">&gt;_</span>,
      name: "Liminal IDE",
      description: "AI-native code editor built in Rust. Free with every Athion account.",
      tag: "Free",
      href: "/ide",
    },
    {
      icon: <FluxLogo size={24} />,
      name: "Flux",
      description: "Voice & text chat app with crystal audio, E2EE, and lossless screen share.",
      tag: "Paid",
      href: "/flux",
    },
    {
      icon: <Server size={24} />,
      name: "Hosting",
      description: "Game servers, web & app hosting, and VPS — all on dedicated hardware.",
      tag: "Paid",
      href: "/hosting",
    },
    {
      icon: <Code2 size={24} />,
      name: "Consulting",
      description: "Custom software development, architecture reviews, and technical advisory.",
      tag: "Hourly / Project",
      href: "/consulting",
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <ScrollReveal>
            <p className="overline mb-4">What we do</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight">
              Software, hosting, and consulting — under one roof.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-foreground-muted leading-relaxed">
              One account gives you access to everything. Pick what you need.
            </p>
          </ScrollReveal>
        </div>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <StaggerItem key={item.name}>
              <Link href={item.href} className="group block h-full">
                <div className="p-6 border border-border rounded-sm flex flex-col h-full transition-colors group-hover:border-border-light">
                  <div className="flex items-start justify-between">
                    <div className="text-accent">{item.icon}</div>
                    <span className="text-[10px] uppercase tracking-widest text-foreground-muted border border-border px-2 py-0.5">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl">{item.name}</h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {item.description}
                  </p>
                  <span className="mt-4 text-xs text-accent group-hover:text-foreground transition-colors inline-flex items-center gap-1">
                    Learn more <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
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
              className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight"
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
                <h3 className="font-serif text-lg">{value.title}</h3>
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
      <Products />
      <Performance />
      <Philosophy />
    </PageTransition>
  );
}
