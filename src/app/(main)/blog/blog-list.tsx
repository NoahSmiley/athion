"use client";

import { PageTransition } from "@/components/page-transition";

export function BlogList({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
