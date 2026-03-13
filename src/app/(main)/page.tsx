"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProductShowcase } from "@/components/home/product-showcase";
import { BRAND } from "@/lib/constants";

function Hero() {
  return (
    <section className="pt-[284px] pb-12 md:pt-[478px] md:pb-24 lg:pt-[460px] lg:pb-32 border-b border-white/[0.08] px-6 lg:px-12">
      <div className="mx-auto max-w-[1344px]">
        {/* Title — Linear uses title-8 (4rem/64px) desktop, title-5 (2.5rem) mobile, weight 510 */}
        <ScrollReveal>
          <h1
            className="font-[510] text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] tracking-[-0.022em] leading-[1.1] md:leading-[1.1] lg:leading-[1.06] whitespace-pre-line px-8"
          >
            {BRAND.tagline}
          </h1>
        </ScrollReveal>

        {/* Description row — Linear uses flex justify-between for desc + link */}
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
