import type { Metadata } from "next";
import Link from "next/link";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "Tauri" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "store", label: "Store shape" },
  { id: "components", label: "Component rules" },
  { id: "selectors", label: "Selector patterns" },
  { id: "drag", label: "Drag, drop, pointer events" },
];

const m = { fontFamily: "var(--font-mono)" } as const;

export default function TauriStackPage() {
  return (
    <>
      <h1>Tauri</h1>
      <p className="muted">Tauri-specific guidance for athion desktop apps. React + Tauri shell, Zustand for state, native primitives for everything else. Universal React patterns live in <Link href="/docs/stacks/react">React</Link>.</p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <ul>
        <li>Tauri 2.x for the shell. No Electron.</li>
        <li>Vite + React for the renderer. Functional components only.</li>
        <li>Zustand for state. No Redux, MobX, Recoil.</li>
        <li>Native primitives via Tauri commands when crossing the JS/Rust boundary.</li>
        <li>Single CSS file with <span style={m}>--a-*</span> tokens (from <span style={m}>@athion/style</span>).</li>
      </ul>

      <H2 id="store">Store shape</H2>
      <ul>
        <li>One <span style={m}>create&lt;State&gt;()</span> call per domain. No slice composition.</li>
        <li>State and actions defined in the same interface. Selectors are inline in components.</li>
        <li>Initial state computed at module load. Default selections (<span style={m}>activeId</span>) set from initial data, not via <span style={m}>useEffect</span>.</li>
        <li>Mutations follow the pattern: derive next state &rarr; save &rarr; set. Never <span style={m}>set()</span> then <span style={m}>save()</span>.</li>
        <li>Persistence is debounced at the module level. 150ms default.</li>
        <li>No computed selectors as methods. <span style={m}>filtered()</span> on the store returns a new array every render. Use <span style={m}>useMemo</span> in the consumer.</li>
      </ul>

      <H2 id="components">Component rules</H2>
      <ul>
        <li>Props interface named <span style={m}>ComponentNameProps</span>. No <span style={m}>Props</span> shorthand.</li>
        <li>Destructure props at the signature. Avoid <span style={m}>props.foo</span> inside the body.</li>
        <li>Callback props wrapped in <span style={m}>useCallback</span> at the parent when passed to memoized children.</li>
        <li>Expensive derivations wrapped in <span style={m}>useMemo</span>. Cheap ones inlined.</li>
        <li>Early returns before hook calls are forbidden. Hooks must run in the same order every render.</li>
        <li>Effects clean up on unmount. Timers, listeners, subscriptions &mdash; all need a cleanup function.</li>
      </ul>

      <H2 id="selectors">Selector patterns</H2>
      <ul>
        <li>Select primitives or stable references. <span style={m}>s.activeId</span> &mdash; good. <span style={m}>s.boards.filter(...)</span> &mdash; new array, re-renders every update.</li>
        <li>To derive: pull the raw array, memoize in the component.</li>
        <li>When multiple fields are needed together, use separate <span style={m}>useStore</span> calls or <span style={m}>useShallow</span>.</li>
      </ul>

      <H2 id="drag">Drag, drop, pointer events</H2>
      <ul>
        <li>Use pointer events (<span style={m}>pointerdown</span> / <span style={m}>pointermove</span> / <span style={m}>pointerup</span>) for drag. Not HTML5 <span style={m}>draggable</span>.</li>
        <li>Drag state in refs, not state. Drag moves at 60fps &mdash; React re-renders every frame kill performance.</li>
        <li>Update the drag ghost via direct DOM manipulation. Use <span style={m}>data-*</span> attributes for drop targets. Update classes imperatively during drag.</li>
        <li>Commit to the store only on drop. Intermediate hover state never touches React.</li>
      </ul>
    </>
  );
}
