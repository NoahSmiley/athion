import type { Metadata } from "next";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "State patterns" };

const HEADINGS = [
  { id: "auto-select", label: "Auto-selection on load" },
  { id: "debounced", label: "Debounced persistence" },
  { id: "memoized", label: "Memoized derivations" },
];

const codeStyle: React.CSSProperties = {
  background: "#111",
  padding: 12,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  overflow: "auto",
  border: "1px solid #2a2a2a",
};

export default function StatePatternsPage() {
  return (
    <>
      <h1>State management patterns</h1>
      <p className="muted">Reusable shapes for stores across any platform. Examples in TypeScript / Zustand; the principles transfer.</p>

      <Contents headings={HEADINGS} />

      <H2 id="auto-select">Auto-selection on load</H2>
      <p>Set <span style={{ fontFamily: "var(--font-mono)" }}>activeId</span> in the store&apos;s initial state, not via <span style={{ fontFamily: "var(--font-mono)" }}>useEffect</span>:</p>
      <pre style={codeStyle}>{`const initial = loadOrSeed();
export const useStore = create<State>((set) => ({
  items: initial,
  activeId: initial[0]?.id ?? null,
  // ...
}));`}</pre>
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Why: setting state in an effect causes a render with <span style={{ fontFamily: "var(--font-mono)" }}>activeId === null</span> first, then a second render with the correct id. UI flickers.</p>

      <H2 id="debounced">Debounced persistence</H2>
      <p>Coalesce rapid mutations into a single write. Module-level timer.</p>
      <pre style={codeStyle}>{`let saveTimer: ReturnType<typeof setTimeout> | null = null;
function save(data: Data) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
    saveTimer = null;
  }, 150);
}`}</pre>
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>150ms is the default. Tune higher for very large blobs.</p>

      <H2 id="memoized">Memoized derivations</H2>
      <p>Pull raw state, memoize transforms in the consumer:</p>
      <pre style={codeStyle}>{`const all = useNotes((s) => s.notes);
const search = useNotes((s) => s.search);
const filtered = useMemo(() => filterNotes(all, search), [all, search]);`}</pre>
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Never put <span style={{ fontFamily: "var(--font-mono)" }}>filter()/sort()</span> inside the store selector. The selector returns a new array each render and breaks memoization downstream.</p>
    </>
  );
}
