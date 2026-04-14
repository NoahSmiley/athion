"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

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
  opendock: {
    name: "OpenDock",
    description: "Connect your Athion account to OpenDock.",
    errorHint: "Invalid login link. Please try again from OpenDock.",
    returnText: "After signing in, you can close this tab and return to OpenDock.",
  },
};

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
    return <p style={{ color: "#c44" }}>{config.errorHint}</p>;
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
      <h1 style={{ fontSize: 15, margin: "0 0 4px", textAlign: "center" }}>
        Sign in to {config.name}
      </h1>
      <p style={{ color: "#828282", marginBottom: 12, textAlign: "center" }}>
        {config.description}
      </p>

      {error && <p style={{ color: "#c44", marginBottom: 8 }}>{error}</p>}

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
              </td>
            </tr>
            <tr>
              <td />
              <td style={{ padding: "8px 0 0" }}>
                <button type="submit" disabled={loading}
                  style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>
                  {loading ? "Signing in..." : "Sign in with Athion"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <p style={{ marginTop: 12, color: "#828282", textAlign: "center" }}>
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </p>
      <p style={{ marginTop: 8, color: "#828282", textAlign: "center", fontSize: 11 }}>
        {config.returnText}
      </p>
    </>
  );
}

export default function IdeLoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <Link href="/" style={{ marginBottom: 24, fontWeight: "bold", fontSize: 15, textDecoration: "none" }}>
        Athion
      </Link>
      <div style={{ width: "100%", maxWidth: 380, padding: 24, border: "1px solid #333", background: "#222" }}>
        <Suspense>
          <IdeLoginContent />
        </Suspense>
      </div>
    </div>
  );
}
