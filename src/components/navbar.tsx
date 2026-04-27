"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useLayoutEffect, Suspense } from "react";
import { flushSync } from "react-dom";

const mainProductLinks = [
  ["/software", "Software"], ["/labs", "Labs"],
];
const mainLinks = [
  ["/invites", "Invites"], ["/docs", "Docs"], ["/about", "About"], ["/blog", "Blog"],
];

const labsLinks = [
  ["/labs/writing", "Writing"],
  ["/labs/demos", "Demos"],
];

// Variant A — conservative trim. 5 items + user menu.
const A_LINKS = [
  ["/software", "Software"], ["/labs", "Labs"], ["/docs", "Docs"], ["/invites", "Invites"], ["/blog", "Blog"],
];

// Variant B — grouped. 3 sections + user menu, each with a sub-row.
const B_TOP = [
  ["/make", "Make"], ["/read", "Read"], ["/community", "Community"],
];
const B_SUB: Record<string, [string, string][]> = {
  make: [["/software", "Software"], ["/labs", "Labs"], ["/docs", "Docs"]],
  read: [["/about", "About"], ["/blog", "Blog"]],
  community: [["/invites", "Invites"]], // /members coming later
};

type Pending = { resolve: () => void } | null;

function navVariantFromQuery(sp: URLSearchParams | null, stored: string | null): "default" | "a" | "b" {
  const q = sp?.get("nav");
  if (q === "a" || q === "b" || q === "default") return q as "default" | "a" | "b";
  if (stored === "a" || stored === "b" || stored === "default") return stored;
  return "default";
}

export function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarInner />
    </Suspense>
  );
}

function NavbarInner() {
  const [user, setUser] = useState<{ id: string; username?: string | null; displayName?: string | null } | null>(null);
  const [variant, setVariant] = useState<"default" | "a" | "b">("default");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLabs = pathname === "/labs" || pathname.startsWith("/labs/");
  const pendingRef = useRef<Pending>(null);

  // Variant resolution: ?nav=a|b|default wins, else stored, else default.
  // Persist any explicit query param so toggling once sticks across pages.
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem("athion-nav"); } catch {}
    const q = searchParams?.get("nav");
    if (q === "a" || q === "b" || q === "default") {
      try { localStorage.setItem("athion-nav", q); } catch {}
      setVariant(q);
    } else {
      setVariant(navVariantFromQuery(null, stored));
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user ?? null)).catch(() => {});
    const bc = new BroadcastChannel("auth");
    bc.onmessage = (e) => { if (e.data === "logout") setUser(null); else if (e.data?.type === "login") setUser(e.data.user); };
    return () => bc.close();
  }, []);

  // Close the user menu on any pathname change
  useEffect(() => { setUserMenuOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.(".user-menu")) setUserMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [userMenuOpen]);

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
    const transition = doc.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        pendingRef.current = { resolve };
        flushSync(() => { router.push(href); });
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
    if (href === "/labs") return pathname === "/labs" ? { color: "#c8c8c8" } : undefined;
    return pathname === href || pathname.startsWith(href + "/") ? { color: "#c8c8c8" } : undefined;
  };

  const labsMorphStyle = { viewTransitionName: "labs-morph" } as React.CSSProperties;

  const wordmark = isLabs ? (
    <Link href="/" onClick={navigate("/")} style={{ textDecoration: "none", color: "#fff", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span aria-hidden="true" style={{ color: "#828282" }}>←</span>
      <span style={{ viewTransitionName: "athion-mark" } as React.CSSProperties}>Athion</span>
      <span className="labs-pill" style={{ ...labsMorphStyle, background: "#fff", color: "#060606", padding: "2px 6px", fontSize: 11, fontWeight: 500, lineHeight: 1, borderRadius: 2, display: "inline-block" }}>Labs</span>
    </Link>
  ) : (
    <Link href="/" onClick={navigate("/")} style={{ textDecoration: "none", color: "#fff", fontWeight: 500 }}>
      <span style={{ viewTransitionName: "athion-mark" } as React.CSSProperties}>Athion</span>
    </Link>
  );

  // Active section for variant B: which top-level group does this pathname belong to?
  const bGroup = (() => {
    for (const [key, items] of Object.entries(B_SUB)) {
      if (items.some(([href]) => pathname === href || pathname.startsWith(href + "/"))) return key;
    }
    return null;
  })();

  // User menu (compact). Renders the name as a button; clicking toggles a small panel
  // with profile / settings / logout. Used in variants A and B.
  const userMenu = user ? (
    <div className="user-menu" style={{ position: "relative" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}
        className="nav-link"
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1, fontFamily: "inherit", padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        {user.displayName ?? (user.username ? `@${user.username}` : "Account")}
        <span aria-hidden="true" style={{ fontSize: 9 }}>▾</span>
      </button>
      {userMenuOpen && (
        <div
          role="menu"
          style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            background: "#0a0a0a", border: "1px solid #2a2a2a",
            minWidth: 160, padding: 6, fontSize: 12, zIndex: 20,
            display: "flex", flexDirection: "column", gap: 0,
          }}
        >
          {user.username && (
            <Link href={`/u/${user.username}`} className="nav-link" style={{ padding: "6px 10px" }}>Profile</Link>
          )}
          <Link href="/settings" className="nav-link" style={{ padding: "6px 10px" }}>Settings</Link>
          <button onClick={logout} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, lineHeight: 1.4, fontFamily: "inherit", textAlign: "left", padding: "6px 10px" }}>Logout</button>
        </div>
      )}
    </div>
  ) : null;

  // ---- Variant rendering ----

  const renderDefault = () => (
    <>
      {user && !isLabs && mainProductLinks.map(([href, label]) => (
        <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={{ ...linkStyle(href), ...(href === "/labs" ? labsMorphStyle : {}) }}>{label}</Link>
      ))}
      {user && !isLabs && mainLinks.map(([href, label]) => (
        <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={linkStyle(href)}>{label}</Link>
      ))}
      {user && isLabs && labsLinks.map(([href, label]) => (
        <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={linkStyle(href)}>{label}</Link>
      ))}
      {user ? (
        <>
          {user.username && (
            <Link href={`/u/${user.username}`} className="nav-link" style={pathname.startsWith("/u/") ? { color: "#c8c8c8" } : undefined}>
              {user.displayName ?? `@${user.username}`}
            </Link>
          )}
          <Link href="/settings" className="nav-link" style={pathname === "/settings" ? { color: "#c8c8c8" } : undefined}>Settings</Link>
          <button onClick={logout} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1, fontFamily: "inherit", padding: 0 }}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/request-access" className="nav-link">Request access</Link>
          <Link href="/login" className="nav-link">Login</Link>
        </>
      )}
    </>
  );

  const renderA = () => (
    <>
      {user && !isLabs && A_LINKS.map(([href, label]) => (
        <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={{ ...linkStyle(href), ...(href === "/labs" ? labsMorphStyle : {}) }}>{label}</Link>
      ))}
      {user && isLabs && labsLinks.map(([href, label]) => (
        <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={linkStyle(href)}>{label}</Link>
      ))}
      {user ? userMenu : (
        <>
          <Link href="/request-access" className="nav-link">Request access</Link>
          <Link href="/login" className="nav-link">Login</Link>
        </>
      )}
    </>
  );

  const renderB = () => (
    <>
      {user && !isLabs && B_TOP.map(([href, label]) => {
        const key = href.replace("/", "");
        const active = bGroup === key;
        // Top-level section labels — clickable but they just route to the first sub-page.
        const firstSub = B_SUB[key]?.[0]?.[0] ?? "/";
        return (
          <Link key={href} href={firstSub} className="nav-link" style={active ? { color: "#c8c8c8" } : undefined}>{label}</Link>
        );
      })}
      {user && isLabs && labsLinks.map(([href, label]) => (
        <Link key={href} href={href} onClick={navigate(href)} className="nav-link" style={linkStyle(href)}>{label}</Link>
      ))}
      {user ? userMenu : (
        <>
          <Link href="/request-access" className="nav-link">Request access</Link>
          <Link href="/login" className="nav-link">Login</Link>
        </>
      )}
    </>
  );

  // Variant B sub-row, shown when there's an active group.
  const bSubRow = variant === "b" && user && bGroup && !isLabs ? B_SUB[bGroup] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 700 }}>
      <nav
        className="athion-nav-top"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          lineHeight: 1,
          padding: "0 24px",
          paddingBottom: bSubRow ? 10 : 0,
          borderBottom: bSubRow ? "1px solid #1a1a1a" : "none",
        }}
      >
        {wordmark}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {variant === "default" && renderDefault()}
          {variant === "a" && renderA()}
          {variant === "b" && renderB()}
        </div>
      </nav>
      {bSubRow && (
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 12,
            padding: "10px 24px 0",
            justifyContent: "flex-end",
          }}
        >
          {bSubRow.map(([href, label]) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                style={{ color: active ? "#c8c8c8" : undefined, fontSize: 12 }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
