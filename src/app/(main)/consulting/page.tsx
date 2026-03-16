"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Globe,
  Smartphone,
  Wrench,
  Lightbulb,
  ArrowRight,
  Phone,
  Send,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import { ScrollText } from "@/components/parallax";
import { CONSULTING_SERVICES } from "@/lib/constants";

const serviceIcons = { Globe, Smartphone, Wrench, Lightbulb } as const;

const PROJECT_TYPES = [
  "Web App",
  "Mobile App",
  "Infrastructure",
  "Advisory",
] as const;

function ConsultingHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center">
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-12">
        <ScrollReveal>
          <Code2 size={48} className="text-accent mb-8" />
        </ScrollReveal>
        <ScrollText
          text="Consulting."
          tag="h1"
          className="font-[590] text-5xl sm:text-6xl tracking-[-0.022em] leading-tight max-w-3xl"
        />
        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-lg text-foreground-muted max-w-xl leading-relaxed">
            Five years of enterprise consulting for Fortune 100 and Fortune 500
            companies — coming soon to Athion.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-accent/20 text-accent text-sm rounded-[6px]">
            Coming Soon
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function TrackRecord() {
  const stats = [
    { value: "5+", label: "Years", detail: "of enterprise consulting" },
    { value: "Fortune 500", label: "Clients", detail: "including Fortune 100" },
    { value: "$B+", label: "Project ROI", detail: "across delivered engagements" },
  ];

  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <ScrollReveal>
              <p className="overline mb-4">Track Record</p>
            </ScrollReveal>
            <ScrollText
              text="Proven at scale."
              tag="h2"
              className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
            />
            <ScrollReveal delay={0.15}>
              <p className="mt-6 text-foreground-muted leading-relaxed">
                Before Athion, our founder spent five years as a software consultant
                delivering high-impact projects for some of the largest companies in the
                world — Fortune 100 and 500 enterprises across industries. Those
                engagements generated ROIs in the billions.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                That same rigor, speed, and attention to detail is now available
                to teams of any size. You get enterprise-grade engineering without
                the enterprise overhead.
              </p>
            </ScrollReveal>
          </div>

          <StaggerContainer className="grid gap-6 md:pt-12">
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="border-t border-border pt-6">
                  <p className="font-[590] text-3xl tracking-[-0.022em]">{stat.value}</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    <span className="text-foreground">{stat.label}</span> — {stat.detail}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

function ConsultingServices() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">Services</p>
        </ScrollReveal>
        <ScrollText
          text="What we build."
          tag="h2"
          className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
        />

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 gap-8">
          {CONSULTING_SERVICES.map((service) => {
            const Icon = serviceIcons[service.icon as keyof typeof serviceIcons];
            return (
              <StaggerItem key={service.title}>
                <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                  <Icon size={28} className="text-accent" />
                  <h3 className="mt-4 font-[590] text-xl tracking-[-0.012em]">{service.title}</h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ConsultingPricing() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">Pricing</p>
        </ScrollReveal>
        <ScrollText
          text="Flexible engagement."
          tag="h2"
          className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em] leading-tight"
        />
        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-foreground-muted max-w-lg leading-relaxed">
            Two engagement models depending on your project scope and timeline.
          </p>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid md:grid-cols-2 gap-8">
          <StaggerItem>
            <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
              <h3 className="font-[590] text-2xl tracking-[-0.012em]">Hourly Rate</h3>
              <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                For advisory, code reviews, and shorter engagements. Billed in 1-hour increments.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-[590] text-4xl tracking-[-0.022em]">$150</span>
                <span className="text-sm text-foreground-muted">/hour</span>
              </div>
              <div className="mt-auto pt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
                >
                  <Phone size={14} />
                  Book a Call
                </Link>
              </div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
              <h3 className="font-[590] text-2xl tracking-[-0.012em]">Project-Based</h3>
              <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                Fixed-scope projects with clear deliverables, timeline, and pricing agreed upfront.
              </p>
              <div className="mt-6">
                <span className="font-[590] text-2xl tracking-[-0.012em] text-foreground-muted">Custom quote</span>
              </div>
              <div className="mt-auto pt-8">
                <a
                  href="#quote"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground-muted text-sm hover:text-foreground hover:border-border-light hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-150"
                >
                  Request a Quote
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

function QuoteForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState<string>(PROJECT_TYPES[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: `[Consulting — ${projectType}]\n\n${message}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="quote" className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <p className="overline mb-4">Get a Quote</p>
          <h2 className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em]">
            Tell us about your project.
          </h2>
          <p className="mt-4 text-foreground-muted">
            Share the details and we&apos;ll get back to you with a scope and estimate.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          {submitted ? (
            <div className="mt-12 p-8 border border-accent/30 text-center">
              <p className="text-accent font-[590] text-xl tracking-[-0.012em]">Request received.</p>
              <p className="mt-2 text-sm text-foreground-muted">
                We&apos;ll review your project details and respond within 2 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-6">
              {error && (
                <div className="p-3 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors"
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
                  Project Details
                </label>
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your project, goals, and timeline..."
                  className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
                >
                  <Send size={14} />
                  {loading ? "Sending..." : "Request Quote"}
                </button>
              </div>
            </form>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function ConsultingPage() {
  return (
    <PageTransition>
      <ConsultingHero />
      <TrackRecord />
      <ConsultingServices />
      <ConsultingPricing />
      <QuoteForm />
    </PageTransition>
  );
}
