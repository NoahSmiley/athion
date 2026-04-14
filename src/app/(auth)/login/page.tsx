"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const target = redirectTo || "/dashboard";
      try {
        const url = new URL(target);
        if (url.hostname.endsWith(".athion.me")) {
          window.location.href = target;
          return;
        }
      } catch {}
      router.push(target);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 15, margin: "0 0 4px" }}>Sign in</h1>
      <p style={{ color: "#828282", marginBottom: 12 }}>Welcome back to Athion.</p>

      {error && (
        <p style={{ color: "#c44", marginBottom: 8 }}>{error}</p>
      )}

      <form onSubmit={handleLogin}>
        <table style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 8px 4px 0", verticalAlign: "top" }}>Email:</td>
              <td style={{ padding: "4px 0" }}>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: 240, fontFamily: "inherit", fontSize: 13, padding: "2px 4px" }} />
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 8px 4px 0", verticalAlign: "top" }}>Password:</td>
              <td style={{ padding: "4px 0" }}>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  style={{ width: 240, fontFamily: "inherit", fontSize: 13, padding: "2px 4px" }} />
                <br />
                <Link href="/reset-password" style={{ fontSize: 11, color: "#828282" }}>Forgot password?</Link>
              </td>
            </tr>
            <tr>
              <td />
              <td style={{ padding: "8px 0 0" }}>
                <button type="submit" disabled={loading}
                  style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <p style={{ marginTop: 16, color: "#828282" }}>
        Don&apos;t have an account? <Link href="/signup">Create one</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
