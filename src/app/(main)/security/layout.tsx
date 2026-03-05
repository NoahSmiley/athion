import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description: "How Athion protects your data. End-to-end encryption, privacy by design.",
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
