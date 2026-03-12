"use client";

import Link from "next/link";
import { PageTransition } from "@/components/page-transition";

export default function NotFound() {
  return (
    <PageTransition>
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-mono text-6xl text-accent">404</p>
          <h1 className="mt-4 font-[590] text-3xl tracking-[-0.022em]">
            Nothing here.
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Which, given our name, feels appropriate.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
