import type { Metadata } from "next";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "Rust" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "modules", label: "Module layout" },
  { id: "handlers", label: "Handlers" },
  { id: "db", label: "Database" },
  { id: "auth", label: "Auth" },
  { id: "migrations", label: "Migrations" },
  { id: "antipatterns", label: "Anti-patterns" },
];

const m = { fontFamily: "var(--font-mono)" } as const;
const codeStyle: React.CSSProperties = {
  background: "#111",
  padding: 12,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  overflow: "auto",
  border: "1px solid #2a2a2a",
};

export default function RustStackPage() {
  return (
    <>
      <h1>Rust</h1>
      <p className="muted">Rust API services for athion. axum + sqlx (Postgres). Identity from athion.me via Bearer-token verification. One domain per module, thin handlers.</p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <ul>
        <li>axum for HTTP. tokio runtime.</li>
        <li>sqlx for Postgres &mdash; not diesel, not seaorm.</li>
        <li>Identity provider: athion.me. We never hash passwords downstream.</li>
        <li>One domain per module. Thin handlers, fat <span style={m}>db::</span>.</li>
      </ul>

      <H2 id="modules">Module layout</H2>
      <ul>
        <li><span style={m}>main.rs</span> &mdash; entry, router composition, migrations at startup via <span style={m}>sqlx::migrate!().run()</span>.</li>
        <li><span style={m}>config.rs</span> &mdash; env loading into a <span style={m}>Config</span> struct. No <span style={m}>env::var</span> calls outside this file.</li>
        <li><span style={m}>state.rs</span> &mdash; <span style={m}>AppState</span> with pool + http client + config values. Cloned into handlers.</li>
        <li><span style={m}>error.rs</span> &mdash; single <span style={m}>ApiError</span> enum implementing <span style={m}>IntoResponse</span>. Handlers return <span style={m}>ApiResult&lt;T&gt;</span>.</li>
        <li><span style={m}>auth/</span> &mdash; <span style={m}>verify.rs</span> (token forwarder), <span style={m}>extract.rs</span> (<span style={m}>AuthUser</span> FromRequestParts).</li>
        <li><span style={m}>dto/</span> &mdash; one file per domain. Serialize/Deserialize structs + FromRow records.</li>
        <li><span style={m}>db/</span> &mdash; one file per domain. Pure functions, <span style={m}>(pool, args) -&gt; ApiResult&lt;T&gt;</span>. No HTTP types.</li>
        <li><span style={m}>routes/</span> &mdash; one file per resource. Thin handlers: extract, call <span style={m}>db::</span>, return JSON.</li>
      </ul>

      <H2 id="handlers">Handlers</H2>
      <p className="muted">Handlers should be &lt;20 lines. Extract, delegate, return.</p>
      <pre style={codeStyle}>{`async fn create(
  State(s): State<AppState>,
  user: AuthUser,
  Json(body): Json<CreateNote>,
) -> ApiResult<(StatusCode, Json<Note>)> {
  let n = db::note::create(&s.pool, user.0.id, body).await?;
  Ok((StatusCode::CREATED, Json(n)))
}`}</pre>

      <H2 id="db">Database</H2>
      <ul>
        <li><span style={m}>query_as::&lt;_, T&gt;()</span> with derive-FromRow structs.</li>
        <li>Bind every user value. Never format SQL with user input.</li>
        <li>Ownership scoping in the <span style={m}>WHERE</span> clause. Every query that returns a user&apos;s resource filters by <span style={m}>owner_id = $1</span>.</li>
        <li><span style={m}>fetch_optional()</span> + <span style={m}>.ok_or(ApiError::NotFound)</span> for single-row lookups.</li>
        <li><span style={m}>COALESCE($n, column)</span> for optional patches &mdash; one <span style={m}>UPDATE</span> covers all fields, <span style={m}>None</span> preserves existing value.</li>
        <li>For nullable patches where <span style={m}>null</span> means &quot;clear&quot;, use <span style={m}>Option&lt;Option&lt;T&gt;&gt;</span> on the DTO and a <span style={m}>CASE WHEN</span> in SQL.</li>
      </ul>

      <H2 id="auth">Auth</H2>
      <ul>
        <li>athion.me is the identity provider. No password hashing in downstream services.</li>
        <li><span style={m}>AuthUser</span> extractor: pull <span style={m}>Authorization: Bearer ...</span>, forward to <span style={m}>ATHION_VERIFY_URL</span>, deserialize user JSON, upsert into local <span style={m}>users</span> table.</li>
        <li>Every user-returning route takes <span style={m}>user: AuthUser</span> as an argument &mdash; compile-time enforcement of auth.</li>
        <li>Membership checks at the handler layer. Return <span style={m}>ApiError::NotFound</span> on failure &mdash; never leak existence.</li>
        <li>Never share <span style={m}>JWT_SECRET</span> with downstream services. Verification always round-trips to athion.me.</li>
      </ul>

      <H2 id="migrations">Migrations</H2>
      <ul>
        <li>Timestamped filenames: <span style={m}>YYYYMMDDHHMMSS_name.sql</span>.</li>
        <li>Forward-only. No down-migrations. If a change is wrong, write a new forward migration.</li>
        <li>Run at startup via <span style={m}>sqlx::migrate!().run(&pool)</span>. Safe to re-run &mdash; sqlx tracks applied versions.</li>
        <li>Index all FK columns. Index by <span style={m}>owner_id</span> + sort column for list endpoints.</li>
      </ul>

      <H2 id="antipatterns">Anti-patterns</H2>
      <ul>
        <li><b>SQL in handlers</b> &mdash; handlers should be &lt;20 lines and delegate to <span style={m}>db::</span>.</li>
        <li><b>HTTP types in db/</b> &mdash; no <span style={m}>StatusCode</span>, <span style={m}>Json</span>, <span style={m}>Response</span> in db modules.</li>
        <li><b>Panics in request paths</b> &mdash; no <span style={m}>.unwrap()</span>, <span style={m}>.expect()</span>, panicky conversions in handlers. Use <span style={m}>?</span>.</li>
        <li><b>Per-request DB pools</b> &mdash; one pool on <span style={m}>AppState</span>. Never <span style={m}>PgPool::connect()</span> inside a handler.</li>
        <li><b>String-formatted SQL</b> &mdash; always <span style={m}>$1, $2, ...</span> parameters.</li>
        <li><b>Local JWT verification</b> &mdash; route through athion.me, never share the secret.</li>
      </ul>
    </>
  );
}
