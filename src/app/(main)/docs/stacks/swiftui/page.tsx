import type { Metadata } from "next";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "SwiftUI" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "stores", label: "Stores" },
  { id: "models", label: "Models" },
  { id: "navigation", label: "Navigation" },
  { id: "presentation", label: "Sheets and alerts" },
];

const m = { fontFamily: "var(--font-mono)" } as const;

export default function SwiftUIStackPage() {
  return (
    <>
      <h1>SwiftUI</h1>
      <p className="muted">iOS apps use SwiftUI. ObservableObject for state, native patterns, no UIKit unless SwiftUI has no equivalent.</p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <ul>
        <li>SwiftUI for views. UIKit only when SwiftUI lacks an equivalent (rare).</li>
        <li><span style={m}>ObservableObject</span> for stores, marked <span style={m}>@MainActor</span> at the class level.</li>
        <li><span style={m}>@Published</span> only fields that views observe.</li>
        <li>Stores injected via <span style={m}>@EnvironmentObject</span>. Never instantiated inside views.</li>
      </ul>

      <H2 id="stores">Stores</H2>
      <ul>
        <li>One <span style={m}>ObservableObject</span> class per domain. Lives in <span style={m}>*Store.swift</span>.</li>
        <li>Marked <span style={m}>@MainActor</span> at the class level. Mutations always on main.</li>
        <li>Stores injected via <span style={m}>@EnvironmentObject</span>. Never <span style={m}>StateObject</span> inside views (unless owning a transient sub-store).</li>
        <li>No computed properties that do heavy work. <span style={m}>var filtered: [Note]</span> that calls <span style={m}>notes.filter(...)</span> runs on every view access. Cache with <span style={m}>didSet</span> or use <span style={m}>@Published var filtered</span>.</li>
      </ul>

      <H2 id="models">Models</H2>
      <ul>
        <li>Value-type structs conforming to <span style={m}>Identifiable, Codable, Equatable</span>.</li>
        <li>One model per file. No <span style={m}>Models.swift</span> dumping ground.</li>
        <li>No reference types for domain models. Use classes only for stores.</li>
      </ul>

      <H2 id="navigation">Navigation</H2>
      <ul>
        <li>Navigation state in a <span style={m}>@State</span> <span style={m}>NavigationPath</span> at the shell level.</li>
        <li>Push via <span style={m}>path.append(id)</span>. Pop via <span style={m}>path.removeLast()</span>.</li>
        <li>Deep links go through the shell&apos;s path, never directly into a child view.</li>
      </ul>

      <H2 id="presentation">Sheets and alerts</H2>
      <ul>
        <li>Confirmation dialogs use <span style={m}>.alert</span>. Sheets use <span style={m}>.sheet</span>.</li>
        <li>Do not reinvent &mdash; SwiftUI&apos;s primitives handle keyboard, accessibility, dynamic type.</li>
        <li>Bind presentation to a <span style={m}>@State Bool</span> at the parent, not via a published store field (unless multiple views observe).</li>
      </ul>
    </>
  );
}
