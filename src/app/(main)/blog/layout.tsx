import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Updates, insights, and technical deep-dives from the Athion team.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
