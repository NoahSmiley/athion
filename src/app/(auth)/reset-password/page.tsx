"use client";

import { useState } from "react";
import Link from "next/link";

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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
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
        <h1 style={{ fontSize: 15, margin: "0 0 8px" }}>Check your email</h1>
        <p style={{ color: "#828282" }}>
          If an account exists for <strong>{email}</strong>, we sent a password reset link.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: 15, margin: "0 0 4px" }}>Reset password</h1>
      <p style={{ color: "#828282", marginBottom: 12 }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <p style={{ color: "#c44", marginBottom: 8 }}>{error}</p>
      )}

      <form onSubmit={handleReset}>
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
              <td />
              <td style={{ padding: "8px 0 0" }}>
                <button type="submit" disabled={loading}
                  style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <p style={{ marginTop: 16, color: "#828282" }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </>
  );
}
