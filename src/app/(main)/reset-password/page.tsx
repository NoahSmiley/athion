"use client";

import { useState } from "react";
import Link from "next/link";

const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) { setError((await res.json()).error || "Something went wrong"); setLoading(false); return; }
      setSuccess(true);
      setLoading(false);
    } catch { setError("Something went wrong"); setLoading(false); }
  };

  if (success) {
    return (
      <>
        <h1>Check your email</h1>
        <p className="muted" style={{ marginTop: 4 }}>If an account exists for <b>{email}</b>, we sent a reset link.</p>
      </>
    );
  }

  return (
    <>
      <h1>Reset password</h1>
      <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {error && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
        </div>
        <button type="submit" disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginTop: 4, alignSelf: "flex-start" }}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: 11 }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </form>
    </>
  );
}
