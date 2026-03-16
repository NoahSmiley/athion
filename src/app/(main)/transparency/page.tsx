import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import { ScrollText } from "@/components/parallax";

const costs = [
  {
    label: "Voice infrastructure",
    service: "LiveKit + Krisp",
    cost: "$50",
    percent: 45,
    detail:
      "Real-time voice relay servers, AI noise suppression, and WebRTC infrastructure that powers Flux. This is our single largest vendor cost — quality real-time audio doesn't come cheap.",
    icon: "voice",
  },
  {
    label: "Server hardware",
    service: "Self-hosted",
    cost: "$25",
    percent: 22,
    detail:
      "Dedicated server hardware that runs Athion infrastructure. Amortized cost of the machines themselves — CPUs, RAM, SSDs, and replacement parts over their lifespan.",
    icon: "server",
  },
  {
    label: "Power & cooling",
    service: "24/7 uptime",
    cost: "$20",
    percent: 18,
    detail:
      "Electricity to keep servers running around the clock. No sleep timers, no cold starts.",
    icon: "power",
  },
  {
    label: "Network",
    service: "Dedicated line",
    cost: "$15",
    percent: 13,
    detail:
      "High-bandwidth internet dedicated to server traffic. This is what keeps latency low and ensures a fast experience.",
    icon: "network",
  },
  {
    label: "DNS & SSL",
    service: "Cloudflare + Let's Encrypt",
    cost: "$2",
    percent: 2,
    detail:
      "Domain registrations, DNS management, and automatic SSL provisioning. HTTPS is not a premium feature.",
    icon: "dns",
  },
];

const comparisons = [
  { name: "Discord Nitro", price: "$10/mo" },
  { name: "VS Code + Copilot", price: "$10/mo" },
  { name: "Game server (Apex/Shockbyte)", price: "$8–15/mo" },
  { name: "VPS (DigitalOcean/Hetzner)", price: "$12–24/mo" },
  { name: "Web hosting (Vercel Pro)", price: "$20/mo" },
];

export default function TransparencyPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-12">
          <ScrollReveal>
            <p className="overline mb-4">Transparency</p>
          </ScrollReveal>
          <ScrollText
            text="Where your money goes."
            tag="h1"
            className="font-[590] text-5xl sm:text-6xl tracking-[-0.022em] leading-tight max-w-3xl"
          />
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-foreground-muted max-w-xl leading-relaxed">
              Most companies hide their margins. We&apos;d rather show you
              exactly what it costs to run Athion — and let the value speak for
              itself.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Cost breakdown — visual bars */}
      <section className="pb-24 px-6 border-t border-border">
        <div className="mx-auto max-w-3xl pt-24">
          <ScrollReveal>
            <p className="overline mb-4">Monthly operating costs</p>
            <h2 className="font-[590] text-3xl sm:text-4xl tracking-[-0.022em]">
              ~$112/month to run everything.
            </h2>
            <p className="mt-4 text-sm text-foreground-muted leading-relaxed max-w-lg">
              These are total infrastructure costs shared across all subscribers — not per-user.
              As we scale, per-subscriber costs decrease.
            </p>
          </ScrollReveal>

          <StaggerContainer className="mt-16 flex flex-col gap-6">
            {costs.map((item) => (
              <StaggerItem key={item.label}>
                <div className="group">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-[510] text-sm">{item.label}</span>
                      <span className="text-[11px] text-foreground-muted/40">
                        {item.service}
                      </span>
                    </div>
                    <span className="text-sm font-mono tabular-nums text-foreground-muted">
                      {item.cost}/mo
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60 rounded-full transition-all duration-700"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-foreground-muted/50 leading-relaxed max-w-lg group-hover:text-foreground-muted/70 transition-colors">
                    {item.detail}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Remainder callout */}
          <ScrollReveal delay={0.1}>
            <div className="mt-12 p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <div className="flex items-baseline justify-between">
                <span className="font-[510] text-sm">Product development</span>
                <span className="text-sm text-foreground-muted font-mono">remainder</span>
              </div>
              <p className="mt-2 text-xs text-foreground-muted/70 leading-relaxed">
                What&apos;s left goes directly into building and improving the product.
                New features, performance optimizations, bug fixes, and support.
                This is where your subscription makes the biggest impact.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Value comparison */}
      <section className="pb-24 px-6 border-t border-border">
        <div className="mx-auto max-w-3xl pt-24">
          <ScrollReveal>
            <p className="overline mb-4">Value</p>
            <h2 className="font-[590] text-3xl sm:text-4xl tracking-[-0.022em]">
              What this would cost you separately.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-12">
              <div className="flex flex-col gap-0">
                {comparisons.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-baseline justify-between py-3 border-b border-white/[0.06] first:border-t first:border-white/[0.06]"
                  >
                    <span className="text-sm text-foreground-muted/60">
                      {item.name}
                    </span>
                    <span className="text-sm text-foreground-muted/40 font-mono tabular-nums">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-xs text-foreground-muted">
                    Separately, that&apos;s
                  </p>
                  <p className="font-[510] text-lg text-foreground-muted line-through decoration-foreground-muted/30 mt-1">
                    $60–79/mo
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground-muted">
                    With Athion Pro
                  </p>
                  <p className="font-[590] text-3xl tracking-[-0.022em] mt-1">
                    $20/mo
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="mt-8 text-xs text-foreground-muted/40 leading-relaxed">
              Costs are approximate and based on current infrastructure.
              As we scale, per-subscriber costs decrease — and we plan to pass
              those savings on.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32 px-6 border-t border-border">
        <div className="mx-auto max-w-3xl pt-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
          >
            Subscribe
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
