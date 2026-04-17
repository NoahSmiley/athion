import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dev Guidelines" };

export default function DevGuidelinesPage() {
  return (
    <>
      <h1>Dev Guidelines</h1>
      <p className="muted">Architecture and code standards for all Athion products. Rigid, enforced, no exceptions.</p>

      <h2>Universal Rules</h2>
      <ul>
        <li><b>Max 100 lines per file.</b> If a file approaches 100 lines, split it. No exceptions across any platform.</li>
        <li><b>One component / view / struct per file.</b> Helpers go in separate files.</li>
        <li><b>No dead code.</b> If it is not used, delete it. No commented-out blocks.</li>
        <li><b>No placeholder stubs.</b> Do not ship TODO comments or empty implementations.</li>
        <li><b>No emoji in code or UI.</b> Use text symbols or system icons.</li>
        <li><b>No inline business logic.</b> Extract to stores, helpers, or hooks.</li>
        <li><b>Explicit types everywhere.</b> No any (TypeScript) or implicit types (Swift).</li>
        <li><b>Minimal dependencies.</b> Every dependency must justify its existence. Prefer platform APIs.</li>
      </ul>

      <h2>File Organization</h2>
      <p className="muted">Group by feature domain, not by type. Same structure across all platforms.</p>
      <table>
        <thead><tr><th>Layer</th><th>React (Tauri)</th><th>SwiftUI (iOS)</th><th>Next.js (Web)</th></tr></thead>
        <tbody>
          <tr><td>Entry</td><td>main.tsx, App.tsx</td><td>OpenDockApp.swift</td><td>layout.tsx, page.tsx</td></tr>
          <tr><td>Theme</td><td>styles.css (--a-* tokens)</td><td>Theme.swift (enum)</td><td>globals.css (--a-* tokens)</td></tr>
          <tr><td>State</td><td>stores/notes.ts (Zustand)</td><td>NotesStore.swift (ObservableObject)</td><td>N/A (server components)</td></tr>
          <tr><td>Views</td><td>components/NotesList.tsx</td><td>NoteListView.swift</td><td>app/(main)/page.tsx</td></tr>
          <tr><td>Models</td><td>Inline in store</td><td>Note.swift (struct)</td><td>Inline or lib/</td></tr>
          <tr><td>Shell</td><td>components/Shell.tsx</td><td>ContentView.swift (TabView)</td><td>app/(main)/layout.tsx</td></tr>
        </tbody>
      </table>

      <h2>Naming</h2>
      <table>
        <thead><tr><th>Type</th><th>React</th><th>SwiftUI</th></tr></thead>
        <tbody>
          <tr><td>Components / Views</td><td>PascalCase.tsx (NotesList.tsx)</td><td>PascalCase.swift (NoteListView.swift)</td></tr>
          <tr><td>Stores</td><td>camelCase.ts (notes.ts)</td><td>PascalCase.swift (NotesStore.swift)</td></tr>
          <tr><td>Styles</td><td>styles.css (single file)</td><td>Theme.swift (single enum)</td></tr>
          <tr><td>Hooks</td><td>useCamelCase.ts</td><td>N/A</td></tr>
          <tr><td>Props / Params</td><td>interface ComponentNameProps</td><td>let paramName: Type</td></tr>
        </tbody>
      </table>

      <h2>React (Tauri Desktop)</h2>
      <p className="muted">Tauri 2 + React 19 + TypeScript + Vite + Zustand.</p>
      <ul>
        <li><b>State:</b> Zustand stores. One store per domain. Thin stores, logic in action functions.</li>
        <li><b>Styling:</b> Single styles.css with CSS custom properties (--a-* tokens). No Tailwind. No CSS modules. No styled-components.</li>
        <li><b>Components:</b> Functional only. Props interfaces typed explicitly. One per file.</li>
        <li><b>Imports:</b> Use @/ path alias for all src imports.</li>
        <li><b>No class components.</b> No HOCs. No render props. Hooks only.</li>
        <li><b>No React Router</b> unless multiple top-level pages are needed. Use state for view switching.</li>
        <li><b>LocalStorage</b> for persistence until a backend exists. Single JSON blob per store.</li>
      </ul>

      <p style={{ marginTop: 8 }}><b>Target file sizes (React):</b></p>
      <table>
        <thead><tr><th>File</th><th>Target</th><th>Max</th></tr></thead>
        <tbody>
          <tr><td>App.tsx</td><td>20-30 lines</td><td>50</td></tr>
          <tr><td>Shell / Layout</td><td>20-30 lines</td><td>50</td></tr>
          <tr><td>Component</td><td>30-60 lines</td><td>100</td></tr>
          <tr><td>Store</td><td>40-80 lines</td><td>100</td></tr>
          <tr><td>styles.css</td><td>100-150 lines</td><td>200</td></tr>
          <tr><td>Total app</td><td>400-600 lines</td><td>800</td></tr>
        </tbody>
      </table>

      <h2>SwiftUI (iOS)</h2>
      <p className="muted">SwiftUI + Swift 6 + Xcode. Native iOS patterns.</p>
      <ul>
        <li><b>State:</b> ObservableObject with @Published. @EnvironmentObject for dependency injection.</li>
        <li><b>Theme:</b> Single Theme.swift enum with static Color properties. setupGlobal() for UIKit appearance.</li>
        <li><b>Views:</b> Struct conforming to View. One per file. Prefer composition over large bodies.</li>
        <li><b>Navigation:</b> NavigationStack with .navigationDestination. Custom headers via .navigationBarHidden(true) when needed.</li>
        <li><b>Tab bar:</b> Native TabView with UITabBarAppearance customization.</li>
        <li><b>Persistence:</b> UserDefaults + Codable for now. CoreData or SwiftData when complexity demands it.</li>
        <li><b>No UIKit views</b> unless SwiftUI has no equivalent. Prefer SwiftUI-native solutions.</li>
        <li><b>No SwiftUI previews</b> in shipped code. Remove #Preview blocks before commit.</li>
      </ul>

      <p style={{ marginTop: 8 }}><b>Target file sizes (SwiftUI):</b></p>
      <table>
        <thead><tr><th>File</th><th>Target</th><th>Max</th></tr></thead>
        <tbody>
          <tr><td>App entry</td><td>10-15 lines</td><td>20</td></tr>
          <tr><td>ContentView / Shell</td><td>30-40 lines</td><td>60</td></tr>
          <tr><td>View</td><td>40-80 lines</td><td>100</td></tr>
          <tr><td>Store</td><td>30-50 lines</td><td>80</td></tr>
          <tr><td>Model</td><td>20-30 lines</td><td>50</td></tr>
          <tr><td>Theme</td><td>30-40 lines</td><td>50</td></tr>
          <tr><td>Total app</td><td>300-500 lines</td><td>700</td></tr>
        </tbody>
      </table>

      <h2>Next.js (Web)</h2>
      <p className="muted">Next.js App Router + TypeScript. Server components by default.</p>
      <ul>
        <li><b>Pages:</b> Server components. &quot;use client&quot; only when state or interactivity is needed.</li>
        <li><b>Styling:</b> globals.css with --a-* tokens. Inline styles for layout. No Tailwind utility classes in JSX.</li>
        <li><b>No component library.</b> No shadcn, no Radix, no MUI. Plain HTML + CSS.</li>
        <li><b>Forms:</b> Stacked label + input layout. No tables for form layout.</li>
        <li><b>Data:</b> Plain arrays/objects in page files. No separate data files unless shared.</li>
      </ul>

      <p style={{ marginTop: 8 }}><b>Target file sizes (Next.js):</b></p>
      <table>
        <thead><tr><th>File</th><th>Target</th><th>Max</th></tr></thead>
        <tbody>
          <tr><td>Page</td><td>20-60 lines</td><td>100</td></tr>
          <tr><td>Layout</td><td>15-25 lines</td><td>40</td></tr>
          <tr><td>Component</td><td>15-40 lines</td><td>60</td></tr>
          <tr><td>globals.css</td><td>30-50 lines</td><td>60</td></tr>
          <tr><td>Total frontend</td><td>500-800 lines</td><td>1000</td></tr>
        </tbody>
      </table>

      <h2>Rust (API)</h2>
      <p className="muted">axum + tokio + sqlx (Postgres) + reqwest. Identity from athion.me via Bearer-token verification, never local password auth.</p>
      <ul>
        <li><b>Framework:</b> axum for HTTP, tokio runtime, tower-http layers (CORS, trace). No actix, no warp, no rocket.</li>
        <li><b>Database:</b> sqlx with the Postgres driver. <span style={{ fontFamily: "var(--font-mono)" }}>query_as::&lt;_, T&gt;()</span> with <span style={{ fontFamily: "var(--font-mono)" }}>FromRow</span>-deriving structs. No ORM.</li>
        <li><b>Migrations:</b> timestamped files under <span style={{ fontFamily: "var(--font-mono)" }}>migrations/</span>, run at startup via <span style={{ fontFamily: "var(--font-mono)" }}>sqlx::migrate!().run(&pool)</span>. No down-migrations &mdash; forward only.</li>
        <li><b>Auth:</b> <span style={{ fontFamily: "var(--font-mono)" }}>AuthUser</span> extractor implements <span style={{ fontFamily: "var(--font-mono)" }}>FromRequestParts</span>, forwards the Bearer token to athion.me <span style={{ fontFamily: "var(--font-mono)" }}>/api/auth/verify</span>, upserts the user. Never verify JWTs locally &mdash; athion.me is the identity provider.</li>
        <li><b>Errors:</b> one <span style={{ fontFamily: "var(--font-mono)" }}>ApiError</span> enum per service implementing <span style={{ fontFamily: "var(--font-mono)" }}>IntoResponse</span>. Handlers return <span style={{ fontFamily: "var(--font-mono)" }}>ApiResult&lt;T&gt;</span>. No panics in request paths.</li>
        <li><b>Module layout:</b> <span style={{ fontFamily: "var(--font-mono)" }}>main.rs</span> (entry), <span style={{ fontFamily: "var(--font-mono)" }}>config.rs</span>, <span style={{ fontFamily: "var(--font-mono)" }}>state.rs</span>, <span style={{ fontFamily: "var(--font-mono)" }}>error.rs</span>, <span style={{ fontFamily: "var(--font-mono)" }}>auth/</span>, <span style={{ fontFamily: "var(--font-mono)" }}>dto/</span>, <span style={{ fontFamily: "var(--font-mono)" }}>db/</span>, <span style={{ fontFamily: "var(--font-mono)" }}>routes/</span>. One domain per file.</li>
        <li><b>Handlers are thin.</b> Handler extracts, calls <span style={{ fontFamily: "var(--font-mono)" }}>db::</span>, returns JSON. No SQL in handlers, no HTTP concerns in <span style={{ fontFamily: "var(--font-mono)" }}>db::</span>.</li>
        <li><b>Deployment:</b> <span style={{ fontFamily: "var(--font-mono)" }}>--release</span> binary under systemd, fronted by Cloudflare Tunnel. No Docker in the hot path unless the service specifically needs it.</li>
      </ul>

      <p style={{ marginTop: 8 }}><b>Target file sizes (Rust API):</b></p>
      <table>
        <thead><tr><th>File</th><th>Target</th><th>Max</th></tr></thead>
        <tbody>
          <tr><td>main.rs</td><td>30-50 lines</td><td>60</td></tr>
          <tr><td>route module</td><td>20-60 lines</td><td>100</td></tr>
          <tr><td>db module</td><td>30-80 lines</td><td>100</td></tr>
          <tr><td>dto module</td><td>20-80 lines</td><td>100</td></tr>
          <tr><td>error.rs</td><td>20-40 lines</td><td>60</td></tr>
          <tr><td>migration</td><td>10-60 lines</td><td>100</td></tr>
          <tr><td>Total service</td><td>400-900 lines</td><td>1500</td></tr>
        </tbody>
      </table>

      <h2>Architecture Principles</h2>
      <ul>
        <li><b>Feature-first.</b> Build one feature completely before starting the next. No half-finished scaffolding.</li>
        <li><b>Delete before abstract.</b> Remove code rather than making it configurable. Three similar lines are better than a premature abstraction.</li>
        <li><b>No backwards compatibility.</b> If something is unused, delete it completely. No deprecated wrappers.</li>
        <li><b>Platform-native.</b> Use native patterns for each platform. Do not force web patterns onto iOS or vice versa.</li>
        <li><b>Shared design, separate code.</b> Design tokens and visual language are shared. Implementation is platform-specific.</li>
        <li><b>No framework churn.</b> Pick a stack and commit. Do not migrate to new libraries for marginal gains.</li>
      </ul>

      <h2>What NOT to Do</h2>
      <ul>
        <li>No files over 100 lines.</li>
        <li>No Tailwind utility soup in JSX.</li>
        <li>No any types. No implicit returns without types.</li>
        <li>No emoji in code, comments, or UI.</li>
        <li>No console.log / print() in shipped code.</li>
        <li>No commented-out code blocks.</li>
        <li>No TODO / FIXME / HACK comments in main branch.</li>
        <li>No git commits with &quot;WIP&quot; or &quot;fix&quot; as the only message.</li>
        <li>No dependencies for things the platform provides (date formatting, UUID generation, JSON encoding).</li>
        <li>No React Router, Redux, MobX, Recoil. Use Zustand for React state, ObservableObject for Swift.</li>
        <li>No animation libraries. CSS transitions only, and only for opacity/color.</li>
      </ul>
    </>
  );
}
