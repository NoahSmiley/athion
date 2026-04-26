import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing | Labs",
  description: "Writing and notes from Athion Labs.",
};

export default function LabsWritingPage() {
  return (
    <>
      <h1>Writing</h1>
      <p className="muted">Notes, write-ups, and research from Athion Labs. Nothing posted yet — check back soon.</p>
    </>
  );
}
