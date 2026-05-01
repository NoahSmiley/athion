"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const justReset = searchParams.get("reset") === "1";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      const target = redirectTo || "/";
      try { const url = new URL(target); if (url.hostname.endsWith(".athion.me")) { window.location.href = target; return; } } catch {}
      // Hard navigate so the navbar (client component) re-fetches /api/auth/me.
      window.location.href = target;
    } catch { setError("Something went wrong"); setLoading(false); }
  };

  return (
    <>
      <h1>Sign in</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {justReset && !error && <p className="muted" style={{ margin: 0 }}>Password updated. Sign in with your new password.</p>}
        {error && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
        </div>
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={input} />
        </div>
        <button type="submit" disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginTop: 4, alignSelf: "flex-start" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: 11 }}>
          <Link href="/reset-password">Forgot password?</Link> &middot; <Link href="/request-access">Request access</Link>
        </p>
      </form>
    </>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
