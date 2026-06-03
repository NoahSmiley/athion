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
      { label: "Zomboid", href: "/servers/zomboid" },
      { label: "Minecraft", href: "/servers/minecraft" },
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
  const [openSectionKey, setOpenSectionKey] = useState<string | null>(null);
  const [subCenter, setSubCenter] = useState(24);
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);
  // Tracks whether the underline is mid-show. Used to suppress the slide-in
  // from {0,0} when the bar first appears — we only want left/width to animate
  // between section-to-section transitions, not from origin.
  const [underlineVisible, setUnderlineVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const pendingRef = useRef<Pending>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const openSection = (key: string) => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    setOpenSectionKey(key);
  };
  const scheduleClose = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = setTimeout(() => setOpenSectionKey(null), 350);
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

  // Section the visitor is currently on, derived from pathname. Matches
  // either the section's own page (/tools, /services, /servers) or any
  // sub-item belonging to that section (/opendock under Tools, etc.) so
  // visiting a sub-item still highlights its parent.
  const currentSectionKey =
    SECTIONS.find((s) => {
      if (pathname === s.href || pathname.startsWith(s.href + "/")) return true;
      return s.items.some((item) => {
        if (!item.href) return false;
        if (item.href.startsWith("http")) return false;
        return pathname === item.href || pathname.startsWith(item.href + "/");
      });
    })?.key ?? null;
  // What the underline should track: hovered section first, otherwise the
  // current page's section.
  const underlineSectionKey = openSectionKey ?? currentSectionKey;

  useLayoutEffect(() => {
    if (!underlineSectionKey) {
      setUnderlineVisible(false);
      return;
    }
    const btn = sectionRefs.current.get(underlineSectionKey);
    const wrap = wrapRef.current;
    if (!btn || !wrap) return;
    const btnRect = btn.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    setSubCenter(btnRect.left - wrapRect.left + btnRect.width / 2);
    setUnderline({ left: btnRect.left - wrapRect.left, width: btnRect.width });
    // Schedule the opacity flip on a separate frame so the browser
    // commits the bar at its target position with opacity:0 first,
    // then transitions opacity to 1. Without this, both updates batch
    // into one paint and there's no fade.
    const raf = requestAnimationFrame(() => setUnderlineVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [underlineSectionKey]);

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
    setOpenSectionKey(null);
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
    if (href === "/blog") return pathname === "/blog" ? { color: "#fff" } : undefined;
    return pathname === href || pathname.startsWith(href + "/") ? { color: "#fff" } : undefined;
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
              {/* Lead pipeline lives on the demos.athion.me subdomain (SSO admits admins). */}
              <a href="https://demos.athion.me/" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ padding: "6px 10px" }}>
                Leads
              </a>
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

  const activeSection = openSectionKey ? SECTIONS.find((s) => s.key === openSectionKey) : null;
  const closeNonSection = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    setOpenSectionKey(null);
  };

  return (
    <div ref={wrapRef} className="athion-nav-wrap" onMouseLeave={scheduleClose}>
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
          {!isBlog && user && SECTIONS.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              prefetch={true}
              className={`nav-link${underlineSectionKey === s.key ? " nav-link-active" : ""}`}
              ref={(el: HTMLAnchorElement | null) => {
                if (el) sectionRefs.current.set(s.key, el);
                else sectionRefs.current.delete(s.key);
              }}
              onMouseEnter={() => openSection(s.key)}
              onFocus={() => openSection(s.key)}
              aria-expanded={openSectionKey === s.key}
              aria-current={currentSectionKey === s.key ? "page" : undefined}
            >
              {s.label}
            </Link>
          ))}
          {!isBlog && user && MAIN_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={navigate(href)}
              prefetch={true}
              className={`nav-link${linkStyle(href) ? " nav-link-active" : ""}`}
              onMouseEnter={closeNonSection}
              style={href === "/blog" ? blogMorphStyle : undefined}
            >
              {label}
            </Link>
          ))}
          {user ? (
            userMenu
          ) : (
            <>
              <Link href="/request-access" className="nav-link" onMouseEnter={closeNonSection}>
                Request access
              </Link>
              <Link href="/login" className="nav-link" onMouseEnter={closeNonSection}>
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
      {/* Sliding underline tracking the active section. We mount the bar
          only once `underline` exists, so the very first appearance has no
          prior position to interpolate from — the bar simply fades in at
          its target. Subsequent section switches keep the same element
          mounted, so left/width animate smoothly between sections. */}
      {underline && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 24,
            left: underline.left,
            width: underline.width,
            height: 1,
            background: "#fff",
            opacity: underlineVisible ? 1 : 0,
            transition: "left 0.18s ease, width 0.18s ease, opacity 0.18s ease",
            pointerEvents: "none",
          }}
        />
      )}
      {!isBlog && user && (
        <>
          <nav
            className="athion-nav-sub"
            onMouseEnter={() => activeSection && openSection(activeSection.key)}
            style={{
              position: "absolute",
              top: 24,
              left: subCenter,
              transform: activeSection
                ? "translate(-50%, 0)"
                : "translate(-50%, -4px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              lineHeight: 1,
              // Top padding bridges the gap to the top nav so the hit-area
              // covers the dead zone between the two rows.
              padding: "10px 0 8px",
              opacity: activeSection ? 1 : 0,
              transition: "opacity 0.18s ease, transform 0.22s ease, left 0.22s ease",
              pointerEvents: activeSection ? "auto" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {activeSection?.items.filter((item) => item.href).map((item) => {
              const href = item.href!;
              const external = href.startsWith("http");
              const isCurrent = !external && (pathname === href || pathname.startsWith(href + "/"));
              const className = `nav-link${isCurrent ? " nav-link-active" : ""}`;
              // Athion Prime gets the same cyan pill treatment as the
              // wordmark inside the Prime web app — "Athion" plain, "PRIME"
              // as a small uppercase cyan pill, so it visually matches
              // prime.athion.me's nav.
              const isPrime = item.label === "Athion Prime";
              const label = isPrime ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>Athion</span>
                  <span
                    style={{
                      background: "#06b6d4",
                      color: "#fff",
                      padding: "2px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  >
                    Prime
                  </span>
                </span>
              ) : (
                item.label
              );
              return external ? (
                <a key={item.label} href={href} className={className} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              ) : (
                <Link key={item.label} href={href} prefetch={true} className={className}>
                  {label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
