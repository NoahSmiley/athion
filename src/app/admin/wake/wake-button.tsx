"use client";

import { useState } from "react";

export function WakeButton({ target }: { target: string }) {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");

  const wake = async () => {
    setState("busy");
    try {
      const r = await fetch("/api/admin/wake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      setState(r.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <button type="button" onClick={wake} disabled={state === "busy"}
        style={{ fontFamily: "inherit", fontSize: 12, padding: "3px 10px", cursor: "pointer" }}>
        Wake
      </button>
      {state === "sent" && <span style={{ fontSize: 12 }}>Signal sent. Give it a minute to boot.</span>}
      {state === "error" && <span style={{ color: "#c44", fontSize: 12 }}>Could not send the signal</span>}
    </span>
  );
}
