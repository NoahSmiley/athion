"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "github" | "google") => {
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  return (
    <>
      <h1 className="font-serif text-3xl tracking-[-0.02em] text-center">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-foreground-muted text-center">
        Welcome back to Athion.
      </p>

      {error && (
        <div className="mt-6 p-3 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
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
        <div>
          <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full px-4 py-3 bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-foreground-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => handleOAuth("github")}
          className="w-full px-6 py-3 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-light transition-colors"
        >
          Continue with GitHub
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="w-full px-6 py-3 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-light transition-colors"
        >
          Continue with Google
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-sm text-foreground-muted">
        <Link href="/reset-password" className="hover:text-foreground transition-colors">
          Forgot your password?
        </Link>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:text-foreground transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
