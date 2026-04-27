"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = params.get("code");
    if (c) setInviteCode(c);
  }, [params]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
      // Hard navigate so the navbar re-fetches /api/auth/me. router.push + refresh
      // doesn't re-mount the navbar's client useEffect, so the logged-in state
      // doesn't propagate to it.
      window.location.href = "/";
    } catch { setError("Something went wrong"); setLoading(false); }
  };

  return (
    <>
      <h1>Create account</h1>
      <p className="muted" style={{ marginTop: 4 }}>You need an invite code to sign up. <Link href="/request-access">Don&apos;t have one?</Link></p>
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {error && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Invite code</label>
          <input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Paste your invite code" style={{ ...input, fontFamily: "var(--font-mono)" }} />
        </div>
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Name</label>
          <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" style={input} />
        </div>
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
        </div>
        <div>
          <label className="muted" style={{ fontSize: 11 }}>Password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" style={input} />
        </div>
        <button type="submit" disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginTop: 4, alignSelf: "flex-start" }}>
          {loading ? "Creating account..." : "Create account"}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: 11 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </>
  );
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}
