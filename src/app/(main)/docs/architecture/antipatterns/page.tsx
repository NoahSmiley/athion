import type { Metadata } from "next";

export const metadata: Metadata = { title: "Anti-patterns" };

const m = (s: string): React.CSSProperties => ({ fontFamily: "var(--font-mono)" });

const ITEMS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Selector methods",
    body: <><span style={m("")}>useStore((s) =&gt; s.filtered())</span> returns a new array every render. Select raw state, memoize in the component.</>,
  },
  {
    title: "Mirror state",
    body: <>Copying a prop into local state with <span style={m("")}>useState</span>, then syncing in an effect. Use the prop directly or lift state up.</>,
  },
  {
    title: "Effect for derived values",
    body: <>Computing a value in an effect and storing it. Use <span style={m("")}>useMemo</span>.</>,
  },
  {
    title: "Effect for auto-selection",
    body: <>Setting <span style={m("")}>activeId</span> after mount via effect. Set it in the store&apos;s initial state.</>,
  },
  {
    title: "Uncleaned timers",
    body: <><span style={m("")}>setTimeout</span> in a component without a cleanup function. Always return a cleanup from <span style={m("")}>useEffect</span>.</>,
  },
  {
    title: "Hooks after early return",
    body: <>Calling <span style={m("")}>useEffect</span> below <span style={m("")}>if (!data) return null</span>. Hooks must run in the same order every render.</>,
  },
  {
    title: "Business logic in JSX",
    body: <><span style={m("")}>notes.filter(...).sort(...).map(...)</span> inside return. Extract to a memo or helper.</>,
  },
  {
    title: "Wide store reads",
    body: <><span style={m("")}>useStore((s) =&gt; s)</span> subscribes to every field. Select only what the component needs.</>,
  },
  {
    title: "Inline styles for layout",
    body: <>Hardcoded <span style={m("")}>{`style={{...}}`}</span> for layout. Use a class. Inline styles reserved for dynamic values (transforms, positions).</>,
  },
  {
    title: "SQL in handlers",
    body: <>Rust handlers should be &lt;20 lines and delegate to <span style={m("")}>db::</span> functions.</>,
  },
  {
    title: "HTTP types in db/",
    body: <>No <span style={m("")}>StatusCode</span>, <span style={m("")}>Json</span>, <span style={m("")}>Response</span> in db modules. db is HTTP-agnostic.</>,
  },
  {
    title: "Panics in request paths",
    body: <>No <span style={m("")}>.unwrap()</span>, <span style={m("")}>.expect()</span>, or panicky conversions in handlers. Use <span style={m("")}>?</span> and let <span style={m("")}>ApiError</span> carry it.</>,
  },
];

export default function AntiPatternsPage() {
  return (
    <>
      <h1>Common anti-patterns</h1>
      <p className="muted">Patterns that look reasonable but break things. Each entry names the trap and the right alternative.</p>

      <ul style={{ marginTop: 16 }}>
        {ITEMS.map((it) => (
          <li key={it.title} style={{ marginBottom: 8 }}>
            <b>{it.title}</b> &mdash; {it.body}
          </li>
        ))}
      </ul>
    </>
  );
}
