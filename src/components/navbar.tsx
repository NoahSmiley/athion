"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { flushSync } from "react-dom";

type SubItem = { label: string; href?: string; meta?: string };
type Section = { key: string; label: string; href: string; items: SubItem[] };

const SECTIONS: Section[] = [
  {
    key: "tools",
    label: "Tools",
    href: "/tools",
    items: [
      { label: "Opendock", href: "/opendock" },
      { label: "athctl" },
    ],
  },
  {
    key: "services",
    label: "Services",
    href: "/services",
    items: [
      { label: "Athion Prime", href: "/prime" },
      { label: "Athion Mail" },
    ],
  },
  {
    key: "servers",
    label: "Servers",
    href: "/servers",
    items: [
      { label: "Homelab", href: "/infra" },
      { label: "Game servers" },
    ],
  },
];

const MAIN_LINKS = [
  ["/blog", "Press"],
];

// Cap the display name in the nav button so a 32-char username can't push the
// whole bar offscreen. Full name still shown in the dropdown panel.
const NAV_NAME_MAX = 16;

type NavUser = {
  id: string;
  username?: string | null;
  displayName?: string | null;
  role?: string | null;
};

function shortName(u: NavUser): string {
  const raw = u.displayName ?? (u.username ? `@${u.username}` : "Account");
  return raw.length <= NAV_NAME_MAX ? raw : raw.slice(0, NAV_NAME_MAX - 1) + "…";
}

type Pending = { resolve: () => void } | null;

export function Navbar({ initialUser = null }: { initialUser?: NavUser | null } = {}) {
  const [user, setUser] = useState<NavUser | null>(initialUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const pendingRef = useRef<Pending>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSection = (key: string) => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    setHoveredSection(key);
  };
  const scheduleClose = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = setTimeout(() => setHoveredSection(null), 120);
  };

  // The view-transition callback resolves only once the new pathname has
  // actually committed (so the new pill rect is real, not optimistic).
  useLayoutEffect(() => {
    if (pendingRef.current) {
      const { resolve } = pendingRef.current;
      pendingRef.current = null;
      resolve();
    }
  }, [pathname]);

  useEffect(() => {
    const bc = new BroadcastChannel("auth");
    bc.onmessage = (e) => {
      if (e.data === "logout") setUser(null);
      else if (e.data?.type === "login") setUser(e.data.user);
    };
    return () => bc.close();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.(".user-menu")) setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [menuOpen]);

  const navigate = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("http")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    // Hash anchors like "/#tools" — handle scroll ourselves so it works
    // whether or not we're already on the home page (Next App Router
    // doesn't reliably scroll to hash on same-route navigation).
    const hashIdx = href.indexOf("#");
    if (hashIdx >= 0) {
      const path = href.slice(0, hashIdx) || "/";
      const id = href.slice(hashIdx + 1);
      e.preventDefault();
      const scroll = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      if (pathname === path) {
        scroll();
      } else {
        router.push(path);
        // Wait for the new page to render before scrolling.
        setTimeout(scroll, 100);
      }
      return;
    }

    const targetIsBlog = href === "/blog" || href.startsWith("/blog/");
    const crossesBlogBoundary = isBlog !== targetIsBlog;
    if (!crossesBlogBoundary) return;
    e.preventDefault();

    const doc = document as Document & {
      startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void>; ready: Promise<void> };
    };
    if (typeof doc.startViewTransition !== "function") {
      router.push(href);
      return;
    }
    // Run the navigation inside startViewTransition. flushSync forces React
    // to commit the route change synchronously, then the useLayoutEffect on
    // pathname resolves the pending promise — which lets the browser take
    // its "new" snapshot and animate.
    const transition = doc.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        pendingRef.current = { resolve };
        flushSync(() => {
          router.push(href);
        });
      });
    });
    transition.finished?.catch(() => {
      pendingRef.current = null;
    });
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
    if (href === "/blog") return pathname === "/blog" ? { color: "#c8c8c8" } : undefined;
    return pathname === href || pathname.startsWith(href + "/") ? { color: "#c8c8c8" } : undefined;
  };

  const blogMorphStyle = { viewTransitionName: "blog-morph" } as React.CSSProperties;

  const wordmark = isBlog ? (
    <Link
      href="/"
      onClick={navigate("/")}
      prefetch={true}
      style={{ textDecoration: "none", color: "#fff", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span aria-hidden="true" style={{ color: "#828282" }}>←</span>
      <span style={{ viewTransitionName: "athion-mark" } as React.CSSProperties}>Athion</span>
      <span
        className="blog-pill"
        style={{
          ...blogMorphStyle,
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
        Press
      </span>
    </Link>
  ) : (
    <Link
      href="/"
      onClick={navigate("/")}
      prefetch={true}
      style={{ textDecoration: "none", color: "#fff", fontWeight: 500, display: "inline-flex", alignItems: "center", lineHeight: 1 }}
    >
      <span style={{ viewTransitionName: "athion-mark" } as React.CSSProperties}>Athion</span>
    </Link>
  );

  const isAdmin = user?.role === "admin" || user?.role === "founder";
  const isFounder = user?.role === "founder";

  const userMenu = user ? (
    <div className="user-menu" style={{ position: "relative" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        className="nav-link"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          fontFamily: "inherit",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          maxWidth: 200,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={user.displayName ?? user.username ?? undefined}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{shortName(user)}</span>
        <span aria-hidden="true" style={{ fontSize: 9 }}>▾</span>
      </button>
      {menuOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            background: "#0a0a0a",
            border: "1px solid #2a2a2a",
            minWidth: 170,
            padding: 6,
            fontSize: 12,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {user.username && (
            <Link href={`/u/${user.username}`} className="nav-link" style={{ padding: "6px 10px" }}>
              Profile
            </Link>
          )}
          <Link href="/invites" className="nav-link" style={{ padding: "6px 10px" }}>
            Invites
          </Link>
          <Link href="/settings" className="nav-link" style={{ padding: "6px 10px" }}>
            Settings
          </Link>
          {isAdmin && (
            <>
              <div style={{ borderTop: "1px solid #1a1a1a", margin: "4px 0" }} />
              <Link href="/admin/applications" className="nav-link" style={{ padding: "6px 10px" }}>
                Applications
              </Link>
              {isFounder && (
                <Link href="/admin/members" className="nav-link" style={{ padding: "6px 10px" }}>
                  Members
                </Link>
              )}
            </>
          )}
          <div style={{ borderTop: "1px solid #1a1a1a", margin: "4px 0" }} />
          <button
            onClick={logout}
            className="nav-link"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              lineHeight: 1.4,
              fontFamily: "inherit",
              textAlign: "left",
              padding: "6px 10px",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  ) : null;

  const activeSection = hoveredSection ? SECTIONS.find((s) => s.key === hoveredSection) : null;

  return (
    <div className="athion-nav-wrap" onMouseLeave={scheduleClose}>
      <nav
        className="athion-nav-top"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          lineHeight: 1,
          padding: "0 24px",
        }}
      >
        {wordmark}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {!isBlog && SECTIONS.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              prefetch={true}
              className="nav-link"
              onMouseEnter={() => openSection(s.key)}
              onFocus={() => openSection(s.key)}
              style={hoveredSection === s.key ? { color: "#fff" } : undefined}
            >
              {s.label}
            </Link>
          ))}
          {!isBlog && MAIN_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={navigate(href)}
              prefetch={true}
              className="nav-link"
              onMouseEnter={() => setHoveredSection(null)}
              style={{ ...linkStyle(href), ...(href === "/blog" ? blogMorphStyle : {}) }}
            >
              {label}
            </Link>
          ))}
          {user ? (
            userMenu
          ) : (
            <>
              <Link href="/request-access" className="nav-link" onMouseEnter={() => setHoveredSection(null)}>
                Request access
              </Link>
              <Link href="/login" className="nav-link" onMouseEnter={() => setHoveredSection(null)}>
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
      {!isBlog && (
        <nav
          className="athion-nav-sub"
          onMouseEnter={() => activeSection && openSection(activeSection.key)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 18,
            fontSize: 12,
            lineHeight: 1,
            padding: "8px 24px 0",
            minHeight: 20,
          }}
        >
          {activeSection?.items.map((item) => (
            item.href ? (
              <Link key={item.label} href={item.href} prefetch={true} className="nav-link">
                {item.label}
                {item.meta && <span className="muted" style={{ marginLeft: 6 }}>· {item.meta}</span>}
              </Link>
            ) : (
              <span key={item.label} className="muted">
                {item.label}
                {item.meta && <span style={{ marginLeft: 6 }}>· {item.meta}</span>}
              </span>
            )
          ))}
        </nav>
      )}
    </div>
  );
}
