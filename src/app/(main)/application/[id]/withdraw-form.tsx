"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WithdrawForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!window.confirm("Withdraw this application? You can apply again later but will start over.")) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/access-requests/${applicationId}/withdraw`, { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Couldn't withdraw");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span>
      <button onClick={submit} disabled={busy} style={{ padding: "4px 10px", fontSize: 11 }}>
        {busy ? "Withdrawing…" : "Withdraw application"}
      </button>
      {error && <span style={{ color: "#c44", fontSize: 11, marginLeft: 8 }}>{error}</span>}
    </span>
  );
}
