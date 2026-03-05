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
      <div className="text-center">
        <h1 className="font-serif text-3xl tracking-[-0.02em]">Check your email</h1>
        <p className="mt-4 text-sm text-foreground-muted">
          If an account exists for <span className="text-foreground">{email}</span>, we sent a password reset link.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-3xl tracking-[-0.02em] text-center">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-foreground-muted text-center">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="mt-6 p-3 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-8 text-sm text-foreground-muted text-center">
        <Link href="/login" className="text-accent hover:text-foreground transition-colors">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
