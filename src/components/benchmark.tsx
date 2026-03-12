"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export interface BenchmarkGroup {
  metric: string;
  ours: { label: string; value: number };
  theirs: { label: string; value: number };
  unit: string;
  lowerIsBetter?: boolean;
}

function BenchmarkRow({ b }: { b: BenchmarkGroup }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.55"],
  });

  const max = Math.max(b.ours.value, b.theirs.value);
  const oursPercent = (b.ours.value / max) * 100;
  const theirsPercent = (b.theirs.value / max) * 100;

  const scaleOurs = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleTheirs = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const smoothScaleOurs = useSpring(scaleOurs, { stiffness: 60, damping: 20 });
  const smoothScaleTheirs = useSpring(scaleTheirs, { stiffness: 60, damping: 20 });

  const oursIsWinner = b.lowerIsBetter
    ? b.ours.value < b.theirs.value
    : b.ours.value > b.theirs.value;

  return (
    <div ref={ref} className="py-6 border-b border-border/30 last:border-b-0">
      {/* Metric label */}
      <p className="text-[11px] uppercase tracking-[0.08em] text-foreground-muted/50 mb-4">
        {b.metric}
        {b.lowerIsBetter && (
          <span className="ml-2 normal-case tracking-normal opacity-60">
            (lower is better)
          </span>
        )}
      </p>

      {/* Ours */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className={`text-xs ${oursIsWinner ? "text-foreground font-medium" : "text-foreground-muted/60"}`}>
            {b.ours.label}
          </span>
          <span className={`text-xs font-mono ${oursIsWinner ? "text-foreground" : "text-foreground-muted/40"}`}>
            {b.ours.value}{b.unit}
          </span>
        </div>
        <div className="h-[3px] w-full rounded-full overflow-hidden bg-transparent">
          <motion.div
            className={`h-full rounded-full ${oursIsWinner ? "bg-foreground" : "bg-foreground-muted/20"}`}
            style={{
              width: `${oursPercent}%`,
              scaleX: smoothScaleOurs,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>

      {/* Theirs */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className={`text-xs ${!oursIsWinner ? "text-foreground font-medium" : "text-foreground-muted/60"}`}>
            {b.theirs.label}
          </span>
          <span className={`text-xs font-mono ${!oursIsWinner ? "text-foreground" : "text-foreground-muted/40"}`}>
            {b.theirs.value}{b.unit}
          </span>
        </div>
        <div className="h-[3px] w-full rounded-full overflow-hidden bg-transparent">
          <motion.div
            className={`h-full rounded-full ${!oursIsWinner ? "bg-foreground" : "bg-foreground-muted/20"}`}
            style={{
              width: `${theirsPercent}%`,
              scaleX: smoothScaleTheirs,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    </div>
  );
}

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
    <section className="py-32 border-t border-border/50">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header — centered */}
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-[0.08em] text-foreground-muted/50 mb-4">
            {subtitle}
          </p>
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-[590] tracking-[-0.022em] leading-[1.12]">
            {title}
          </h2>
          <p className="mt-4 text-foreground-muted leading-relaxed max-w-2xl mx-auto text-sm">
            {description}
          </p>
        </div>

        {/* Metric rows */}
        <div className="border-t border-border/30">
          {benchmarks.map((b) => (
            <BenchmarkRow key={b.metric} b={b} />
          ))}
        </div>

        {/* Stat highlights — horizontal row, no cards */}
        {statCards && (
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {statCards.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-mono text-3xl sm:text-4xl text-foreground tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-foreground-muted mt-1.5">{stat.label}</p>
                <p className="text-[10px] text-foreground-muted/50 mt-0.5">{stat.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
