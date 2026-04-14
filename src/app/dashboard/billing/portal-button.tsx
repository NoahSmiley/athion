"use client";

import { useState } from "react";

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/portal", { method: "POST" }).then((r) => r.json());
      if (d.url) window.location.href = d.url;
    } catch {} finally { setLoading(false); }
  };

  return (
    <button onClick={handle} disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>
      {loading ? "Opening..." : "Manage in Stripe"}
    </button>
  );
}
