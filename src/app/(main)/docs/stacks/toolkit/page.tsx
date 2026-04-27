import type { Metadata } from "next";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "Toolkit" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Component catalog" },
  { id: "tokens", label: "Tokens" },
];

export default function ToolkitStackPage() {
  return (
    <>
      <h1>Toolkit UI</h1>
      <p className="muted">Shared UI primitives used across athion apps.</p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <p className="muted">In progress.</p>

      <H2 id="components">Component catalog</H2>
      <p className="muted">In progress.</p>

      <H2 id="tokens">Tokens</H2>
      <p className="muted">In progress.</p>
    </>
  );
}
