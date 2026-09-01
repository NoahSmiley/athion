"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeviceActions({ hash, revoked, label }: { hash: string; revoked: boolean; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/prime/devices/${hash}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const rename = async () => {
    const next = window.prompt("Name this TV (e.g. Living room)", label);
    if (next === null) return;
    await patch({ label: next });
  };

  const toggle = async () => {
    if (!revoked) {
      const ok = window.confirm("Sign this TV out? It will return to the pairing screen on its next check-in.");
      if (!ok) return;
    }
    await patch({ revoked: !revoked });
  };

  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <button type="button" onClick={rename} disabled={busy}
        style={{ fontFamily: "inherit", fontSize: 12, padding: "3px 8px", cursor: "pointer" }}>
        Name
      </button>
      <button type="button" onClick={toggle} disabled={busy}
        style={{ fontFamily: "inherit", fontSize: 12, padding: "3px 8px", cursor: "pointer" }}>
        {revoked ? "Reinstate" : "Revoke"}
      </button>
      {error && <span style={{ color: "#c44", fontSize: 12 }}>{error}</span>}
    </span>
  );
}
