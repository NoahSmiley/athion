"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ATHION_PRO } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();

    if (!meData.user) {
      router.push("/signup");
      return;
    }

    const priceKey = `athion_pro_${annual ? "yearly" : "monthly"}`;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceKey }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <section className="relative min-h-[50vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-12 text-center">
          <ScrollReveal>
            <p className="overline mb-4">Pricing</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-[590] text-5xl sm:text-6xl tracking-[-0.022em]">
              One subscription.{"\n"}Everything included.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-foreground-muted max-w-lg mx-auto leading-relaxed">
              Full access to Flux and Liminal IDE — with more on the way. No hidden fees. Cancel anytime.
            </p>
          </ScrollReveal>

          {/* Monthly/Yearly toggle */}
          <ScrollReveal delay={0.3}>
            <div className="mt-10 inline-flex items-center gap-1 p-1 border border-white/[0.06] rounded-[6px]">
              <button
                onClick={() => setAnnual(false)}
                className="relative px-5 py-2 text-sm transition-colors"
              >
                {!annual && (
                  <motion.div
                    layoutId="pricing-toggle"
                    className="absolute inset-0 bg-accent rounded-[4px]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={cn("relative z-10", !annual ? "text-background" : "text-foreground-muted hover:text-foreground")}>
                  Monthly
                </span>
              </button>
              <button
                onClick={() => setAnnual(true)}
                className="relative px-5 py-2 text-sm transition-colors"
              >
                {annual && (
                  <motion.div
                    layoutId="pricing-toggle"
                    className="absolute inset-0 bg-accent rounded-[4px]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={cn("relative z-10", annual ? "text-background" : "text-foreground-muted hover:text-foreground")}>
                  Yearly
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-70">
                    Save 20%
                  </span>
                </span>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="p-10 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-all duration-200">
              <h3 className="font-[590] text-3xl tracking-[-0.012em]">
                {ATHION_PRO.name}
              </h3>
              <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                {ATHION_PRO.description}
              </p>

              <div className="mt-8 flex items-baseline gap-1">
                <span className="font-[590] text-5xl tracking-[-0.022em]">
                  ${annual ? ATHION_PRO.yearlyPrice : ATHION_PRO.monthlyPrice}
                </span>
                <span className="text-sm text-foreground-muted">
                  /{annual ? "year" : "month"}
                </span>
              </div>

              {annual && (
                <p className="mt-1 text-xs text-foreground-muted">
                  ${(ATHION_PRO.yearlyPrice / 12).toFixed(2)}/month billed annually
                </p>
              )}

              <ul className="mt-10 flex flex-col gap-3">
                {ATHION_PRO.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              {ATHION_PRO.comingSoon.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <p className="text-xs text-foreground-muted/50 uppercase tracking-wider mb-3">Coming soon</p>
                  <ul className="flex flex-col gap-3">
                    {ATHION_PRO.comingSoon.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Clock size={14} className="text-foreground-muted/30 mt-0.5 shrink-0" />
                        <span className="text-foreground-muted/50">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-10 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Subscribe"}
                {!loading && <ArrowRight size={14} />}
              </button>
            </div>
          </ScrollReveal>
          {/* Transparency link */}
          <ScrollReveal delay={0.05}>
            <div className="mt-10 text-center">
              <Link
                href="/transparency"
                className="group inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
              >
                See where your money goes
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}
