import type { Metadata } from "next";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "TypeScript" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "config", label: "tsconfig" },
  { id: "types", label: "Type conventions" },
  { id: "errors", label: "Error handling" },
];

export default function TypeScriptStackPage() {
  return (
    <>
      <h1>TypeScript</h1>
      <p className="muted">Conventions for TypeScript across athion projects.</p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <p className="muted">In progress.</p>

      <H2 id="config">tsconfig</H2>
      <p className="muted">In progress.</p>

      <H2 id="types">Type conventions</H2>
      <p className="muted">In progress.</p>

      <H2 id="errors">Error handling</H2>
      <p className="muted">In progress.</p>
    </>
  );
}
