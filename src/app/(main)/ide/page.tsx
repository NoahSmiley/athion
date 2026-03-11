"use client";

import { useState } from "react";
import { Sparkles, Terminal, Minus, Gauge, ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";
import { BenchmarkSection, type BenchmarkGroup } from "@/components/benchmark";
import { IDE_FEATURES } from "@/lib/constants";

const ideBenchmarks: BenchmarkGroup[] = [
  {
    metric: "Cold Start Time",
    ours: { label: "Liminal IDE", value: 80 },
    theirs: { label: "VS Code", value: 920 },
    unit: "ms",
    lowerIsBetter: true,
  },
  {
    metric: "Memory Usage (Idle)",
    ours: { label: "Liminal IDE", value: 45 },
    theirs: { label: "VS Code", value: 550 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "Memory (Large Project)",
    ours: { label: "Liminal IDE", value: 120 },
    theirs: { label: "VS Code", value: 1400 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "CPU Usage (Idle)",
    ours: { label: "Liminal IDE", value: 0.3 },
    theirs: { label: "VS Code", value: 4.2 },
    unit: "%",
    lowerIsBetter: true,
  },
  {
    metric: "Binary Size",
    ours: { label: "Liminal IDE", value: 8 },
    theirs: { label: "VS Code", value: 350 },
    unit: " MB",
    lowerIsBetter: true,
  },
  {
    metric: "File Open Time (10K line file)",
    ours: { label: "Liminal IDE", value: 12 },
    theirs: { label: "VS Code", value: 85 },
    unit: "ms",
    lowerIsBetter: true,
  },
];

const iconMap = { Sparkles, Terminal, Minus, Gauge } as const;

function IDEHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <ScrollReveal>
          <span className="font-mono text-4xl text-accent">&gt;_</span>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="mt-6 font-serif text-5xl sm:text-6xl md:text-7xl tracking-[-0.02em] leading-none">
            Liminal IDE
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-lg sm:text-xl text-foreground-muted max-w-lg leading-relaxed">
            A code editor that stays out of your way. AI-native intelligence
            meets terminal-first workflow, built entirely in Rust.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <div className="mt-4 inline-block px-3 py-1 border border-accent/30 text-accent text-xs uppercase tracking-widest">
            Coming Soon
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function IDEFeatures() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">Preview</p>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em]">
            What we&apos;re building.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 gap-8">
          {IDE_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <StaggerItem key={feature.title}>
                <div className="p-8 bg-background-elevated border border-border rounded-sm">
                  <Icon size={20} className="text-accent" />
                  <h3 className="mt-4 font-serif text-xl">{feature.title}</h3>
                  <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Editor mockup */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 border border-border rounded-sm overflow-hidden bg-background-elevated">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-foreground-muted/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground-muted/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground-muted/20" />
              <span className="ml-3 text-xs text-foreground-muted font-mono">main.rs</span>
            </div>
            <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto">
              <code>
                <span className="text-foreground-muted">{"// "}</span>
                <span className="text-foreground-muted italic">The editor that disappears</span>
                {"\n"}
                <span className="text-accent">fn</span>{" "}
                <span className="text-foreground">main</span>
                <span className="text-foreground-muted">{"()"}</span>{" "}
                <span className="text-foreground-muted">{"{"}</span>
                {"\n"}
                {"    "}
                <span className="text-accent">let</span>{" "}
                <span className="text-foreground">focus</span>{" "}
                <span className="text-foreground-muted">=</span>{" "}
                <span className="text-foreground">Flow</span>
                <span className="text-foreground-muted">::</span>
                <span className="text-foreground">enter</span>
                <span className="text-foreground-muted">();</span>
                {"\n"}
                {"    "}
                <span className="text-foreground">focus</span>
                <span className="text-foreground-muted">.</span>
                <span className="text-foreground">write</span>
                <span className="text-foreground-muted">(</span>
                <span className="text-accent">&quot;beautifully&quot;</span>
                <span className="text-foreground-muted">);</span>
                {"\n"}
                <span className="text-foreground-muted">{"}"}</span>
              </code>
            </pre>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

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
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-xl text-center">
        <ScrollReveal>
          <p className="overline mb-4">Early Access</p>
          <h2 className="font-serif text-4xl tracking-[-0.02em]">
            Join the waitlist.
          </h2>
          <p className="mt-4 text-foreground-muted">
            Be the first to know when Liminal IDE is ready.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          {submitted ? (
            <div className="mt-8 p-6 border border-accent/30 text-accent text-sm">
              Thank you. We&apos;ll be in touch.
            </div>
          ) : (
            <>
              {error && (
                <div className="mt-8 p-3 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-3 bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
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

export default function IDEPage() {
  return (
    <PageTransition>
      <IDEHero />
      <IDEFeatures />
      <IDEBenchmarks />
      <Waitlist />
    </PageTransition>
  );
}
