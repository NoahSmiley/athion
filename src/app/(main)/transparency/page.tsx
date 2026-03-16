import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";

const costs = [
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
      "Dedicated server hardware that runs Athion infrastructure. Amortized cost of the machines themselves — CPUs, RAM, SSDs, and replacement parts over their lifespan.",
  },
  {
    label: "Power & cooling",
    service: "24/7 uptime",
    cost: "~$20/mo",
    detail:
      "Electricity to keep servers running around the clock. No sleep timers, no cold starts.",
  },
  {
    label: "Network & connectivity",
    service: "Dedicated line",
    cost: "~$15/mo",
    detail:
      "High-bandwidth internet dedicated to server traffic. This is what keeps latency low and ensures a fast experience.",
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
];

const comparisons = [
  ["Discord Nitro", "$10/mo"],
  ["VS Code + Copilot", "$10/mo"],
  ["Game server (Apex/Shockbyte)", "$8–15/mo"],
  ["VPS (DigitalOcean/Hetzner)", "$12–24/mo"],
  ["Web hosting (Vercel Pro)", "$20/mo"],
];

export default function TransparencyPage() {
  return (
    <PageTransition>
      <section className="relative min-h-[50vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-12">
          <ScrollReveal>
            <p className="overline mb-4">Transparency</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-[590] text-5xl sm:text-6xl tracking-[-0.022em] leading-tight max-w-3xl">
              Where your money goes.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-foreground-muted max-w-xl leading-relaxed">
              Most companies hide their margins. We&apos;d rather show you
              exactly what it costs to run Athion — and let the value speak for
              itself.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="mx-auto max-w-2xl">
          {/* Cost breakdown */}
          <ScrollReveal>
            <div className="flex flex-col gap-0">
              {costs.map((item) => (
                <div
                  key={item.label}
                  className="py-5 border-b border-white/[0.06] first:border-t first:border-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span className="font-[510] text-sm">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-foreground-muted/40">
                          {item.service}
                        </span>
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
          </ScrollReveal>

          {/* Value comparison */}
          <ScrollReveal delay={0.1}>
            <div className="mt-16 border-t border-white/[0.08] pt-16">
              <p className="overline mb-4">Value</p>
              <h2 className="font-[590] text-2xl tracking-[-0.012em]">
                What this would cost you separately.
              </h2>

              <div className="mt-10 p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {comparisons.map(([name, price]) => (
                    <div
                      key={name}
                      className="flex items-baseline justify-between py-1"
                    >
                      <span className="text-xs text-foreground-muted/60">
                        {name}
                      </span>
                      <span className="text-xs text-foreground-muted/40 font-mono">
                        {price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-baseline justify-between">
                  <span className="text-xs text-foreground-muted">
                    Separately, that&apos;s
                  </span>
                  <span className="font-[510] text-sm text-foreground-muted line-through decoration-foreground-muted/30">
                    $60–79/mo
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs text-foreground">
                    With Athion Pro, it&apos;s
                  </span>
                  <span className="font-[590] text-lg">$20/mo</span>
                </div>
              </div>

              <p className="mt-6 text-xs text-foreground-muted/40 leading-relaxed">
                Costs are approximate and based on current infrastructure. These
                are total operating costs shared across all subscribers — not
                per-user. As we scale, per-subscriber costs decrease, and we plan
                to pass those savings on.
              </p>
            </div>
          </ScrollReveal>

          {/* Back to pricing */}
          <ScrollReveal delay={0.15}>
            <div className="mt-16 pt-8 border-t border-white/[0.08]">
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft
                  size={12}
                  className="group-hover:-translate-x-0.5 transition-transform duration-200"
                />
                Back to Pricing
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}
