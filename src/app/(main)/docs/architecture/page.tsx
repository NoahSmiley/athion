import type { Metadata } from "next";
import Link from "next/link";
import { Contents, H2 } from "../contents";

export const metadata: Metadata = { title: "Architecture" };

const HEADINGS = [
  { id: "principles", label: "Core principles" },
  { id: "layers", label: "Layer model" },
  { id: "files", label: "File rules" },
  { id: "naming", label: "Naming" },
  { id: "persistence", label: "Persistence" },
  { id: "deeper", label: "Going deeper" },
];

export default function ArchitectureOverviewPage() {
  return (
    <>
      <h1>Architecture</h1>
      <p className="muted">Universal patterns shared across athion products. Stack-specific guidance lives under <Link href="/docs/stacks">Stacks</Link>.</p>

      <Contents headings={HEADINGS} />

      <H2 id="principles">Core principles</H2>
      <ul>
        <li><b>State lives in one place.</b> One store per domain. Components read; they do not own persistent state.</li>
        <li><b>Business logic lives in stores or helpers.</b> Components are presentation only. No logic in JSX.</li>
        <li><b>Side effects are explicit.</b> Persistence, network, time &mdash; all live behind a named function. No hidden effects in render paths.</li>
        <li><b>Derive, don&apos;t mirror.</b> If value B can be computed from A, compute it. Do not store both.</li>
        <li><b>Composition over configuration.</b> Small components composed together. No mega-components with many optional props.</li>
        <li><b>Cross the layer boundary deliberately.</b> UI does not know about storage. Stores do not know about UI.</li>
      </ul>

      <H2 id="layers">Layer model</H2>
      <p className="muted">Every athion product has four layers. Dependencies flow downward only.</p>
      <table>
        <thead><tr><th>Layer</th><th>Responsibility</th><th>React</th><th>SwiftUI</th><th>Rust API</th></tr></thead>
        <tbody>
          <tr><td><b>View / Handler</b></td><td>Render UI / serve HTTP</td><td>components/</td><td>*View.swift</td><td>routes/</td></tr>
          <tr><td><b>Store / DB</b></td><td>State or persistence</td><td>stores/</td><td>*Store.swift</td><td>db/</td></tr>
          <tr><td><b>Lib</b></td><td>Pure helpers, formatters, parsers</td><td>lib/</td><td>*Util.swift</td><td>in-module</td></tr>
          <tr><td><b>API / DTO</b></td><td>Network shapes, external services</td><td>api/</td><td>*API.swift</td><td>dto/</td></tr>
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 8 }}>Views import Stores, Lib, or API types. Stores import Lib and API. Lib imports nothing app-specific. API imports nothing app-specific. On Rust: routes import db + dto, db imports dto, dto imports nothing app-specific.</p>

      <H2 id="files">File rules</H2>
      <ul>
        <li><b>Max 100 lines per file.</b> If a file approaches 100 lines, split it. No exceptions across any platform.</li>
        <li><b>One component / view / struct per file.</b> Helpers go in separate files.</li>
        <li><b>No dead code.</b> If it&apos;s not used, delete it. No commented-out blocks.</li>
        <li><b>No placeholder stubs.</b> Don&apos;t ship TODO comments or empty implementations.</li>
        <li><b>No emoji in code or UI.</b> Use text symbols or system icons.</li>
        <li><b>Explicit types everywhere.</b> No <span style={{ fontFamily: "var(--font-mono)" }}>any</span> (TS) or implicit types (Swift).</li>
        <li><b>Minimal dependencies.</b> Every dependency must justify its existence. Prefer platform APIs.</li>
      </ul>

      <H2 id="naming">Naming</H2>
      <table>
        <thead><tr><th>Type</th><th>React</th><th>SwiftUI</th><th>Rust</th></tr></thead>
        <tbody>
          <tr><td>Views / components</td><td>PascalCase.tsx</td><td>PascalCase.swift</td><td>module.rs (snake)</td></tr>
          <tr><td>Stores / handlers</td><td>camelCase.ts</td><td>PascalCase.swift</td><td>db/note.rs</td></tr>
          <tr><td>Styles</td><td>single styles.css</td><td>Theme.swift</td><td>&mdash;</td></tr>
          <tr><td>Hooks</td><td>useCamelCase.ts</td><td>n/a</td><td>n/a</td></tr>
          <tr><td>Props / params</td><td>ComponentNameProps</td><td>let name: Type</td><td>fn name(arg: T)</td></tr>
        </tbody>
      </table>

      <H2 id="persistence">Persistence</H2>
      <p className="muted">Each platform uses its native primitive. One JSON blob per store, loaded at init.</p>
      <table>
        <thead><tr><th>Platform</th><th>Primitive</th><th>Key format</th><th>Write pattern</th></tr></thead>
        <tbody>
          <tr><td>React / Tauri</td><td>localStorage</td><td>opendock-notes</td><td>Debounced JSON.stringify</td></tr>
          <tr><td>SwiftUI</td><td>UserDefaults</td><td>opendock-notes</td><td>JSONEncoder on mutation</td></tr>
          <tr><td>Rust API</td><td>Postgres</td><td>&mdash;</td><td>sqlx + migrations</td></tr>
        </tbody>
      </table>
      <ul style={{ marginTop: 8 }}>
        <li>Load at store init. Never during render.</li>
        <li>Save on every mutation. Debounce on the React side to avoid blocking the main thread.</li>
        <li>On decode failure: return an empty array and let seed data populate.</li>
      </ul>

      <H2 id="deeper">Going deeper</H2>
      <ul>
        <li><Link href="/docs/architecture/state">State management patterns</Link> &mdash; auto-selection, debounced persistence, memoized derivations.</li>
        <li><Link href="/docs/architecture/antipatterns">Common anti-patterns</Link> &mdash; what to avoid, with explanations.</li>
        <li><Link href="/docs/architecture/monorepo">Monorepo structure</Link> &mdash; how the code is organized on disk.</li>
        <li><Link href="/docs/stacks">Stack-specific guidance</Link> &mdash; Tauri, SwiftUI, React, TypeScript, Rust, Toolkit, Next.js.</li>
      </ul>
    </>
  );
}
