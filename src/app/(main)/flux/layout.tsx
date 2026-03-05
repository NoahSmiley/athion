import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flux",
  description:
    "Real-time voice and text communication. Crystal audio, end-to-end encryption, lossless screen sharing.",
};

export default function FluxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
