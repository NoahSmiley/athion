"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const MAIN_LINKS = [
  ["/software", "Software"],
  ["/infra", "Infra"],
  ["/docs", "Docs"],
  ["/blog", "Blog"],
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

export function Navbar({ initialUser = null }: { initialUser?: NavUser | null } = {}) {
  const [user, setUser] = useState<NavUser | null>(initialUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // optimisticBlog lets us flip the pill morph state immediately on click,
  // before Next has actually committed the new route. Without this the
  // animation visibly waits for the route fetch + render.
  const [optimisticBlog, setOptimisticBlog] = useState<boolean | null>(null);
  const realIsBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isBlog = optimisticBlog ?? realIsBlog;
  // When the real route catches up to our optimistic guess, drop the override.
  useEffect(() => {
    if (optimisticBlog !== null && optimisticBlog === realIsBlog) {
      setOptimisticBlog(null);
    }
  }, [optimisticBlog, realIsBlog]);

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
    // Snapshot the current state, optimistically flip isBlog so React
    // re-renders the pill at its new position, then resolve. The browser
    // takes its "new" snapshot from that re-render and animates between
    // the two — all before Next has finished committing the route.
    const transition = doc.startViewTransition(() => {
      setOptimisticBlog(targetIsBlog);
      router.push(href);
      // One microtask is enough — React commits the optimistic state
      // synchronously after setState, the snapshot fires next frame.
      return Promise.resolve();
    });
    transition.finished?.catch(() => {});
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
        Blog
      </span>
    </Link>
  ) : (
    <Link href="/" onClick={navigate("/")} style={{ textDecoration: "none", color: "#fff", fontWeight: 500 }}>
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

  return (
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
        {user && !isBlog && MAIN_LINKS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            onClick={navigate(href)}
            className="nav-link"
            style={{ ...linkStyle(href), ...(href === "/blog" ? blogMorphStyle : {}) }}
          >
            {label}
          </Link>
        ))}
        {user ? (
          userMenu
        ) : (
          <>
            <Link href="/request-access" className="nav-link">
              Request access
            </Link>
            <Link href="/login" className="nav-link">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
