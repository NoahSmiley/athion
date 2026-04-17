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
        <thead><tr><th>Layer</th><th>Responsibility</th><th>React</th><th>SwiftUI</th><th>Rust API</th></tr></thead>
        <tbody>
          <tr><td><b>View / Handler</b></td><td>Render UI / serve HTTP</td><td>components/</td><td>*View.swift</td><td>routes/</td></tr>
          <tr><td><b>Store / DB</b></td><td>State or persistence</td><td>stores/</td><td>*Store.swift</td><td>db/</td></tr>
          <tr><td><b>Lib</b></td><td>Pure helpers, formatters, parsers</td><td>lib/</td><td>*Util.swift</td><td>in-module</td></tr>
          <tr><td><b>API / DTO</b></td><td>Network shapes, external services</td><td>api/</td><td>*API.swift</td><td>dto/</td></tr>
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 8 }}>Views import Stores, Lib, or API types. Stores import Lib and API. Lib imports nothing app-specific. API imports nothing app-specific. On Rust: routes import db + dto, db imports dto, dto imports nothing app-specific.</p>

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

      <h2>Rust API</h2>
      <p className="muted">axum + sqlx (Postgres). Identity from athion.me via Bearer-token verification. One domain per module, thin handlers.</p>

      <p style={{ marginTop: 8 }}><b>Module layout</b></p>
      <ul>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>main.rs</span> &mdash; entry, router composition, migrations at startup via <span style={{ fontFamily: "var(--font-mono)" }}>sqlx::migrate!().run()</span>.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>config.rs</span> &mdash; env loading into a <span style={{ fontFamily: "var(--font-mono)" }}>Config</span> struct. No <span style={{ fontFamily: "var(--font-mono)" }}>env::var</span> calls outside this file.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>state.rs</span> &mdash; <span style={{ fontFamily: "var(--font-mono)" }}>AppState</span> with pool + http client + config values. Cloned into handlers.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>error.rs</span> &mdash; single <span style={{ fontFamily: "var(--font-mono)" }}>ApiError</span> enum implementing <span style={{ fontFamily: "var(--font-mono)" }}>IntoResponse</span>. Handlers return <span style={{ fontFamily: "var(--font-mono)" }}>ApiResult&lt;T&gt;</span>.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>auth/</span> &mdash; <span style={{ fontFamily: "var(--font-mono)" }}>verify.rs</span> (token forwarder), <span style={{ fontFamily: "var(--font-mono)" }}>extract.rs</span> (<span style={{ fontFamily: "var(--font-mono)" }}>AuthUser</span> FromRequestParts).</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>dto/</span> &mdash; one file per domain (<span style={{ fontFamily: "var(--font-mono)" }}>note.rs</span>, <span style={{ fontFamily: "var(--font-mono)" }}>board.rs</span>). Serialize/Deserialize structs + FromRow-deriving records.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>db/</span> &mdash; one file per domain. Pure functions, <span style={{ fontFamily: "var(--font-mono)" }}>(pool, args) -&gt; ApiResult&lt;T&gt;</span>. No HTTP types.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>routes/</span> &mdash; one file per resource. Thin handlers: extract, call <span style={{ fontFamily: "var(--font-mono)" }}>db::</span>, return JSON.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Handler pattern</b></p>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`async fn create(
  State(s): State<AppState>,
  user: AuthUser,
  Json(body): Json<CreateNote>,
) -> ApiResult<(StatusCode, Json<Note>)> {
  let n = db::note::create(&s.pool, user.0.id, body).await?;
  Ok((StatusCode::CREATED, Json(n)))
}`}</pre>

      <p style={{ marginTop: 12 }}><b>Database patterns</b></p>
      <ul>
        <li>sqlx, not diesel, not seaorm. <span style={{ fontFamily: "var(--font-mono)" }}>query_as::&lt;_, T&gt;()</span> with derive-FromRow structs.</li>
        <li>Bind every user value. Never format SQL with user input.</li>
        <li>Ownership scoping lives in the <span style={{ fontFamily: "var(--font-mono)" }}>WHERE</span> clause. Every query that returns a user&apos;s resource filters by <span style={{ fontFamily: "var(--font-mono)" }}>owner_id = $1</span> or joins through a membership table.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>fetch_optional()</span> + <span style={{ fontFamily: "var(--font-mono)" }}>.ok_or(ApiError::NotFound)</span> for single-row lookups. Don&apos;t let sqlx panic on missing rows.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>COALESCE($n, column)</span> for optional patches &mdash; one <span style={{ fontFamily: "var(--font-mono)" }}>UPDATE</span> statement covers all fields, <span style={{ fontFamily: "var(--font-mono)" }}>None</span> preserves existing value.</li>
        <li>For nullable patches where <span style={{ fontFamily: "var(--font-mono)" }}>null</span> means &quot;clear&quot;, use <span style={{ fontFamily: "var(--font-mono)" }}>Option&lt;Option&lt;T&gt;&gt;</span> on the DTO and a <span style={{ fontFamily: "var(--font-mono)" }}>CASE WHEN</span> in SQL.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Auth pattern</b></p>
      <ul>
        <li>athion.me is the identity provider. OpenDock (and future services) never hash passwords.</li>
        <li><span style={{ fontFamily: "var(--font-mono)" }}>AuthUser</span> extractor: pull <span style={{ fontFamily: "var(--font-mono)" }}>Authorization: Bearer ...</span> header, forward to <span style={{ fontFamily: "var(--font-mono)" }}>ATHION_VERIFY_URL</span>, deserialize user JSON, upsert into local <span style={{ fontFamily: "var(--font-mono)" }}>users</span> table.</li>
        <li>Every user-returning route takes <span style={{ fontFamily: "var(--font-mono)" }}>user: AuthUser</span> as an argument &mdash; compile-time enforcement of auth.</li>
        <li>Membership checks live at the handler layer (<span style={{ fontFamily: "var(--font-mono)" }}>is_member(pool, resource_id, user_id)</span>), returning <span style={{ fontFamily: "var(--font-mono)" }}>ApiError::NotFound</span> on failure &mdash; never leak existence of resources you can&apos;t access.</li>
        <li>Never share <span style={{ fontFamily: "var(--font-mono)" }}>JWT_SECRET</span> with downstream services. Verification always round-trips to athion.me.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Migrations</b></p>
      <ul>
        <li>Timestamped filenames: <span style={{ fontFamily: "var(--font-mono)" }}>YYYYMMDDHHMMSS_name.sql</span>.</li>
        <li>Forward-only. No down-migrations. If a change is wrong, write a new forward migration.</li>
        <li>Run at startup via <span style={{ fontFamily: "var(--font-mono)" }}>sqlx::migrate!().run(&pool)</span>. Safe to re-run &mdash; sqlx tracks applied versions.</li>
        <li>Index all FK columns. Index by <span style={{ fontFamily: "var(--font-mono)" }}>owner_id</span> + sort column for list endpoints.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Anti-patterns (Rust)</b></p>
      <ul>
        <li><b>SQL in handlers</b> &mdash; handlers should be &lt;20 lines and delegate to <span style={{ fontFamily: "var(--font-mono)" }}>db::</span>.</li>
        <li><b>HTTP types in db/</b> &mdash; no <span style={{ fontFamily: "var(--font-mono)" }}>StatusCode</span>, <span style={{ fontFamily: "var(--font-mono)" }}>Json</span>, <span style={{ fontFamily: "var(--font-mono)" }}>Response</span> in db modules.</li>
        <li><b>Panics in request paths</b> &mdash; no <span style={{ fontFamily: "var(--font-mono)" }}>.unwrap()</span>, <span style={{ fontFamily: "var(--font-mono)" }}>.expect()</span>, or panicky numeric conversions in handlers. Use <span style={{ fontFamily: "var(--font-mono)" }}>?</span> and let <span style={{ fontFamily: "var(--font-mono)" }}>ApiError</span> carry it.</li>
        <li><b>Per-request DB pools</b> &mdash; one pool on <span style={{ fontFamily: "var(--font-mono)" }}>AppState</span>, clone cheaply. Never <span style={{ fontFamily: "var(--font-mono)" }}>PgPool::connect()</span> inside a handler.</li>
        <li><b>String-formatted SQL</b> &mdash; always <span style={{ fontFamily: "var(--font-mono)" }}>$1, $2, ...</span> parameters.</li>
        <li><b>Verifying JWTs locally with a shared secret</b> &mdash; route through athion.me instead.</li>
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
