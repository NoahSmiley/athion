"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Code = {
  id: string;
  code: string;
  usedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
  createdAt: string;
  usedByUser: { username: string | null; displayName: string | null } | null;
};

const SITE = typeof window === "undefined" ? "https://athion.me" : window.location.origin;

function statusLabel(c: Code): string {
  if (c.usedAt) return "used";
  if (c.revokedAt) return "revoked";
  if (new Date(c.expiresAt).getTime() < Date.now()) return "expired";
  return "active";
}

export function InvitesPanel({ initialCodes }: { initialCodes: Code[] }) {
  const router = useRouter();
  const [codes, setCodes] = useState(initialCodes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/invites", { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Couldn't generate code");
      router.refresh();
      // Optimistic: show the new code immediately by re-fetching
      const list = await fetch("/api/invites").then((r) => r.json());
      setCodes(list.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    if (!window.confirm("Revoke this code? It will no longer work.")) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/invites/${id}`, { method: "DELETE" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Couldn't revoke");
      const list = await fetch("/api/invites").then((r) => r.json());
      setCodes(list.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (c: Code) => {
    const url = `${SITE}/signup?code=${encodeURIComponent(c.code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId((v) => (v === c.id ? null : v)), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={generate} disabled={busy} style={{ padding: "6px 12px" }}>
          {busy ? "Generating…" : "Generate invite code"}
        </button>
        {error && <span style={{ color: "#c44", fontSize: 12 }}>{error}</span>}
      </div>

      <h2 style={{ marginTop: 32 }}>Issued codes</h2>
      {codes.length === 0 ? (
        <p className="muted">None yet.</p>
      ) : (
        <table className="mobile-cards">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Used by</th>
              <th>Expires</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const label = statusLabel(c);
              const expired = label === "expired";
              return (
                <tr key={c.id}>
                  <td data-label="Code" style={{ fontFamily: "var(--font-mono)" }}>{c.code}</td>
                  <td data-label="Status" className="muted">{label}</td>
                  <td data-label="Used by" className="muted">
                    {c.usedByUser ? c.usedByUser.displayName ?? `@${c.usedByUser.username ?? "?"}` : "—"}
                  </td>
                  <td data-label="Expires" className="muted" style={{ fontSize: 11 }}>{new Date(c.expiresAt).toLocaleDateString()}</td>
                  <td className="cell-actions">
                    {label === "active" && (
                      <>
                        <button onClick={() => copy(c)} style={{ padding: "2px 8px", fontSize: 11 }}>
                          {copiedId === c.id ? "copied" : "copy link"}
                        </button>
                        <button onClick={() => revoke(c.id)} style={{ padding: "2px 8px", fontSize: 11 }}>revoke</button>
                      </>
                    )}
                    {expired && <span className="muted" style={{ fontSize: 11 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
