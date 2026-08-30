"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const input = { width: "100%", fontFamily: "inherit", fontSize: 18, padding: "8px 10px", marginTop: 4, boxSizing: "border-box" as const, letterSpacing: "0.2em", textTransform: "uppercase" as const };

type Me = { username: string | null; displayName: string | null; email: string } | null;

function ActivateForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [me, setMe] = useState<Me | undefined>(undefined);
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [memberName, setMemberName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, []);

  const activate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setState("working");
    try {
      const res = await fetch("/api/prime/device/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.error === "code_expired" ? "That code has expired. Back out of the screen on your TV and try again for a fresh code."
          : data.error === "code_already_used" ? "That code was already used. Get a fresh one from your TV."
          : data.error === "unauthorized" ? "You need to sign in first."
          : "Something went wrong. Try again.";
        setError(msg);
        setState("idle");
        return;
      }
      setMemberName(String(data.memberName ?? ""));
      setState("done");
    } catch {
      setError("Something went wrong. Try again.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <>
        <h1>You&apos;re in</h1>
        <p style={{ marginTop: 16 }}>
          Your TV is signing in{memberName ? ` as ${memberName}` : ""} — look at the screen. You can close this page.
        </p>
      </>
    );
  }

  const loginHref = `/login?redirect=${encodeURIComponent(`/activate${code ? `?code=${code}` : ""}`)}`;

  return (
    <>
      <h1>Activate your TV</h1>
      <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
        Enter the code shown on your TV screen.
      </p>
      {me === null && (
        <p style={{ marginTop: 16 }}>
          <Link href={loginHref}>Sign in</Link> first, then come back here — or scan the QR on your TV again after signing in.
        </p>
      )}
      <form onSubmit={activate} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16, maxWidth: 320 }}>
        {error && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
        <div>
          <label className="muted" style={{ fontSize: 11 }}>TV code</label>
          <input
            required value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123" maxLength={6} autoFocus
            autoComplete="off" autoCapitalize="characters" style={input}
          />
        </div>
        <button
          type="submit" disabled={state === "working" || me === null || code.trim().length < 6}
          style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginTop: 4, alignSelf: "flex-start" }}
        >
          {state === "working" ? "Activating..." : "Activate"}
        </button>
      </form>
    </>
  );
}

export default function ActivatePage() {
  return <Suspense><ActivateForm /></Suspense>;
}
