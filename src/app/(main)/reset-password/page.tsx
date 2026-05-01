"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");
  return token ? <ConfirmForm token={token} /> : <RequestForm />;
}

function RequestForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError((await res.json()).error || "Something went wrong");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <h1>Check your email</h1>
        <p className="muted" style={{ marginTop: 4 }}>If an account exists for <b>{email}</b>, we sent a reset link. It expires in 1 hour.</p>
      </>
    );
  }

  return (
    <>
      <h1>Reset password</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
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

function ConfirmForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        setError((await res.json()).error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/login?reset=1");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Set a new password</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {error && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
        <div>
          <label className="muted" style={{ fontSize: 11 }}>New password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={input} />
        </div>
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Confirm new password</label>
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={input} />
        </div>
        <button type="submit" disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginTop: 4, alignSelf: "flex-start" }}>
          {loading ? "Saving..." : "Update password"}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: 11 }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </form>
    </>
  );
}
