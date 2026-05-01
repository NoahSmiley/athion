"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props { id: string; yanked: boolean }

export function ReleaseRowActions({ id, yanked }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleYank = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/opendock/releases/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yanked: !yanked }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  };

  const remove = async () => {
    if (!confirm("Delete this release? Artifacts will be unlinked. Files on disk are NOT removed.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/opendock/releases/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  };

  return (
    <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
      <button onClick={toggleYank} disabled={busy}>{yanked ? "Unyank" : "Yank"}</button>
      <button onClick={remove} disabled={busy} style={{ color: "#ff453a" }}>Delete</button>
    </div>
  );
}
