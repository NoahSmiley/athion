import type { Metadata } from "next";

export const metadata: Metadata = { title: "Architecture Guidelines" };

export default function ArchitectureGuidelinesPage() {
  return (
    <>
      <h1>Architecture Guidelines</h1>
      <p className="muted">How code is organized across Athion products. Shared patterns for React, SwiftUI, Next.js, and backend APIs.</p>

      <h2>Core Principles</h2>
      <ul>
        <li><b>State lives in one place.</b> One store per domain. Components read; they do not own persistent state.</li>
        <li><b>Business logic lives in stores or helpers.</b> Components are presentation only. No logic in JSX.</li>
        <li><b>Side effects are explicit.</b> Persistence, network, time &mdash; all live behind a named function. No hidden effects in render paths.</li>
        <li><b>Derive, don&apos;t mirror.</b> If value B can be computed from A, compute it. Do not store both.</li>
        <li><b>Composition over configuration.</b> Small components composed together. No mega-components with many optional props.</li>
        <li><b>Cross the layer boundary deliberately.</b> UI does not know about storage. Stores do not know about UI.</li>
      </ul>

      <h2>Layer Model</h2>
      <p className="muted">Every Athion product has four layers. Dependencies flow downward only.</p>
      <table>
        <thead><tr><th>Layer</th><th>Responsibility</th><th>React</th><th>SwiftUI</th></tr></thead>
        <tbody>
          <tr><td><b>View</b></td><td>Render UI, dispatch events</td><td>components/</td><td>*View.swift</td></tr>
          <tr><td><b>Store</b></td><td>State, mutations, persistence</td><td>stores/</td><td>*Store.swift</td></tr>
          <tr><td><b>Lib</b></td><td>Pure helpers, formatters, parsers</td><td>lib/</td><td>*Util.swift</td></tr>
          <tr><td><b>API</b></td><td>Network, external services</td><td>api/</td><td>*API.swift</td></tr>
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 8 }}>Views import Stores, Lib, or API types. Stores import Lib and API. Lib imports nothing app-specific. API imports nothing app-specific.</p>

      <h2>React / Tauri</h2>
      <p className="muted">Zustand for state. Functional components. No HOCs, no render props, no component libraries.</p>

      <p style={{ marginTop: 8 }}><b>Store shape</b></p>
      <ul>
        <li>One <span style={{ fontFamily: "var(--font-mono)" }}>create&lt;State&gt;()</span> call per domain. No slice composition.</li>
        <li>State and actions defined in the same interface. Selectors are inline in components.</li>
        <li>Initial state computed at module load. Default selections (activeId) set from initial data, not via <span style={{ fontFamily: "var(--font-mono)" }}>useEffect</span>.</li>
        <li>Mutations follow the pattern: derive next state &rarr; save &rarr; set. Never <span style={{ fontFamily: "var(--font-mono)" }}>set()</span> then <span style={{ fontFamily: "var(--font-mono)" }}>save()</span> &mdash; saving stale data.</li>
        <li>Persistence is debounced. A module-level <span style={{ fontFamily: "var(--font-mono)" }}>saveTimer</span> coalesces rapid mutations. 150ms is the default.</li>
        <li>No computed selectors as methods. <span style={{ fontFamily: "var(--font-mono)" }}>filtered()</span> on the store returns a new array every render, breaking memoization. Use <span style={{ fontFamily: "var(--font-mono)" }}>useMemo</span> in the consumer.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Component rules</b></p>
      <ul>
        <li>Props interface named <span style={{ fontFamily: "var(--font-mono)" }}>ComponentNameProps</span>. No <span style={{ fontFamily: "var(--font-mono)" }}>Props</span> shorthand.</li>
        <li>Destructure props at the signature. Avoid <span style={{ fontFamily: "var(--font-mono)" }}>props.foo</span> inside the body.</li>
        <li>Callback props wrapped in <span style={{ fontFamily: "var(--font-mono)" }}>useCallback</span> at the parent when passed to memoized children.</li>
        <li>Expensive derivations wrapped in <span style={{ fontFamily: "var(--font-mono)" }}>useMemo</span>. Cheap ones inlined.</li>
        <li>Early returns before hook calls are forbidden. Hooks must run in the same order every render.</li>
        <li>Effects clean up on unmount. Timers, listeners, subscriptions &mdash; all need a cleanup function.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Selector patterns</b></p>
      <ul>
        <li>Select primitives or stable references. <span style={{ fontFamily: "var(--font-mono)" }}>s.activeId</span> &mdash; good. <span style={{ fontFamily: "var(--font-mono)" }}>s.boards.filter(...)</span> &mdash; new array, re-renders every update.</li>
        <li>To derive: pull the raw array, memoize in the component. Do not put <span style={{ fontFamily: "var(--font-mono)" }}>.filter().sort()</span> inside the selector.</li>
        <li>When multiple fields are needed together, select them in separate <span style={{ fontFamily: "var(--font-mono)" }}>useStore</span> calls or use <span style={{ fontFamily: "var(--font-mono)" }}>useShallow</span>.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Drag, drop, and pointer events</b></p>
      <ul>
        <li>Use pointer events (<span style={{ fontFamily: "var(--font-mono)" }}>pointerdown</span> / <span style={{ fontFamily: "var(--font-mono)" }}>pointermove</span> / <span style={{ fontFamily: "var(--font-mono)" }}>pointerup</span>) for drag. Not HTML5 <span style={{ fontFamily: "var(--font-mono)" }}>draggable</span>.</li>
        <li>Drag state in refs, not state. Drag moves at 60fps &mdash; React re-renders every frame kill performance.</li>
        <li>Update the drag ghost via direct DOM manipulation. Use <span style={{ fontFamily: "var(--font-mono)" }}>data-*</span> attributes for drop targets. Update classes imperatively during drag.</li>
        <li>Commit to the store only on drop. Intermediate hover state never touches React.</li>
      </ul>

      <h2>SwiftUI / iOS</h2>
      <p className="muted">ObservableObject for state. Native patterns. No UIKit unless SwiftUI has no equivalent.</p>
      <ul>
        <li>One <span style={{ fontFamily: "var(--font-mono)" }}>ObservableObject</span> class per domain. <span style={{ fontFamily: "var(--font-mono)" }}>@Published</span> only what views observe.</li>
        <li>Marked <span style={{ fontFamily: "var(--font-mono)" }}>@MainActor</span> at the class level. Mutations always on main.</li>
        <li>Stores are injected via <span style={{ fontFamily: "var(--font-mono)" }}>@EnvironmentObject</span>. Never instantiated inside views.</li>
        <li>Models are value-type structs conforming to <span style={{ fontFamily: "var(--font-mono)" }}>Identifiable, Codable, Equatable</span>.</li>
        <li>No computed properties that do heavy work. A <span style={{ fontFamily: "var(--font-mono)" }}>var filtered: [Note]</span> that calls <span style={{ fontFamily: "var(--font-mono)" }}>notes.filter(...)</span> runs on every view access. Cache with <span style={{ fontFamily: "var(--font-mono)" }}>didSet</span> or <span style={{ fontFamily: "var(--font-mono)" }}>@Published var filtered</span>.</li>
        <li>Navigation state in a <span style={{ fontFamily: "var(--font-mono)" }}>@State</span> <span style={{ fontFamily: "var(--font-mono)" }}>NavigationPath</span> at the shell level. Push via <span style={{ fontFamily: "var(--font-mono)" }}>path.append(id)</span>.</li>
        <li>Confirmation dialogs use <span style={{ fontFamily: "var(--font-mono)" }}>.alert</span>. Sheets use <span style={{ fontFamily: "var(--font-mono)" }}>.sheet</span>. Do not reinvent.</li>
      </ul>

      <h2>Persistence</h2>
      <p className="muted">All Athion products persist state locally until a backend exists. Each platform uses the native primitive.</p>
      <table>
        <thead><tr><th>Platform</th><th>Primitive</th><th>Key format</th><th>Write pattern</th></tr></thead>
        <tbody>
          <tr><td>React / Tauri</td><td>localStorage</td><td>opendock-notes</td><td>Debounced JSON.stringify</td></tr>
          <tr><td>SwiftUI</td><td>UserDefaults</td><td>opendock-notes</td><td>JSONEncoder on mutation</td></tr>
          <tr><td>Next.js</td><td>Server DB (future)</td><td>&mdash;</td><td>&mdash;</td></tr>
        </tbody>
      </table>
      <ul style={{ marginTop: 8 }}>
        <li>One JSON blob per store. No per-entity keys.</li>
        <li>Load at store init. Never during render.</li>
        <li>Save on every mutation. Debounce on the React side to avoid blocking the main thread.</li>
        <li>On decode failure: return an empty array and let seed data populate. No error UI until a backend exists.</li>
      </ul>

      <h2>API Layer (Future)</h2>
      <p className="muted">When a backend is introduced, follow these rules.</p>
      <ul>
        <li>One <span style={{ fontFamily: "var(--font-mono)" }}>request&lt;T&gt;()</span> helper. All HTTP calls go through it.</li>
        <li>API functions are pure: <span style={{ fontFamily: "var(--font-mono)" }}>export async function fetchBoards(): Promise&lt;Board[]&gt;</span>. No classes.</li>
        <li>Organized by domain: <span style={{ fontFamily: "var(--font-mono)" }}>api/boards.ts</span>, <span style={{ fontFamily: "var(--font-mono)" }}>api/notes.ts</span>, <span style={{ fontFamily: "var(--font-mono)" }}>api/auth.ts</span>.</li>
        <li>Response types defined alongside the function. Shared types in <span style={{ fontFamily: "var(--font-mono)" }}>@athion/shared</span>.</li>
        <li>Errors: throw. Never return a tagged union. Let stores catch and handle.</li>
        <li>Authentication via SSO through athion.me. Tokens stored in platform keychain, never in app storage.</li>
      </ul>

      <h2>State Management Patterns</h2>

      <p style={{ marginTop: 8 }}><b>Auto-selection on load</b></p>
      <p>Set <span style={{ fontFamily: "var(--font-mono)" }}>activeId</span> in the store&apos;s initial state, not via <span style={{ fontFamily: "var(--font-mono)" }}>useEffect</span>:</p>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`const initial = loadOrSeed();
export const useStore = create<State>((set) => ({
  items: initial,
  activeId: initial[0]?.id ?? null,
  // ...
}));`}</pre>

      <p style={{ marginTop: 12 }}><b>Debounced persistence</b></p>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`let saveTimer: ReturnType<typeof setTimeout> | null = null;
function save(data: Data) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
    saveTimer = null;
  }, 150);
}`}</pre>

      <p style={{ marginTop: 12 }}><b>Memoized derivations</b></p>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`const all = useNotes((s) => s.notes);
const search = useNotes((s) => s.search);
const filtered = useMemo(() => filterNotes(all, search), [all, search]);`}</pre>

      <h2>Common Anti-Patterns</h2>
      <ul>
        <li><b>Selector methods</b> &mdash; <span style={{ fontFamily: "var(--font-mono)" }}>useStore((s) =&gt; s.filtered())</span> returns a new array every render. Select raw state, memoize in the component.</li>
        <li><b>Mirror state</b> &mdash; copying a prop into local state with <span style={{ fontFamily: "var(--font-mono)" }}>useState</span>, then syncing in an effect. Use the prop directly or lift state up.</li>
        <li><b>Effect for derived values</b> &mdash; computing a value in an effect and storing it. Use <span style={{ fontFamily: "var(--font-mono)" }}>useMemo</span>.</li>
        <li><b>Effect for auto-selection</b> &mdash; setting <span style={{ fontFamily: "var(--font-mono)" }}>activeId</span> after mount via effect. Set it in the store&apos;s initial state.</li>
        <li><b>Uncleaned timers</b> &mdash; <span style={{ fontFamily: "var(--font-mono)" }}>setTimeout</span> in a component without a cleanup function. Always return a cleanup from <span style={{ fontFamily: "var(--font-mono)" }}>useEffect</span>.</li>
        <li><b>Hooks after early return</b> &mdash; calling <span style={{ fontFamily: "var(--font-mono)" }}>useEffect</span> below <span style={{ fontFamily: "var(--font-mono)" }}>if (!data) return null</span>. Hooks must run in the same order every render.</li>
        <li><b>Business logic in JSX</b> &mdash; <span style={{ fontFamily: "var(--font-mono)" }}>notes.filter(...).sort(...).map(...)</span> inside return. Extract to a memo or helper.</li>
        <li><b>Wide store reads</b> &mdash; <span style={{ fontFamily: "var(--font-mono)" }}>useStore((s) =&gt; s)</span> subscribes to every field. Select only what the component needs.</li>
        <li><b>Inline styles for layout</b> &mdash; hardcoded <span style={{ fontFamily: "var(--font-mono)" }}>{`style={{...}}`}</span>. Use a class. Inline styles reserved for dynamic values (transforms, positions).</li>
      </ul>

      <h2>Monorepo Structure</h2>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`apps/
  opendock/              React + Tauri desktop
    src/
      App.tsx            Shell composition
      main.tsx           Entry + CSS import
      types.ts           Cross-cutting types (Tool, MobileView)
      styles.css         Single CSS file with --a-* tokens
      components/        One component per file, PascalCase
      stores/            Zustand stores, one per domain
      hooks/             Shared hooks, use prefix
      lib/               Pure helpers, no app state
      api/               Network calls (future)
  opendock-ios/          SwiftUI iOS
    OpenDock/
      OpenDockApp.swift  @main entry
      ContentView.swift  TabView shell
      Theme.swift        Color + font tokens
      *View.swift        One view per file
      *Store.swift       ObservableObject per domain
      *.swift            Models (structs)
  backend/               Future API server
packages/
  shared/                Shared types, validation schemas`}</pre>

      <h2>What NOT to Do</h2>
      <ul>
        <li>No Redux, MobX, Recoil. Zustand only.</li>
        <li>No React Router unless multiple top-level pages exist.</li>
        <li>No HOCs, render props, or class components.</li>
        <li>No slice-based store composition.</li>
        <li>No computed selectors as store methods.</li>
        <li>No <span style={{ fontFamily: "var(--font-mono)" }}>useEffect</span> for derived values.</li>
        <li>No business logic in views or stores outside their domain.</li>
        <li>No persistence inside render paths.</li>
        <li>No untracked side effects. Every network call, storage write, or timer has a named function.</li>
      </ul>
    </>
  );
}
