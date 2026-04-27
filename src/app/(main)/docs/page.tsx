import Link from "next/link";
import type { Metadata } from "next";
import { Contents, H2 } from "./contents";

export const metadata: Metadata = { title: "Docs" };

const SECTIONS = [
  {
    href: "/docs/architecture",
    title: "Architecture",
    body: "State management, layer model, common anti-patterns. The shape of every athion codebase.",
  },
  {
    href: "/docs/dev",
    title: "Dev",
    body: "File size limits, naming conventions, code standards. Per-platform: web, Tauri, SwiftUI.",
  },
  {
    href: "/docs/repository",
    title: "Repository",
    body: "Branching, commits, pull requests, merging. Git hygiene across athion repos.",
  },
];

const colors = [
  ["--a-bg", "#060606", "Background"],
  ["--a-bg-elevated", "#0a0a0a", "Elevated surface (sheets, modals)"],
  ["--a-bg-input", "#111", "Input background, search pills"],
  ["--a-text", "#c8c8c8", "Primary text"],
  ["--a-text-muted", "#828282", "Secondary text"],
  ["--a-text-faint", "#555", "Tertiary text, metadata"],
  ["--a-text-active", "#fff", "Headings, active items"],
  ["--a-border", "#1a1a1a", "Structural dividers"],
  ["--a-border-strong", "#2a2a2a", "Input borders"],
  ["--a-error", "#c44", "Errors, destructive actions"],
];

export default function DocsPage() {
  return (
    <>
      <h1>Docs</h1>
      <p className="muted">Everything we use to build, ship, and maintain athion software. Members-only.</p>

      <Contents
        headings={[
          { id: "sections", label: "Sections" },
          { id: "design-system", label: "Design system" },
          { id: "principles", label: "Principles" },
          { id: "colors", label: "Colors" },
          { id: "type", label: "Type" },
        ]}
      />

      <H2 id="sections">Sections</H2>
      <table className="mobile-cards" style={{ marginBottom: 16 }}>
        <tbody>
          {SECTIONS.map((s) => (
            <tr key={s.href}>
              <td data-label="Section" style={{ width: 120, verticalAlign: "top" }}>
                <Link href={s.href}>{s.title}</Link>
              </td>
              <td data-label="About" className="muted" style={{ verticalAlign: "top" }}>{s.body}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H2 id="design-system">Design system</H2>
      <p className="muted">Athion&apos;s visual language. Used across all products.</p>

      <H2 id="principles">Principles</H2>
      <ul>
        <li><b>Dark only</b> &mdash; no light mode. <code>#060606</code> background, always.</li>
        <li><b>Utilitarian</b> &mdash; no gradients, no shadows, no decorative animations.</li>
        <li><b>Information-dense</b> &mdash; 13&ndash;14px base, tight spacing.</li>
        <li><b>Monochrome</b> &mdash; grayscale only. Color is reserved for errors.</li>
      </ul>

      <H2 id="colors">Colors</H2>
      <table className="mobile-cards">
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
            <th>Use</th>
          </tr>
        </thead>
        <tbody>
          {colors.map(([token, value, use]) => (
            <tr key={token}>
              <td data-label="Token" style={{ fontFamily: "var(--font-mono)" }}>{token}</td>
              <td data-label="Value" style={{ fontFamily: "var(--font-mono)" }}>
                <span style={{ display: "inline-block", width: 12, height: 12, background: value, border: "1px solid #2a2a2a", verticalAlign: "middle", marginRight: 6 }} />
                {value}
              </td>
              <td data-label="Use" className="muted">{use}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H2 id="type">Type</H2>
      <p className="muted">OpenAI Sans for body, Courier New for monospace blocks.</p>
      <ul>
        <li>13px &mdash; body, default</li>
        <li>15px &mdash; h1</li>
        <li>13px (semibold) &mdash; h2</li>
        <li>11px &mdash; metadata, captions</li>
      </ul>

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>
        Shared CSS package: <code>import &quot;@athion/style&quot;;</code> &mdash; provides fonts, tokens, and reset for web and Tauri apps.
      </p>
    </>
  );
}
