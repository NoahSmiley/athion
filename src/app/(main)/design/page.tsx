import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Design System" };

const colors = [
  ["--a-bg", "#060606", "Background"],
  ["--a-bg-elevated", "#0a0a0a", "Elevated surface (sheets, modals)"],
  ["--a-bg-input", "#111", "Input background, search pills"],
  ["--a-text", "#c8c8c8", "Primary text"],
  ["--a-text-muted", "#828282", "Secondary text, back buttons"],
  ["--a-text-faint", "#555", "Tertiary text, metadata, timestamps"],
  ["--a-text-ghost", "#333", "Ghost text (footer, placeholders)"],
  ["--a-text-active", "#fff", "Active text, headings, selected items"],
  ["--a-border", "#1a1a1a", "Structural dividers"],
  ["--a-border-strong", "#2a2a2a", "Input borders, row separators"],
  ["--a-error", "#c44", "Destructive actions, errors"],
  ["--a-selection-bg", "#444", "Text selection background"],
];

const weights = [
  ["300", "Light", "Rarely used. Long-form body text if needed."],
  ["400", "Regular", "Body text, descriptions, previews, metadata."],
  ["500", "Medium", "Branding labels, navigation items, product names."],
  ["600", "Semibold", "Page titles, note titles, strong emphasis."],
  ["700", "Bold", "Inline bold text."],
];

export default function DesignPage() {
  return (
    <>
      <h1>Design System</h1>
      <p className="muted">Athion visual language. Used across all products and platforms.</p>

      <h2>Principles</h2>
      <ul>
        <li><b>Dark only</b> &mdash; no light mode. #060606 background, always.</li>
        <li><b>Utilitarian</b> &mdash; no gradients, no shadows, no animations (except subtle fades).</li>
        <li><b>Information-dense</b> &mdash; 13-14px base, tight spacing, no decorative whitespace.</li>
        <li><b>Monochrome</b> &mdash; grayscale only. No accent colors. Color is reserved for errors.</li>
        <li><b>No emoji</b> &mdash; use text symbols or system icons only.</li>
        <li><b>Cross-platform</b> &mdash; same visual language on web, desktop, iOS.</li>
      </ul>

      <h2>Colors</h2>
      <table>
        <thead><tr><th>Token</th><th>Value</th><th>Usage</th><th></th></tr></thead>
        <tbody>
          {colors.map(([token, hex, usage]) => (
            <tr key={token}>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{token}</td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{hex}</td>
              <td className="muted">{usage}</td>
              <td><div style={{ width: 24, height: 14, background: hex, border: "1px solid #333" }} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Typography</h2>
      <p>Font: <b>OpenAI Sans</b>. Monospace: <span style={{ fontFamily: "var(--font-mono)" }}>Menlo / Courier New</span>.</p>
      <table style={{ marginTop: 8 }}>
        <thead><tr><th>Weight</th><th>Sample</th><th>Usage</th></tr></thead>
        <tbody>
          {weights.map(([w, name, usage]) => (
            <tr key={w}>
              <td style={{ fontWeight: Number(w) }}>{w} {name}</td>
              <td style={{ fontWeight: Number(w) }}>The quick brown fox</td>
              <td className="muted">{usage}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>App Branding</h2>
      <p className="muted">Every Athion app shows the product hierarchy: parent brand above tool name.</p>
      <ul>
        <li><b>Brand label</b> &mdash; &quot;OpenDock&quot; in 12-13px medium weight, faint color (#555).</li>
        <li><b>Tool title</b> &mdash; &quot;Notes&quot; / &quot;Boards&quot; / &quot;Calendar&quot; in 20-28px semibold, white.</li>
        <li><b>Hierarchy</b> &mdash; brand label sits directly above the tool title, left-aligned.</li>
      </ul>

      <h2>Search</h2>
      <p className="muted">All search inputs use the pill style:</p>
      <ul>
        <li>Background: #111 (--a-bg-input)</li>
        <li>Border-radius: 8-10px</li>
        <li>Padding: 8-12px</li>
        <li>Placeholder: ghost color (#333)</li>
        <li>No border. No outline on focus &mdash; subtle box-shadow or border-color change only.</li>
      </ul>

      <h2>Borders</h2>
      <ul>
        <li><b>#1a1a1a</b> &mdash; structural dividers (sidebar, panels, nav)</li>
        <li><b>#2a2a2a</b> &mdash; row separators, input borders</li>
        <li><b>#333</b> &mdash; table headers, subtle emphasis</li>
        <li>Border-radius: 0px on web, 8-10px on iOS inputs/search/cards</li>
      </ul>

      <h2>Platform Guidelines</h2>

      <p style={{ marginTop: 8 }}><b>Web (Next.js / athion.me)</b></p>
      <ul>
        <li>Font: OpenAI Sans via @font-face (woff2)</li>
        <li>Base size: 13px, line-height 1.6</li>
        <li>Layout: fixed sidebar nav, centered content, fixed footer</li>
        <li>No border-radius on any element</li>
        <li>Inline styles preferred over Tailwind utility classes</li>
        <li>CSS tokens: --a-* prefix from @athion/style</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Desktop (Tauri + React)</b></p>
      <ul>
        <li>Font: OpenAI Sans via @font-face (woff2)</li>
        <li>Base size: 14px, line-height 1.5</li>
        <li>Layout: narrow nav rail (140px) + tool list (280px) + content area</li>
        <li>Nav rail: horizontal text, not rotated. Brand label at top, tool links below.</li>
        <li>Search: pill style with #111 background, 8px border-radius</li>
        <li>CSS tokens: --a-* prefix, same values as web</li>
        <li>-webkit-app-region: drag on headers/titlebars for frameless windows</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>iOS (SwiftUI)</b></p>
      <ul>
        <li>Font: OpenAI Sans via TTF in bundle (registered in Info.plist UIAppFonts)</li>
        <li>Font names: OpenAISans-Regular, OpenAISans-Medium, OpenAISans-Semibold</li>
        <li>Base size: 14-16px depending on context</li>
        <li>Layout: custom headers (no default NavigationBar chrome), native TabView for tools</li>
        <li>Colors: defined in Theme.swift enum, matching --a-* token values exactly</li>
        <li>Search: custom pill (HStack with TextField), not .searchable modifier</li>
        <li>Border-radius: 8-10px on inputs, search pills, cards</li>
        <li>Use .scrollContentBackground(.hidden) to remove default list backgrounds</li>
        <li>Use .navigationBarHidden(true) for custom headers</li>
        <li>Tab bar: UITabBarAppearance with bg=#060606, ghost inactive, white active</li>
        <li>Swipe actions and context menus use native iOS patterns</li>
      </ul>

      <h2>Component Patterns</h2>

      <p style={{ marginTop: 8 }}><b>Buttons</b></p>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button style={{ padding: "6px 16px" }}>Default</button>
        <button style={{ padding: "6px 16px", background: "#c8c8c8", color: "#060606", border: "1px solid #c8c8c8" }}>Primary</button>
        <button style={{ padding: "6px 16px", color: "#c44", borderColor: "#c44" }}>Danger</button>
      </div>

      <p style={{ marginTop: 16 }}><b>Inputs</b></p>
      <div style={{ display: "flex", gap: 12, marginTop: 8, maxWidth: 400 }}>
        <input placeholder="Text input" style={{ flex: 1, padding: "6px 8px" }} />
      </div>

      <p style={{ marginTop: 16 }}><b>Links</b></p>
      <p style={{ marginTop: 4 }}>
        <a href="#">Default link</a> &middot;{" "}
        <span className="muted">Muted text with <a href="#">inline link</a></span>
      </p>

      <h2>Package</h2>
      <p className="muted">Shared CSS package for web and Tauri apps:</p>
      <p style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>import &quot;@athion/style&quot;;</p>
      <p className="muted" style={{ marginTop: 8 }}>Provides: fonts.css (OpenAI Sans @font-face), tokens.css (--a-* variables), reset.css (base styles).</p>
      <p className="muted" style={{ marginTop: 4 }}>For SwiftUI, use Theme.swift with matching Color values. No shared package &mdash; colors are defined in code.</p>

      <h2>Dev Guidelines</h2>
      <p className="muted">File size limits, naming, and code standards for each platform.</p>
      <p style={{ marginTop: 4 }}><Link href="/design/dev">View dev guidelines</Link></p>

      <h2>Architecture Guidelines</h2>
      <p className="muted">State management patterns, layer model, and common anti-patterns.</p>
      <p style={{ marginTop: 4 }}><Link href="/design/architecture">View architecture guidelines</Link></p>

      <h2>Repository Guidelines</h2>
      <p className="muted">Branching, commits, pull requests, and Git hygiene across Athion repos.</p>
      <p style={{ marginTop: 4 }}><Link href="/design/repository">View repository guidelines</Link></p>
    </>
  );
}
