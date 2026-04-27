import type { Metadata } from "next";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "Next.js" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "routing", label: "Routing" },
  { id: "data", label: "Data fetching" },
  { id: "deploy", label: "Deploy" },
];

export default function NextStackPage() {
  return (
    <>
      <h1>Next.js</h1>
      <p className="muted">Web stack. Used for athion.me itself and any future browser-only surfaces.</p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <p className="muted">In progress.</p>

      <H2 id="routing">Routing</H2>
      <p className="muted">In progress.</p>

      <H2 id="data">Data fetching</H2>
      <p className="muted">In progress.</p>

      <H2 id="deploy">Deploy</H2>
      <p className="muted">In progress.</p>
    </>
  );
}
