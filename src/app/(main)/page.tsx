"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProductShowcase } from "@/components/home/product-showcase";
import { BRAND } from "@/lib/constants";

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end">
          {/* Left — headline */}
          <div>
            <ScrollReveal>
              <h1 className="font-[590] text-[clamp(3rem,6vw,5.5rem)] tracking-[-0.032em] leading-[0.95] whitespace-pre-line">
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
