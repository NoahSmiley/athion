"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
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
      <Link href="/" style={{ textDecoration: "none", marginBottom: 8, display: "block", color: "#fff" }}>
        <svg style={{ height: 17, width: "auto" }} viewBox="0 0 3109 1047" fill="none" xmlns="http://www.w3.org/2000/svg"><path transform="translate(0,952) scale(1,-1)" d="M282 700H426L699 0H572L509 163H193L130 0H4ZM467 271 351 573 234 271Z" fill="currentColor"/><path transform="translate(705,952) scale(1,-1)" d="M124 137V406H17V500H124V662H238V500H355V406H238V155Q238 123 250.5 110.5Q263 98 295 98H369V0H261Q194 0 159.0 35.5Q124 71 124 137Z" fill="currentColor"/><path transform="translate(1105,952) scale(1,-1)" d="M71 700H186V436Q208 470 247.0 490.5Q286 511 338 511Q420 511 468.5 459.5Q517 408 517 321V0H402V299Q402 353 378.5 382.5Q355 412 308 412H305Q253 412 219.5 372.5Q186 333 186 270V0H71Z" fill="currentColor"/><path transform="translate(1688,952) scale(1,-1)" d="M71 500H186V0H71ZM57 644Q57 674 78.0 694.5Q99 715 129 715Q158 715 179.0 694.5Q200 674 200 644Q200 615 179.0 594.0Q158 573 129 573Q99 573 78.0 594.0Q57 615 57 644Z" fill="currentColor"/><path transform="translate(1945,952) scale(1,-1)" d="M40 251Q40 324 73.0 383.5Q106 443 163.0 477.0Q220 511 291 511Q362 511 419.0 477.0Q476 443 508.5 384.0Q541 325 541 251Q541 177 508.5 117.0Q476 57 419.0 23.0Q362 -11 291 -11Q220 -11 163.0 23.0Q106 57 73.0 117.0Q40 177 40 251ZM425 251Q425 325 388.5 369.5Q352 414 293 414H287Q229 414 192.5 369.0Q156 324 156 251Q156 177 192.5 131.5Q229 86 287 86H293Q352 86 388.5 131.0Q425 176 425 251Z" fill="currentColor"/><path transform="translate(2526,952) scale(1,-1)" d="M71 500H186V438Q208 472 246.5 491.5Q285 511 335 511Q417 511 467.0 457.5Q517 404 517 316V0H402V293Q402 349 377.0 380.0Q352 411 304 411H302Q252 411 219.0 371.0Q186 331 186 268V0H71Z" fill="currentColor"/></svg>
      </Link>
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
