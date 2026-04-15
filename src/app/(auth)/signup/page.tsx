"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, displayName }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
      router.push("/dashboard");
      router.refresh();
    } catch { setError("Something went wrong"); setLoading(false); }
  };

  return (
    <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
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
      <button type="submit" disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginTop: 4 }}>
        {loading ? "Creating account..." : "Create account"}
      </button>
      <p className="muted" style={{ margin: 0, fontSize: 11 }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
