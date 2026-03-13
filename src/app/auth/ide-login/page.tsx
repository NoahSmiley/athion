"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { BrainLogo } from "@/components/brain-logo";

function IdeLoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("code");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(params.get("error") ? "Authentication failed. Please try again." : "");
  const [loading, setLoading] = useState(false);

  if (!code) {
    return (
      <p className="text-sm text-red-400 text-center">
        Invalid login link. Please try again from Liminal IDE.
      </p>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/ide/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/auth/ide-success");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-[590] text-3xl tracking-[-0.022em] text-center">
        Sign in to Liminal
      </h1>
      <p className="mt-2 text-sm text-foreground-muted text-center">
        Connect your Athion account to the IDE.
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
            className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
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
            className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in with Athion"}
        </button>
      </form>

      <p className="mt-6 text-sm text-foreground-muted text-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:text-foreground transition-colors">
          Sign up
        </Link>
      </p>

      <p className="mt-4 text-xs text-foreground-muted text-center">
        After signing in, you can close this tab and return to the IDE.
      </p>
    </>
  );
}

export default function IdeLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-10 flex items-center gap-2 text-foreground hover:text-accent transition-colors"
      >
        <BrainLogo size={28} />
        <span className="font-[590] text-lg tracking-[-0.022em]">Athion</span>
      </Link>
      <div className="w-full max-w-sm">
        <Suspense>
          <IdeLoginContent />
        </Suspense>
      </div>
    </div>
  );
}
