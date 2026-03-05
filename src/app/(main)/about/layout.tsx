import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "We make software worth using. Learn about Athion's mission and values.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
