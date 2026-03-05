"use client";

import { useState } from "react";

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="px-6 py-3 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-light transition-colors disabled:opacity-50"
    >
      {loading ? "Opening..." : "Manage in Stripe"}
    </button>
  );
}
