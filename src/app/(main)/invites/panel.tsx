"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type State = {
  available: number;
  cap: number;
  cooldownActive: boolean;
  cooldownUntil: string | null;
  nextGrantAt: string | null;
  unlimited: boolean;
};

type Code = {
  id: string;
  code: string;
  usedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
  createdAt: string;
  usedByUser: { username: string | null; memberNumber: number; displayName: string | null } | null;
};

const SITE = typeof window === "undefined" ? "https://athion.me" : window.location.origin;

function statusLabel(c: Code): string {
  if (c.usedAt) return "used";
  if (c.revokedAt) return "revoked";
  if (new Date(c.expiresAt).getTime() < Date.now()) return "expired";
  return "active";
}

export function InvitesPanel({ initialState, initialCodes }: { initialState: State; initialCodes: Code[] }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
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
      setState(list.state);
      setCodes(list.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    if (!window.confirm("Revoke this code? It will be unusable. Your budget will be refunded.")) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/invites/${id}`, { method: "DELETE" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Couldn't revoke");
      const list = await fetch("/api/invites").then((r) => r.json());
      setState(list.state);
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

  const canGenerate = state.unlimited || (!state.cooldownActive && state.available > 0);

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Budget</h2>
      <p>
        {state.unlimited ? (
          <span>Unlimited (admin/founder).</span>
        ) : (
          <span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{state.available}</span> of <span style={{ fontFamily: "var(--font-mono)" }}>{state.cap}</span> available.
          </span>
        )}
      </p>
      {!state.unlimited && state.cooldownActive && state.cooldownUntil && (
        <p className="muted">In cooldown until {new Date(state.cooldownUntil).toLocaleDateString()}. New members can&apos;t invite for the first 30 days.</p>
      )}
      {!state.unlimited && !state.cooldownActive && state.nextGrantAt && state.available < state.cap && (
        <p className="muted">Next invite refills on {new Date(state.nextGrantAt).toLocaleDateString()}.</p>
      )}

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={generate} disabled={busy || !canGenerate} style={{ padding: "6px 12px", opacity: canGenerate && !busy ? 1 : 0.5 }}>
          {busy ? "Generating…" : "Generate invite code"}
        </button>
        {error && <span style={{ color: "#c44", fontSize: 12 }}>{error}</span>}
      </div>

      <h2 style={{ marginTop: 32 }}>Codes you&apos;ve issued</h2>
      {codes.length === 0 ? (
        <p className="muted">None yet.</p>
      ) : (
        <table>
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
                  <td style={{ fontFamily: "var(--font-mono)" }}>{c.code}</td>
                  <td className="muted">{label}</td>
                  <td className="muted">
                    {c.usedByUser ? (
                      <a href={c.usedByUser.username ? `/u/${c.usedByUser.username}` : "#"}>
                        <span style={{ fontFamily: "var(--font-mono)" }}>#{String(c.usedByUser.memberNumber).padStart(3, "0")}</span>{" "}
                        {c.usedByUser.displayName ?? `@${c.usedByUser.username ?? "?"}`}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="muted" style={{ fontSize: 11 }}>{new Date(c.expiresAt).toLocaleDateString()}</td>
                  <td>
                    {label === "active" && (
                      <span style={{ display: "inline-flex", gap: 6 }}>
                        <button onClick={() => copy(c)} style={{ padding: "2px 8px", fontSize: 11 }}>
                          {copiedId === c.id ? "copied" : "copy link"}
                        </button>
                        <button onClick={() => revoke(c.id)} style={{ padding: "2px 8px", fontSize: 11 }}>revoke</button>
                      </span>
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
