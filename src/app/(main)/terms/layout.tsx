import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Athion products and services.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
