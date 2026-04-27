import type { Metadata } from "next";

export const metadata: Metadata = { title: "Monorepo" };

export default function MonorepoPage() {
  return (
    <>
      <h1>Monorepo structure</h1>
      <p className="muted">How code is organized on disk across athion projects. One workspace, many apps.</p>

      <pre style={{ background: "#111", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto", border: "1px solid #2a2a2a", marginTop: 16 }}>{`apps/
  opendock/              React + Tauri desktop
    src/
      App.tsx            Shell composition
      main.tsx           Entry + CSS import
      types.ts           Cross-cutting types
      styles.css         Single CSS file with --a-* tokens
      components/        One component per file, PascalCase
      stores/            Zustand stores, one per domain
      hooks/             Shared hooks, use prefix
      lib/               Pure helpers, no app state
      api/               Network calls
  opendock-ios/          SwiftUI iOS
    OpenDock/
      OpenDockApp.swift  @main entry
      ContentView.swift  TabView shell
      Theme.swift        Color + font tokens
      *View.swift        One view per file
      *Store.swift       ObservableObject per domain
      *.swift            Models (structs)
  backend/               Rust API server
packages/
  shared/                Shared types, validation schemas
  style/                 CSS tokens + reset (used by web + Tauri)`}</pre>
    </>
  );
}
