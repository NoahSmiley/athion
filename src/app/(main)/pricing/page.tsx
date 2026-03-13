"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ATHION_PLAN } from "@/lib/constants";
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

    const priceKey = `athion_${annual ? "yearly" : "monthly"}`;

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
              Full access to Flux, Liminal IDE, Hosting, and game servers. No hidden fees. Cancel anytime.
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
                {ATHION_PLAN.name}
              </h3>
              <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                {ATHION_PLAN.description}
              </p>

              <div className="mt-8 flex items-baseline gap-1">
                <span className="font-[590] text-5xl tracking-[-0.022em]">
                  ${annual ? ATHION_PLAN.yearlyPrice : ATHION_PLAN.monthlyPrice}
                </span>
                <span className="text-sm text-foreground-muted">
                  /{annual ? "year" : "month"}
                </span>
              </div>

              {annual && (
                <p className="mt-1 text-xs text-foreground-muted">
                  ${(ATHION_PLAN.yearlyPrice / 12).toFixed(2)}/month billed annually
                </p>
              )}

              <ul className="mt-10 flex flex-col gap-3">
                {ATHION_PLAN.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground-muted">{feature}</span>
                  </li>
                ))}
              </ul>

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

          {/* Pricing transparency */}
          <ScrollReveal delay={0.1}>
            <div className="mt-16 border-t border-white/[0.08] pt-16">
              <p className="overline mb-4">Where your money goes</p>
              <h2 className="font-[590] text-2xl tracking-[-0.012em]">
                Full transparency. Real costs.
              </h2>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed max-w-lg">
                Most companies hide their margins. We&apos;d rather show you exactly what it costs
                to run Athion — and let the value speak for itself.
              </p>

              <div className="mt-10 flex flex-col gap-0">
                {[
                  {
                    label: "Voice infrastructure",
                    service: "LiveKit + Krisp",
                    cost: "$50/mo",
                    detail:
                      "Real-time voice relay servers, AI noise suppression, and WebRTC infrastructure that powers Flux. This is our single largest vendor cost — quality real-time audio doesn't come cheap.",
                  },
                  {
                    label: "Server hardware & depreciation",
                    service: "Self-hosted",
                    cost: "~$25/mo",
                    detail:
                      "Dedicated server hardware that runs all hosting, game servers, and Athion infrastructure. Amortized cost of the machines themselves — CPUs, RAM, SSDs, and replacement parts over their lifespan.",
                  },
                  {
                    label: "Power & cooling",
                    service: "24/7 uptime",
                    cost: "~$20/mo",
                    detail:
                      "Electricity to keep servers running around the clock. No sleep timers, no cold starts. Your game servers and deployments are always on.",
                  },
                  {
                    label: "Network & connectivity",
                    service: "Dedicated line",
                    cost: "~$15/mo",
                    detail:
                      "High-bandwidth internet dedicated to server traffic. This is what keeps latency low for game servers and ensures fast deploys for hosted apps.",
                  },
                  {
                    label: "Domains, DNS & SSL",
                    service: "Cloudflare + Let's Encrypt",
                    cost: "~$2/mo",
                    detail:
                      "Domain registrations, DNS management, and automatic SSL provisioning. We use Let's Encrypt for certificates — HTTPS is not a premium feature.",
                  },
                  {
                    label: "Product development",
                    service: "Everything else",
                    cost: "remainder",
                    detail:
                      "What's left goes directly into building and improving the product. New features, performance optimizations, bug fixes, and support.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="py-5 border-b border-white/[0.06] first:border-t first:border-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3">
                          <span className="font-[510] text-sm">{item.label}</span>
                          <span className="text-[11px] text-foreground-muted/40">{item.service}</span>
                        </div>
                        <p className="mt-1.5 text-xs text-foreground-muted/70 leading-relaxed max-w-md">
                          {item.detail}
                        </p>
                      </div>
                      <span className="text-sm text-foreground-muted font-mono tabular-nums shrink-0 pt-0.5">
                        {item.cost}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Value comparison */}
              <div className="mt-10 p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <p className="font-[510] text-sm mb-3">What this would cost you separately</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {[
                    ["Discord Nitro", "$10/mo"],
                    ["VS Code + Copilot", "$10/mo"],
                    ["Game server (Apex/Shockbyte)", "$8–15/mo"],
                    ["VPS (DigitalOcean/Hetzner)", "$12–24/mo"],
                    ["Web hosting (Vercel Pro)", "$20/mo"],
                  ].map(([name, price]) => (
                    <div key={name} className="flex items-baseline justify-between py-1">
                      <span className="text-xs text-foreground-muted/60">{name}</span>
                      <span className="text-xs text-foreground-muted/40 font-mono">{price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-baseline justify-between">
                  <span className="text-xs text-foreground-muted">Separately, that&apos;s</span>
                  <span className="font-[510] text-sm text-foreground-muted line-through decoration-foreground-muted/30">$60–79/mo</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs text-foreground">With Athion, it&apos;s</span>
                  <span className="font-[590] text-lg">$20/mo</span>
                </div>
              </div>

              <p className="mt-6 text-xs text-foreground-muted/40 leading-relaxed">
                Costs are approximate and based on current infrastructure. As we scale, per-subscriber costs decrease — and we plan to pass those savings on.
              </p>
            </div>
          </ScrollReveal>

          {/* Consulting callout */}
          <ScrollReveal delay={0.15}>
            <div className="mt-16 p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
                <div className="flex-1">
                  <h3 className="font-[590] text-lg tracking-[-0.012em]">
                    Need custom development?
                  </h3>
                  <p className="mt-1 text-sm text-foreground-muted leading-relaxed">
                    Enterprise consulting starting at $150/hour. Architecture reviews, full-stack development, and technical advisory.
                  </p>
                </div>
                <Link
                  href="/consulting"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] text-foreground-muted text-sm font-[510] hover:text-foreground hover:border-white/[0.15] rounded-[6px] active:scale-[0.98] transition-all duration-150 shrink-0"
                >
                  Get a quote
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}
