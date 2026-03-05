"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PRICING_PLANS, HOSTING_PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TABS = ["Software", "Hosting", "Consulting"] as const;
type Tab = (typeof TABS)[number];

type PricingPlan = {
  product: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: readonly string[];
};

function PlanCard({
  plan,
  annual,
  loading,
  onCheckout,
}: {
  plan: PricingPlan;
  annual: boolean;
  loading: string | null;
  onCheckout: (product: string) => void;
}) {
  return (
    <div className="p-8 border border-border rounded-sm flex flex-col h-full">
      <h3 className="font-serif text-2xl">{plan.name}</h3>
      <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
        {plan.description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-serif text-4xl">
          ${annual ? plan.yearlyPrice : plan.monthlyPrice}
        </span>
        <span className="text-sm text-foreground-muted">
          /{annual ? "year" : "month"}
        </span>
      </div>

      {annual && (
        <p className="mt-1 text-xs text-foreground-muted">
          ${(plan.yearlyPrice / 12).toFixed(2)}/month billed annually
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-3 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check size={14} className="text-accent mt-0.5 shrink-0" />
            <span className="text-foreground-muted">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onCheckout(plan.product)}
        disabled={loading === plan.product}
        className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {loading === plan.product ? "Loading..." : "Subscribe"}
        {loading !== plan.product && <ArrowRight size={14} />}
      </button>
    </div>
  );
}

function SoftwareTab({
  annual,
  loading,
  onCheckout,
}: {
  annual: boolean;
  loading: string | null;
  onCheckout: (product: string) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {PRICING_PLANS.map((plan) => (
        <PlanCard
          key={plan.product}
          plan={plan}
          annual={annual}
          loading={loading}
          onCheckout={onCheckout}
        />
      ))}

      <div className="p-8 border border-border rounded-sm flex flex-col justify-center">
        <h3 className="font-serif text-2xl">Liminal IDE</h3>
        <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
          Free with every account. No subscription required.
        </p>
        <Link
          href="/ide"
          className="mt-6 text-xs text-accent hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          Learn more <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}

function HostingTab({
  annual,
  loading,
  onCheckout,
}: {
  annual: boolean;
  loading: string | null;
  onCheckout: (product: string) => void;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {HOSTING_PLANS.map((plan) => (
        <PlanCard
          key={plan.product}
          plan={plan}
          annual={annual}
          loading={loading}
          onCheckout={onCheckout}
        />
      ))}
    </div>
  );
}

function ConsultingTab() {
  return (
    <div className="flex flex-col gap-10">
      {/* Credibility banner */}
      <div className="p-8 border border-border rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-12">
          <div className="flex-1">
            <p className="text-foreground leading-relaxed">
              5+ years of enterprise consulting for Fortune 100 and 500 companies,
              with delivered project ROIs in the billions. Enterprise-grade
              engineering, now available to teams of any size.
            </p>
          </div>
          <Link
            href="/consulting"
            className="text-xs text-accent hover:text-foreground transition-colors inline-flex items-center gap-1 shrink-0"
          >
            Our track record <ArrowRight size={10} />
          </Link>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 border border-border rounded-sm flex flex-col">
          <h3 className="font-serif text-2xl">Hourly Rate</h3>
          <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
            For advisory, code reviews, and shorter engagements. Billed in 1-hour increments.
          </p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-serif text-4xl">$150</span>
            <span className="text-sm text-foreground-muted">/hour</span>
          </div>
          <div className="mt-auto pt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Book a Call
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="p-8 border border-border rounded-sm flex flex-col">
          <h3 className="font-serif text-2xl">Project-Based</h3>
          <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
            Fixed-scope projects with clear deliverables, timeline, and pricing agreed upfront.
          </p>
          <div className="mt-6">
            <span className="font-serif text-2xl text-foreground-muted">Custom quote</span>
          </div>
          <div className="mt-auto pt-8">
            <Link
              href="/consulting#quote"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground-muted text-sm hover:text-foreground hover:border-border-light transition-colors"
            >
              Request a Quote
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [tab, setTab] = useState<Tab>("Software");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (product: string) => {
    setLoading(product);

    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();

    if (!meData.user) {
      router.push("/signup");
      return;
    }

    const priceKey = `${product}_${annual ? "yearly" : "monthly"}`;

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
      setLoading(null);
    }
  };

  const showToggle = tab === "Software" || tab === "Hosting";

  return (
    <PageTransition>
      <section className="relative min-h-[50vh] flex items-center">
        <div className="mx-auto max-w-6xl px-6 pt-32 pb-12 text-center">
          <ScrollReveal>
            <p className="overline mb-4">Pricing</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-5xl sm:text-6xl tracking-[-0.02em]">
              Simple, transparent pricing.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-foreground-muted max-w-lg mx-auto leading-relaxed">
              No hidden fees. No usage limits. Cancel anytime.
            </p>
          </ScrollReveal>

          {/* Tabs */}
          <ScrollReveal delay={0.3}>
            <div className="mt-10 inline-flex items-center gap-1 p-1 border border-border">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-5 py-2 text-sm transition-colors",
                    tab === t
                      ? "bg-accent text-background"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Monthly/Yearly toggle — only for Software & Hosting */}
          {showToggle && (
            <ScrollReveal delay={0.35}>
              <div className="mt-6 inline-flex items-center gap-3 p-1 border border-border">
                <button
                  onClick={() => setAnnual(false)}
                  className={cn(
                    "px-4 py-2 text-sm transition-colors",
                    !annual
                      ? "bg-accent text-background"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={cn(
                    "px-4 py-2 text-sm transition-colors",
                    annual
                      ? "bg-accent text-background"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  Yearly
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-70">
                    Save 20%
                  </span>
                </button>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="mx-auto max-w-5xl">
          {tab === "Software" && (
            <SoftwareTab annual={annual} loading={loading} onCheckout={handleCheckout} />
          )}
          {tab === "Hosting" && (
            <HostingTab annual={annual} loading={loading} onCheckout={handleCheckout} />
          )}
          {tab === "Consulting" && <ConsultingTab />}
        </div>
      </section>
    </PageTransition>
  );
}
