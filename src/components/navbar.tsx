"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NavUser = {
  id: string;
  username?: string | null;
  displayName?: string | null;
  role?: string | null;
};

function accountLabel(user: NavUser): string {
  const value = user.displayName ?? user.username ?? "Account";
  return value.length > 18 ? `${value.slice(0, 17)}…` : value;
}

export function Navbar({ initialUser = null }: { initialUser?: NavUser | null } = {}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      new BroadcastChannel("auth").postMessage("logout");
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <nav className="athion-nav-top" aria-label="Primary navigation">
      <Link href="/" className="wordmark">Athion</Link>

      <div className="nav-links">
        <a href="https://minecraft.athion.me" className="nav-link">Minecraft</a>
        <a href="https://prime.athion.me" className="nav-link">Prime</a>
        <a href="https://status.athion.me" className="nav-link">Status</a>

        {initialUser ? (
          <>
            <Link href="/settings" className="nav-link">{accountLabel(initialUser)}</Link>
            {(initialUser.role === "founder" || initialUser.role === "admin") && (
              <Link href="/invites" className="nav-link">Access codes</Link>
            )}
            {initialUser.role === "founder" && (
              <Link href="/admin/members" className="nav-link">Accounts</Link>
            )}
            <button type="button" className="nav-button" onClick={logout} disabled={busy}>
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </>
        ) : (
          <Link href="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
}
