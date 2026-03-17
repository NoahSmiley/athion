"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
      <h1 className="font-[590] text-2xl tracking-[-0.022em]">
        Create account
      </h1>
      <p className="mt-1.5 text-[0.8125rem] text-foreground-muted/60">
        Get started with Athion.
      </p>

      {error && (
        <div className="mt-5 px-3 py-2.5 border border-red-500/20 bg-red-500/5 rounded-lg text-[0.8125rem] text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="mt-7 flex flex-col gap-5">
        <div>
          <label className="block text-[0.6875rem] text-foreground-muted/50 uppercase tracking-[0.06em] font-medium mb-2">
            Display Name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3.5 py-2.5 bg-transparent border border-white/[0.08] rounded-lg text-sm text-foreground placeholder:text-foreground-muted/30 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[0.6875rem] text-foreground-muted/50 uppercase tracking-[0.06em] font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 bg-transparent border border-white/[0.08] rounded-lg text-sm text-foreground placeholder:text-foreground-muted/30 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[0.6875rem] text-foreground-muted/50 uppercase tracking-[0.06em] font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full px-3.5 py-2.5 bg-transparent border border-white/[0.08] rounded-lg text-sm text-foreground placeholder:text-foreground-muted/30 focus:outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-[#111] text-sm font-[510] rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
          {!loading && <ArrowRight size={14} />}
        </button>
      </form>

      <div className="mt-7 pt-5 border-t border-white/[0.06] text-center">
        <p className="text-[0.8125rem] text-foreground-muted/50">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:text-accent transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
