"use client";

import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";

const values = [
  {
    title: "Ownership",
    description: "You own your domain end-to-end. Ship features, fix bugs, shape the product.",
  },
  {
    title: "Quality over speed",
    description: "We'd rather ship one thing well than three things half-finished.",
  },
  {
    title: "Remote-first",
    description: "Work from wherever you do your best work. Async by default.",
  },
  {
    title: "Small by choice",
    description: "We stay small so every person has maximum impact.",
  },
];

export default function CareersPage() {
  return (
    <PageTransition>
      <section className="relative min-h-[70vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
          <ScrollReveal>
            <p className="overline mb-4">Careers</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-[590] text-5xl sm:text-6xl md:text-7xl tracking-[-0.022em] leading-tight max-w-3xl">
              Build software that
              <br />
              <span className="text-accent">respects people.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-8 text-lg text-foreground-muted max-w-xl leading-relaxed">
              We&apos;re a small team building tools with high standards.
              If you care about performance, privacy, and craft — we want
              to hear from you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="overline mb-4">Culture</p>
            <h2 className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em]">
              How we work.
            </h2>
          </ScrollReveal>

          <StaggerContainer className="mt-16 grid sm:grid-cols-2 gap-12">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="border-l-2 border-accent/30 pl-6">
                  <h3 className="font-[590] text-2xl tracking-[-0.012em]">{value.title}</h3>
                  <p className="mt-3 text-foreground-muted leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="overline mb-4">Open Roles</p>
            <h2 className="font-[590] text-4xl tracking-[-0.022em]">
              Current openings.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mt-16 p-10 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-all duration-200 text-center">
              <p className="font-[590] text-xl tracking-[-0.012em]">
                No open roles right now.
              </p>
              <p className="mt-3 text-foreground-muted leading-relaxed max-w-md mx-auto">
                We&apos;re not actively hiring, but we&apos;re always interested in
                exceptional people. If you think you&apos;d be a great fit,
                introduce yourself.
              </p>
              <a
                href="mailto:careers@athion.com"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
              >
                careers@athion.com
                <ArrowRight size={14} />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}
