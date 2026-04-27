import type { Metadata } from "next";
import Link from "next/link";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "React" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Component rules" },
  { id: "hooks", label: "Hooks" },
  { id: "css", label: "CSS approach" },
];

const m = { fontFamily: "var(--font-mono)" } as const;

export default function ReactStackPage() {
  return (
    <>
      <h1>React</h1>
      <p className="muted">Universal React patterns used across Tauri (desktop), Next.js (web), and any future React surface. Stack-specific guidance lives in <Link href="/docs/stacks/tauri">Tauri</Link> and <Link href="/docs/stacks/nextjs">Next.js</Link>.</p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <ul>
        <li>Functional components only. No HOCs, render props, or class components.</li>
        <li>One component per file, PascalCase filename matching the export.</li>
        <li>Props interface named <span style={m}>ComponentNameProps</span>. No <span style={m}>Props</span> shorthand.</li>
        <li>Strict mode on in development.</li>
      </ul>

      <H2 id="components">Component rules</H2>
      <ul>
        <li>Destructure props at the signature. Avoid <span style={m}>props.foo</span> inside the body.</li>
        <li>Callback props wrapped in <span style={m}>useCallback</span> at the parent when passed to memoized children.</li>
        <li>Expensive derivations wrapped in <span style={m}>useMemo</span>. Cheap ones inlined.</li>
        <li>Early returns before hook calls are forbidden. Hooks must run in the same order every render.</li>
        <li>No business logic in JSX (no <span style={m}>.filter().sort().map()</span> chains in return). Extract to a memo or helper.</li>
      </ul>

      <H2 id="hooks">Hooks</H2>
      <ul>
        <li>Custom hooks named <span style={m}>useX</span>. One hook per file when reusable across components.</li>
        <li>Effects clean up on unmount. Timers, listeners, subscriptions &mdash; all need a cleanup function.</li>
        <li>No effects for derived values. Use <span style={m}>useMemo</span>.</li>
        <li>No effects for prop syncing. Use the prop directly or lift state up.</li>
      </ul>

      <H2 id="css">CSS approach</H2>
      <ul>
        <li>Single CSS file per app with <span style={m}>--a-*</span> tokens (from <span style={m}>@athion/style</span>).</li>
        <li>Inline styles only for dynamic values (transforms, positions, computed colors).</li>
        <li>No CSS-in-JS libraries. No styled-components, emotion.</li>
        <li>Class names: kebab-case, scoped by component prefix.</li>
      </ul>
    </>
  );
}
