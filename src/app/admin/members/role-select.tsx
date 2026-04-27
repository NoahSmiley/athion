"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["founder", "admin", "member"] as const;

export function RoleSelect({ userId, role, isSelf }: { userId: string; role: string; isSelf: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (next === current) return;
    if (isSelf && next !== "founder") {
      const ok = window.confirm("This will demote yourself. You won't be able to access this page after. Continue?");
      if (!ok) return;
    }
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed");
      setCurrent(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
      <select value={current} onChange={onChange} disabled={saving} style={{ padding: "2px 6px", fontSize: 12 }}>
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      {error && <span style={{ color: "#c44", fontSize: 11 }}>{error}</span>}
    </div>
  );
}
