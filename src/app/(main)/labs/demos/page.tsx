import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demos | Labs",
  description: "Live demos and interactive prototypes from Athion Labs.",
};

export default function LabsDemosPage() {
  return (
    <>
      <h1>Demos</h1>
      <p className="muted">Interactive demos and prototypes. Nothing posted yet — check back soon.</p>
    </>
  );
}
