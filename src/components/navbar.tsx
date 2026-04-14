"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  ["/flux", "Flux"], ["/opendock", "OpenDock"], ["/ide", "IDE"], ["/hosting", "Hosting"],
  ["/pricing", "Pricing"], ["/about", "About"], ["/contact", "Contact"],
];

export function Navbar() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user ?? null)).catch(() => {});
    const bc = new BroadcastChannel("auth");
    bc.onmessage = (e) => { if (e.data === "logout") setUser(null); else if (e.data?.type === "login") setUser(e.data.user); };
    return () => bc.close();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    new BroadcastChannel("auth").postMessage("logout");
    router.push("/");
    router.refresh();
  };

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
      <Link href="/" style={{ fontSize: 15, fontWeight: 500, textDecoration: "none", marginBottom: 8 }}>Athion</Link>
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="nav-link" style={pathname === href ? { color: "#c8c8c8" } : undefined}>{label}</Link>
      ))}
      <span style={{ height: 12 }} />
      {user ? (
        <>
          <Link href="/dashboard" className="nav-link" style={pathname.startsWith("/dashboard") ? { color: "#c8c8c8" } : undefined}>dashboard</Link>
          <button onClick={logout} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0, textAlign: "left" }}>logout</button>
        </>
      ) : (
        <Link href="/login" className="nav-link">login</Link>
      )}
    </nav>
  );
}
