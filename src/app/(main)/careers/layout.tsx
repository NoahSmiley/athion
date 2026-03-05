import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Athion team. Small team, high standards, meaningful work.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
