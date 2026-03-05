"use client";

import { PageTransition } from "@/components/page-transition";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";

const releases = [
  {
    version: "0.4.0-beta.9",
    date: "March 5, 2026",
    product: "Flux",
    changes: [
      "Added COOP/COEP headers for enhanced security isolation",
      "Krisp audio level diagnostic for noise suppression debugging",
      "Improved noise suppression reliability",
      "Various stability fixes",
    ],
  },
  {
    version: "0.4.0-beta.8",
    date: "February 28, 2026",
    product: "Flux",
    changes: [
      "Simplified noise suppression to Krisp-only toggle",
      "Reduced memory usage during voice calls by 15%",
      "Fixed audio crackling on macOS when switching output devices",
    ],
  },
  {
    version: "0.4.0-beta.7",
    date: "February 15, 2026",
    product: "Flux",
    changes: [
      "Lossless screen share preset (VP9, 20 Mbps, 60 fps)",
      "Bitrate selector for voice channels (96–320 kbps)",
      "Profile cards with member info and role display",
      "Context menus for channels and voice rooms",
    ],
  },
  {
    version: "0.4.0-beta.6",
    date: "February 1, 2026",
    product: "Flux",
    changes: [
      "End-to-end encryption for all direct messages",
      "File attachment previews with drag-and-drop upload",
      "Reaction tooltips with user attribution",
      "Server emoji management",
    ],
  },
  {
    version: "0.3.0-beta.5",
    date: "January 18, 2026",
    product: "Flux",
    changes: [
      "Direct messages with search and user lookup",
      "Voice room user limit controls",
      "Soundboard with custom audio upload",
      "Gallery view for image messages",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PageTransition>
      <section className="relative min-h-[50vh] flex items-center">
        <div className="mx-auto max-w-6xl px-6 pt-32 pb-12">
          <ScrollReveal>
            <p className="overline mb-4">Changelog</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-5xl sm:text-6xl tracking-[-0.02em] leading-tight">
              What&apos;s new.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-foreground-muted max-w-lg leading-relaxed">
              Release notes and updates for all Athion products.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="mx-auto max-w-3xl">
          <StaggerContainer className="flex flex-col gap-0">
            {releases.map((release, i) => (
              <StaggerItem key={release.version}>
                <div className={`relative pl-8 pb-12 ${i < releases.length - 1 ? "border-l border-border" : ""}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-accent" />

                  <div className="flex flex-wrap items-baseline gap-3 mb-4">
                    <span className="font-mono text-lg text-accent">
                      v{release.version}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-foreground-muted border border-border px-2 py-0.5">
                      {release.product}
                    </span>
                    <span className="text-sm text-foreground-muted">
                      {release.date}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {release.changes.map((change, j) => (
                      <li
                        key={j}
                        className="text-foreground-muted leading-relaxed pl-4 border-l border-border-light text-sm"
                      >
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </PageTransition>
  );
}
