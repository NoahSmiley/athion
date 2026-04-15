"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const apps: Record<string, { name: string; desc: string; hint: string }> = {
  flux: { name: "Flux", desc: "Connect your Athion account to Flux.", hint: "Invalid link. Try again from Flux." },
  liminal: { name: "Liminal", desc: "Connect your Athion account to the IDE.", hint: "Invalid link. Try again from Liminal IDE." },
  opendock: { name: "OpenDock", desc: "Connect your Athion account to OpenDock.", hint: "Invalid link. Try again from OpenDock." },
};

const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

function IdeLoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("code");
  const app = apps[params.get("app") ?? "liminal"] ?? apps.liminal;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(params.get("error") ? "Authentication failed." : "");
  const [loading, setLoading] = useState(false);

  if (!code) return <p style={{ color: "#c44" }}>{app.hint}</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/ide/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, code }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      router.push("/auth/ide-success");
    } catch { setError("Something went wrong"); setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ textAlign: "center", color: "#828282", margin: 0 }}>{app.desc}</p>
      {error && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
      <div><label className="muted" style={{ fontSize: 11 }}>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} /></div>
      <div><label className="muted" style={{ fontSize: 11 }}>Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={input} /></div>
      <button type="submit" disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginTop: 4 }}>{loading ? "Signing in..." : `Sign in to ${app.name}`}</button>
      <p className="muted" style={{ margin: 0, fontSize: 11, textAlign: "center" }}><Link href="/signup">Create account</Link></p>
    </form>
  );
}

export default function IdeLoginPage() {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      <div style={{ width: 260, pointerEvents: "auto" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#fff", fontSize: 15, fontWeight: 500, display: "block", marginBottom: 20 }}>Athion</Link>
        <Suspense><IdeLoginContent /></Suspense>
      </div>
    </div>
  );
}
