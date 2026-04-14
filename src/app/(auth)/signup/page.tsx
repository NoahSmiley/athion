"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 15, margin: "0 0 4px" }}>Create account</h1>
      <p style={{ color: "#828282", marginBottom: 12 }}>Get started with Athion.</p>

      {error && (
        <p style={{ color: "#c44", marginBottom: 8 }}>{error}</p>
      )}

      <form onSubmit={handleSignup}>
        <table style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 8px 4px 0", verticalAlign: "top" }}>Name:</td>
              <td style={{ padding: "4px 0" }}>
                <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  style={{ width: 240, fontFamily: "inherit", fontSize: 13, padding: "2px 4px" }} />
              </td>
            </tr>
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
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{ width: 240, fontFamily: "inherit", fontSize: 13, padding: "2px 4px" }} />
              </td>
            </tr>
            <tr>
              <td />
              <td style={{ padding: "8px 0 0" }}>
                <button type="submit" disabled={loading}
                  style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <p style={{ marginTop: 16, color: "#828282" }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
