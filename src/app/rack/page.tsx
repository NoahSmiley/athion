import type { Metadata } from "next";
import { RackPlan } from "@/components/rack/RackPlan";

export const metadata: Metadata = {
  title: "Rack Plan",
  description: "3D rack elevation and cable schedule for the homelab UniFi upgrade.",
};

export default function RackPage() {
  return (
    <main className="rack-page">
      <header className="rack-nav">
        <a href="/" className="wordmark">
          Athion <span className="muted">Rack</span>
        </a>
        <a href="/" className="nav-link">
          Back
        </a>
      </header>
      <RackPlan />
    </main>
  );
}
