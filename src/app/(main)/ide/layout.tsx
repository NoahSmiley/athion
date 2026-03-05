import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liminal IDE",
  description:
    "A code editor that stays out of your way. AI-native, terminal-first, built in Rust.",
};

export default function IDELayout({ children }: { children: React.ReactNode }) {
  return children;
}
