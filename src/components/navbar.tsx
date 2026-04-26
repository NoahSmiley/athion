"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { flushSync } from "react-dom";

const mainProductLinks = [
  ["/software", "Software"], ["/labs", "Labs"],
];
const mainLinks = [
  ["/pricing", "Pricing"], ["/about", "About"], ["/blog", "Blog"],
];

const labsLinks = [
  ["/labs/writing", "Writing"],
  ["/labs/demos", "Demos"],
  ["https://github.com/athion", "GitHub"],
  ["/", "← Athion"],
];

// Pending transition state — set on click, consumed by useLayoutEffect after pathname changes.
type Pending = { resolve: () => void } | null;

export function Navbar() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isLabs = pathname === "/labs" || pathname.startsWith("/labs/");
  const pendingRef = useRef<Pending>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user ?? null)).catch(() => {});
    const bc = new BroadcastChannel("auth");
    bc.onmessage = (e) => { if (e.data === "logout") setUser(null); else if (e.data?.type === "login") setUser(e.data.user); };
    return () => bc.close();
  }, []);

  // When pathname commits, if a transition is waiting, resolve it. The browser then
  // captures the new DOM and animates the morph. This is the only reliable way to
  // sync View Transitions with Next.js App Router navigations.
  useLayoutEffect(() => {
    if (pendingRef.current) {
      const { resolve } = pendingRef.current;
      pendingRef.current = null;
      resolve();
    }
  }, [pathname]);

  const navigate = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("http")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const targetIsLabs = href === "/labs" || href.startsWith("/labs/");
    const crossesLabsBoundary = isLabs !== targetIsLabs;
    if (!crossesLabsBoundary) return;
    e.preventDefault();

    const doc = document as Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void>; ready: Promise<void> } };
    if (typeof doc.startViewTransition !== "function") {
      router.push(href);
      return;
    }

    // Capture old state immediately (browser snapshots current DOM as the callback starts).
    // Inside the callback we kick off the navigation and wait for useLayoutEffect to resolve
    // once the new pathname has committed. flushSync ensures React paints synchronously when
    // it can. Errors (e.g. document hidden) get swallowed instead of crashing the page.
    const transition = doc.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        pendingRef.current = { resolve };
        flushSync(() => {
          router.push(href);
        });
      });
    });
    transition.finished?.catch(() => { pendingRef.current = null; });
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    new BroadcastChannel("auth").postMessage("logout");
    router.push("/");
    router.refresh();
  };

  const linkStyle = (href: string) => {
    if (href === "/") return undefined;
    if (href === "/labs") {
      return pathname === "/labs" ? { color: "#c8c8c8" } : undefined;
    }
    return pathname === href || pathname.startsWith(href + "/") ? { color: "#c8c8c8" } : undefined;
  };

  const labsMorphStyle = { viewTransitionName: "labs-morph" } as React.CSSProperties;

  const wordmark = isLabs ? (
    <Link
      href="/labs"
      onClick={navigate("/labs")}
      style={{ textDecoration: "none", color: "#fff", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span style={{ viewTransitionName: "athion-mark" } as React.CSSProperties}>Athion</span>
      <span
        className="labs-pill"
        style={{
          ...labsMorphStyle,
          background: "#fff",
          color: "#060606",
          padding: "2px 6px",
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1,
          borderRadius: 2,
          display: "inline-block",
        }}
      >
        Labs
      </span>
    </Link>
  ) : (
    <Link
      href="/"
      onClick={navigate("/")}
      style={{ textDecoration: "none", color: "#fff", fontWeight: 500 }}
    >
      <span style={{ viewTransitionName: "athion-mark" } as React.CSSProperties}>Athion</span>
    </Link>
  );

  return (
    <nav className="athion-nav-top" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, lineHeight: 1, padding: "0 24px", height: 24 }}>
      {wordmark}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {!isLabs && mainProductLinks.map(([href, label]) => {
          const isLabsLink = href === "/labs";
          return (
            <Link
              key={href}
              href={href}
              onClick={navigate(href)}
              className="nav-link"
              style={{ ...linkStyle(href), ...(isLabsLink ? labsMorphStyle : {}) }}
            >
              {label}
            </Link>
          );
        })}
        {!isLabs && mainLinks.map(([href, label]) => (
          <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={linkStyle(href)}>{label}</Link>
        ))}
        {isLabs && labsLinks.map(([href, label]) =>
          href.startsWith("http")
            ? <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="nav-link">{label}</a>
            : <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={linkStyle(href)}>{label}</Link>
        )}
        {user ? (
          <>
            <Link href="/dashboard" onClick={navigate("/dashboard")} className="nav-link" style={pathname.startsWith("/dashboard") ? { color: "#c8c8c8" } : undefined}>Dashboard</Link>
            <button onClick={logout} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1, fontFamily: "inherit", padding: 0 }}>Logout</button>
          </>
        ) : (
          <Link href="/login" onClick={navigate("/login")} className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
}
