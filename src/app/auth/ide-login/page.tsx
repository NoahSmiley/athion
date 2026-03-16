"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { BrainLogo } from "@/components/brain-logo";

const APP_CONFIG: Record<string, { name: string; description: string; errorHint: string; returnText: string }> = {
  flux: {
    name: "Flux",
    description: "Connect your Athion account to Flux.",
    errorHint: "Invalid login link. Please try again from Flux.",
    returnText: "After signing in, you can close this tab and return to Flux.",
  },
  liminal: {
    name: "Liminal",
    description: "Connect your Athion account to the IDE.",
    errorHint: "Invalid login link. Please try again from Liminal IDE.",
    returnText: "After signing in, you can close this tab and return to the IDE.",
  },
};

function FluxLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="180" ry="180" fill="#111111" />
      <g transform="translate(512,512) scale(7.5)" fill="#ffffff" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 -24a24 24 0 1 0 0 48a24 24 0 1 0 0-48zm0 10a14 14 0 1 1 0 28a14 14 0 1 1 0-28z" fillRule="evenodd" stroke="none" />
        <line x1="18" y1="-18" x2="30" y2="-30" strokeWidth="3.5" fill="none" />
        <polygon points="24,-32 32,-32 32,-24" stroke="none" />
        <line x1="-18" y1="18" x2="-30" y2="30" strokeWidth="3.5" fill="none" />
        <polygon points="-32,24 -32,32 -24,32" stroke="none" />
      </g>
    </svg>
  );
}

function IdeLoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("code");
  const appParam = params.get("app") ?? "liminal";
  const config = APP_CONFIG[appParam] ?? APP_CONFIG.liminal;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(params.get("error") ? "Authentication failed. Please try again." : "");
  const [loading, setLoading] = useState(false);

  if (!code) {
    return (
      <p className="text-sm text-red-400 text-center">
        {config.errorHint}
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
        Sign in to {config.name}
      </h1>
      <p className="mt-2 text-sm text-foreground-muted text-center">
        {config.description}
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
        {config.returnText}
      </p>
    </>
  );
}

export default function IdeLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <Suspense>
        <IdeLoginBranding />
      </Suspense>
      <div className="w-full max-w-sm">
        <Suspense>
          <IdeLoginContent />
        </Suspense>
      </div>
    </div>
  );
}

function IdeLoginBranding() {
  const params = useSearchParams();
  const appParam = params.get("app") ?? "liminal";
  const isFlux = appParam === "flux";

  return (
    <Link
      href="/"
      className="mb-10 flex items-center gap-2 text-foreground hover:text-accent transition-colors"
    >
      {isFlux ? <FluxLogo size={28} /> : <BrainLogo size={28} />}
      <span className="font-[590] text-lg tracking-[-0.022em]">
        {isFlux ? "Flux" : "Athion"}
      </span>
    </Link>
  );
}
