"use client";

import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-48 h-48",
  md: "w-72 h-72",
  lg: "w-96 h-96",
};

export function GradientOrb({ className, size = "md" }: GradientOrbProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl opacity-20 animate-float",
        "bg-gradient-to-br from-accent/40 via-accent/20 to-transparent",
        sizes[size],
        className
      )}
      aria-hidden
    />
  );
}
