"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

interface BenchmarkBar {
  label: string;
  value: number;
  max: number;
  unit: string;
  highlight?: boolean;
}

/**
 * Animated benchmark bar — fills to its value as it scrolls into view.
 */
function AnimatedBar({ label, value, max, unit, highlight }: BenchmarkBar) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"],
  });

  const width = useTransform(scrollYProgress, [0, 1], [0, (value / max) * 100]);
  const smoothWidth = useSpring(width, { stiffness: 60, damping: 20 });

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className={`text-sm ${highlight ? "text-foreground font-medium" : "text-foreground-muted"}`}>
          {label}
        </span>
        <span className={`text-sm font-mono ${highlight ? "text-accent" : "text-foreground-muted"}`}>
          {value}{unit}
        </span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${highlight ? "bg-accent" : "bg-foreground-muted/30"}`}
          style={{ width: "0%" }}
        />
        <motion.div
          className={`h-full rounded-full -mt-2 ${highlight ? "bg-accent" : "bg-foreground-muted/30"}`}
          style={{ width: `${(value / max) * 100}%`, scaleX: smoothWidth, transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}

/**
 * Scroll-driven counter — number counts up as element enters viewport.
 */
function AnimatedCounter({ value, unit, ref: scrollRef }: { value: number; unit: string; ref: React.RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start 0.85", "start 0.4"],
  });

  const count = useTransform(scrollYProgress, [0, 1], [0, value]);
  const smoothCount = useSpring(count, { stiffness: 60, damping: 20 });

  return (
    <motion.span className="font-mono text-4xl sm:text-5xl text-accent tabular-nums">
      {/* We use the raw value since motion.span doesn't render transforms as text */}
      <AnimatedNumber value={smoothCount} />
      <span className="text-lg text-foreground-muted ml-1">{unit}</span>
    </motion.span>
  );
}

function AnimatedNumber({ value }: { value: ReturnType<typeof useSpring> }) {
  // Use useTransform to create a string from the spring value
  const display = useTransform(value, (v) => Math.round(v).toString());

  return <motion.span>{display}</motion.span>;
}

export interface BenchmarkGroup {
  metric: string;
  ours: { label: string; value: number };
  theirs: { label: string; value: number };
  unit: string;
  lowerIsBetter?: boolean;
}

/**
 * Full benchmark comparison section with animated bars.
 */
export function BenchmarkSection({
  title,
  subtitle,
  description,
  benchmarks,
  statCards,
}: {
  title: string;
  subtitle: string;
  description: string;
  benchmarks: BenchmarkGroup[];
  statCards?: { value: string; label: string; detail: string }[];
}) {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="md:sticky md:top-32">
            <p className="overline mb-4">{subtitle}</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.02em] leading-tight">
              {title}
            </h2>
            <p className="mt-6 text-foreground-muted leading-relaxed">
              {description}
            </p>

            {statCards && (
              <div className="mt-10 grid grid-cols-2 gap-4">
                {statCards.map((stat) => {
                  const ref = useRef<HTMLDivElement>(null);
                  return (
                    <div key={stat.label} ref={ref} className="p-4 bg-background-elevated border border-border rounded-sm">
                      <p className="font-mono text-2xl text-accent">{stat.value}</p>
                      <p className="text-sm text-foreground mt-1">{stat.label}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{stat.detail}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-10">
            {benchmarks.map((b) => {
              const max = Math.max(b.ours.value, b.theirs.value) * 1.15;
              const oursIsHighlight = b.lowerIsBetter
                ? b.ours.value < b.theirs.value
                : b.ours.value > b.theirs.value;

              return (
                <div key={b.metric} className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-foreground-muted">
                    {b.metric}
                    {b.lowerIsBetter && (
                      <span className="ml-2 text-[10px] normal-case tracking-normal opacity-60">
                        (lower is better)
                      </span>
                    )}
                  </h3>
                  <BenchmarkBarPair
                    ours={{ label: b.ours.label, value: b.ours.value, max, unit: b.unit, highlight: oursIsHighlight }}
                    theirs={{ label: b.theirs.label, value: b.theirs.value, max, unit: b.unit, highlight: !oursIsHighlight }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenchmarkBarPair({ ours, theirs }: { ours: BenchmarkBar; theirs: BenchmarkBar }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"],
  });

  const scaleOurs = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleTheirs = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const smoothScaleOurs = useSpring(scaleOurs, { stiffness: 60, damping: 20 });
  const smoothScaleTheirs = useSpring(scaleTheirs, { stiffness: 60, damping: 20 });

  return (
    <div ref={ref} className="space-y-3">
      {/* Ours */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className={`text-sm ${ours.highlight ? "text-foreground font-medium" : "text-foreground-muted"}`}>
            {ours.label}
          </span>
          <span className={`text-sm font-mono ${ours.highlight ? "text-accent" : "text-foreground-muted"}`}>
            {ours.value}{ours.unit}
          </span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${ours.highlight ? "bg-accent" : "bg-foreground-muted/30"}`}
            style={{
              width: `${(ours.value / ours.max) * 100}%`,
              scaleX: smoothScaleOurs,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
      {/* Theirs */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className={`text-sm ${theirs.highlight ? "text-foreground font-medium" : "text-foreground-muted"}`}>
            {theirs.label}
          </span>
          <span className={`text-sm font-mono ${theirs.highlight ? "text-accent" : "text-foreground-muted"}`}>
            {theirs.value}{theirs.unit}
          </span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${theirs.highlight ? "bg-foreground-muted/30" : "bg-foreground-muted/30"}`}
            style={{
              width: `${(theirs.value / theirs.max) * 100}%`,
              scaleX: smoothScaleTheirs,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    </div>
  );
}
