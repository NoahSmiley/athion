"use client";

import { AsciiVariant } from "./ascii";

export default function ProcessPage() {
  return (
    <div>
      <h1>How to join</h1>
      <p className="muted">Athion is invite-only. Five steps. Each one happens to a real person on the other side.</p>

      <div style={{ marginTop: 24 }}>
        <AsciiVariant />
      </div>

      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "flex-end" }}>
        <a href="/request-access" className="nav-link">Apply →</a>
      </div>
    </div>
  );
}
