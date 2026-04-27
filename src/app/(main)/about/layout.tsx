import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Athion is a closed-membership software collective. A small group of people building software the way it should be built.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
