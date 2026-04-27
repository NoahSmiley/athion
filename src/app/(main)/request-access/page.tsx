"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "form" | "code" | "lookup";

export default function RequestAccessPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("form");

  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [vouchers, setVouchers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [appId, setAppId] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, github, vouchers }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Request failed");
      router.push(`/application/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const goToSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/signup?code=${encodeURIComponent(code.trim())}`);
  };

  const lookupApp = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const id = appId.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      setLookupError("That doesn't look like a valid application id.");
      return;
    }
    router.push(`/application/${id}`);
  };

  return (
    <div>
      <h1>Request access</h1>
      <p className="muted">Athion is invite-only. Every account is the result of a personal review.</p>

      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        {mode === "form" && (
          <>
            <a href="#" onClick={(e) => { e.preventDefault(); setMode("code"); }}>I have an invite code</a>
            <span style={{ color: "#444" }}>  ·  </span>
            <a href="#" onClick={(e) => { e.preventDefault(); setMode("lookup"); }}>Check existing application</a>
          </>
        )}
        {mode !== "form" && (
          <a href="#" onClick={(e) => { e.preventDefault(); setMode("form"); setLookupError(null); }}>← Back to new application</a>
        )}
      </p>

      {mode === "form" && (
        <form onSubmit={submit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#828282" }}>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#828282" }}>GitHub URL or username</span>
            <input type="text" required value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/yourname" />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#828282" }}>Vouchers (optional)</span>
            <input type="text" value={vouchers} onChange={(e) => setVouchers(e.target.value)} placeholder="@member1, @member2" />
          </label>

          {error && <p style={{ color: "#c66", fontSize: 12 }}>{error}</p>}

          <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", padding: "8px 16px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Submitting…" : "Request access"}
          </button>

          <p className="muted" style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>
            After you submit, you&apos;ll be taken to your application page. Bookmark it &mdash; that&apos;s how you check progress later. Most requests get a response within 7 days. Approved applicants are scheduled for a brief text interview before final approval.
          </p>
        </form>
      )}

      {mode === "code" && (
        <form onSubmit={goToSignup} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#828282" }}>Invite code</span>
            <input type="text" autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste invite code" style={{ fontFamily: "var(--font-mono)" }} />
          </label>
          <button type="submit" disabled={!code.trim()} style={{ alignSelf: "flex-start", padding: "8px 16px", opacity: code.trim() ? 1 : 0.5 }}>
            Continue to signup
          </button>
          <p className="muted" style={{ fontSize: 12 }}>
            A member sent you a code? Paste it here and create your account.
          </p>
        </form>
      )}

      {mode === "lookup" && (
        <form onSubmit={lookupApp} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#828282" }}>Application id</span>
            <input type="text" autoFocus value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" style={{ fontFamily: "var(--font-mono)" }} />
          </label>
          {lookupError && <p style={{ color: "#c66", fontSize: 12, margin: 0 }}>{lookupError}</p>}
          <button type="submit" disabled={!appId.trim()} style={{ alignSelf: "flex-start", padding: "8px 16px", opacity: appId.trim() ? 1 : 0.5 }}>
            Check status
          </button>
          <p className="muted" style={{ fontSize: 12 }}>
            Find the id at the bottom of your application page, or in the URL.
          </p>
        </form>
      )}
    </div>
  );
}
