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

  const lnk = (href: string) => ({ color: pathname === href ? "#c8c8c8" : "#828282", textDecoration: "none" as const });

  return (
    <nav className="main-nav">
      <Link href="/" style={{ fontSize: 15, fontWeight: 500, textDecoration: "none", marginBottom: 8 }}>Athion</Link>
      <div className="main-nav-links">
        {links.map(([href, label]) => <Link key={href} href={href} style={lnk(href)}>{label}</Link>)}
        <span style={{ height: 12 }} />
        {user ? (
          <>
            <Link href="/dashboard" style={lnk("/dashboard")}>dashboard</Link>
            <button onClick={logout} style={{ background: "none", border: "none", color: "#828282", cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0, textAlign: "left" }}>logout</button>
          </>
        ) : (
          <Link href="/login" style={{ color: "#828282", textDecoration: "none" }}>login</Link>
        )}
      </div>
    </nav>
  );
}
