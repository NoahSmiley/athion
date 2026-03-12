"use client";

import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";
import { VALUES } from "@/lib/constants";

function Mission() {
  return (
    <section className="relative min-h-[70vh] flex items-center">
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <ScrollReveal>
          <p className="overline mb-4">About</p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="font-[590] text-5xl sm:text-6xl md:text-7xl tracking-[-0.022em] leading-tight max-w-3xl">
            We make software
            <br />
            <span className="text-accent">worth using.</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="mt-8 text-lg text-foreground-muted max-w-xl leading-relaxed">
            Athion exists at the threshold — the liminal space between
            complexity and nothing. We strip away everything that doesn&apos;t
            serve the user until only the essential remains.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">Values</p>
          <h2 className="font-[590] text-4xl sm:text-5xl tracking-[-0.022em]">
            What we believe.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 gap-12">
          {VALUES.map((value) => (
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
  );
}

function Team() {
  const people = [
    { initials: "NS", name: "Noah Smiley", role: "Founder & Lead Engineer" },
    { initials: "TK", name: "Trevor Kerney", role: "Engineering" },
  ];

  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="overline mb-4">Team</p>
          <h2 className="font-[590] text-4xl tracking-[-0.022em]">
            Small team. High standards.
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {people.map((person) => (
            <StaggerItem key={person.name}>
              <div className="p-6 border border-border rounded-lg">
                <div className="w-14 h-14 rounded-full bg-background-elevated border border-border flex items-center justify-center">
                  <span className="text-sm font-mono text-accent">
                    {person.initials}
                  </span>
                </div>
                <h3 className="mt-4 font-[590] text-lg tracking-[-0.012em]">{person.name}</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  {person.role}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <PageTransition>
      <Mission />
      <ValuesSection />
      <Team />
    </PageTransition>
  );
}
