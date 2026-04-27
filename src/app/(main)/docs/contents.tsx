type Heading = { id: string; label: string };

export function Contents({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null;
  return (
    <div
      style={{
        margin: "16px 0 32px",
        padding: "12px 16px",
        border: "1px solid #1a1a1a",
        background: "#0a0a0a",
        fontSize: 12,
      }}
    >
      <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Contents
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {headings.map((h) => (
          <li key={h.id} style={{ marginBottom: 2 }}>
            <a href={`#${h.id}`} className="footer-link" style={{ color: "#828282" }}>
              {h.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper for h2 headings that get linked anchors. Renders a clickable hash that
// reveals on hover, copying the URL to clipboard.
export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="docs-h2" style={{ scrollMarginTop: 24 }}>
      <a href={`#${id}`} className="docs-h2-anchor">{children}</a>
    </h2>
  );
}
