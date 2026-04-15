import type { Metadata } from "next";

export const metadata: Metadata = { title: "Design System" };

const colors = [
  ["--a-bg", "#060606", "Background"],
  ["--a-bg-elevated", "#0a0a0a", "Elevated surface"],
  ["--a-bg-input", "#111", "Input background"],
  ["--a-text", "#c8c8c8", "Primary text"],
  ["--a-text-muted", "#828282", "Muted text"],
  ["--a-text-faint", "#555", "Faint text"],
  ["--a-text-ghost", "#333", "Ghost text (footer)"],
  ["--a-text-active", "#fff", "Active / hover text"],
  ["--a-border", "#1a1a1a", "Border"],
  ["--a-border-strong", "#2a2a2a", "Input border"],
  ["--a-border-faint", "#333", "Table header border"],
  ["--a-error", "#c44", "Error"],
  ["--a-selection-bg", "#444", "Selection background"],
];

const weights = [
  ["300", "Light", "Rarely used. Long-form body text if needed."],
  ["400", "Regular", "Body text, descriptions, form labels."],
  ["500", "Medium", "Navigation, product names, subtle emphasis."],
  ["600", "Semibold", "Headings (h1, h2), logo wordmark, strong emphasis."],
  ["700", "Bold", "Inline bold text (<b>, <strong>)."],
];

export default function DesignPage() {
  return (
    <>
      <h1>Design System</h1>
      <p className="muted">Athion visual language. Used across all products.</p>

      <h2>Principles</h2>
      <ul>
        <li><b>Dark only</b> &mdash; no light mode. #060606 background, always.</li>
        <li><b>Utilitarian</b> &mdash; no gradients, no shadows, no rounded corners, no animations (except subtle fades).</li>
        <li><b>Information-dense</b> &mdash; 13px base, tight spacing, no decorative whitespace.</li>
        <li><b>Monochrome</b> &mdash; grayscale only. Color is reserved for errors and state.</li>
        <li><b>System-level</b> &mdash; feels like a terminal or IDE, not a marketing site.</li>
      </ul>

      <h2>Colors</h2>
      <table>
        <thead><tr><th>Token</th><th>Value</th><th>Usage</th><th>Swatch</th></tr></thead>
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
      <p>Font: <b>OpenAI Sans</b>. Monospace: <span style={{ fontFamily: "var(--font-mono)" }}>Courier New</span>.</p>
      <p>Base size: 13px. Line height: 1.6.</p>

      <table style={{ marginTop: 8 }}>
        <thead><tr><th>Weight</th><th>Name</th><th>Usage</th></tr></thead>
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

      <h2>Spacing</h2>
      <p className="muted">No spacing scale. Use values that feel right. General guidance:</p>
      <ul>
        <li>4px &mdash; tight gaps (between list items, inline elements)</li>
        <li>8px &mdash; standard padding (sidebar items, footer)</li>
        <li>16px &mdash; content padding, section gaps</li>
        <li>20-24px &mdash; section separation</li>
        <li>80px &mdash; fixed nav left offset</li>
      </ul>

      <h2>Borders</h2>
      <p className="muted">1px solid. No border-radius. Three tiers:</p>
      <ul>
        <li><b>#1a1a1a</b> &mdash; structural dividers (sidebar, panels)</li>
        <li><b>#2a2a2a</b> &mdash; input borders, table row separators</li>
        <li><b>#333</b> &mdash; table headers, subtle emphasis</li>
      </ul>

      <h2>Components</h2>

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

      <h2>Layout</h2>
      <p className="muted">Fixed sidebar nav on the left (80px from edge). Content centered in viewport. Footer fixed to bottom, barely visible (#333 text).</p>
      <ul>
        <li>Nav: fixed left, vertically centered, stacked links</li>
        <li>Content: max-width 700px, centered in remaining space</li>
        <li>Footer: fixed bottom, centered, ghost-colored links</li>
        <li>No scrolling on short pages. Content area scrolls internally on long pages.</li>
      </ul>

      <h2>Package</h2>
      <p className="muted">Install the shared style package:</p>
      <p style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>npm install @athion/style</p>
      <p className="muted" style={{ marginTop: 4 }}>Then import in your entry file:</p>
      <p style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>import &quot;@athion/style&quot;;</p>
      <p className="muted" style={{ marginTop: 8 }}>This gives you fonts, tokens (CSS variables), and the base reset. All tokens are prefixed with <span style={{ fontFamily: "var(--font-mono)" }}>--a-</span>.</p>
    </>
  );
}
