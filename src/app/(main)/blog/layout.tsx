import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press",
  description: "Notes, decisions, and the thinking behind what athion builds.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
