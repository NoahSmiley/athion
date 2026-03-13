"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Moon, Sun, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { BrainLogo } from "@/components/brain-logo";
import { NAV_ITEMS, type NavItem, type NavDropdown } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

function isDropdown(item: NavItem): item is NavDropdown {
  return "children" in item;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));

    // Cross-tab auth sync
    const bc = new BroadcastChannel("auth");
    bc.onmessage = (event) => {
      if (event.data === "logout") {
        setUser(null);
      } else if (event.data?.type === "login") {
        setUser(event.data.user);
      }
    };
    return () => bc.close();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    new BroadcastChannel("auth").postMessage("logout");
    router.push("/");
    router.refresh();
  };

  const { scrollY } = useScroll();

  // Text "Athion" slides right and fades out (0 -> 250px)
  const textOpacity = useTransform(scrollY, [0, 250], [1, 0]);
  const textX = useTransform(scrollY, [0, 250], [0, 40]);
  const smoothTextOpacity = useSpring(textOpacity, { stiffness: 100, damping: 22 });
  const smoothTextX = useSpring(textX, { stiffness: 100, damping: 22 });

  // Brain logo slides in from left and fades in (100 -> 350px)
  const logoOpacity = useTransform(scrollY, [100, 350], [0, 1]);
  const logoX = useTransform(scrollY, [100, 350], [-30, 0]);
  const logoScale = useTransform(scrollY, [100, 350], [0.6, 1]);
  const smoothLogoOpacity = useSpring(logoOpacity, { stiffness: 100, damping: 22 });
  const smoothLogoX = useSpring(logoX, { stiffness: 100, damping: 22 });
  const smoothLogoScale = useSpring(logoScale, { stiffness: 100, damping: 22 });

  // Backdrop blur kicks in
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const smoothBgOpacity = useSpring(bgOpacity, { stiffness: 100, damping: 30 });

  /** Check if a dropdown item has an active child */
  function isDropdownActive(item: NavDropdown) {
    return item.children.some((child) => pathname === child.href);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Backdrop — animated opacity */}
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        style={{ opacity: smoothBgOpacity }}
      />
      {/* Bottom border on scroll */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-border"
        style={{ opacity: smoothBgOpacity }}
      />

      <nav className="relative mx-auto max-w-7xl px-6 h-[72px] flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-foreground hover:text-accent transition-colors relative h-9"
        >
          {/* Text wordmark — slides right and fades out on scroll */}
          <motion.span
            className="font-[590] text-lg tracking-[-0.022em]"
            style={{ opacity: smoothTextOpacity, x: smoothTextX }}
          >
            Athion
          </motion.span>
          {/* Brain logo — slides in from left on scroll */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{ opacity: smoothLogoOpacity, x: smoothLogoX, scale: smoothLogoScale }}
          >
            <BrainLogo size={36} />
          </motion.div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8" ref={dropdownRef}>
          {NAV_ITEMS.map((item) =>
            isDropdown(item) ? (
              <div key={item.label} className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  }
                  className={cn(
                    "text-sm transition-all duration-200 inline-flex items-center gap-1",
                    isDropdownActive(item)
                      ? "text-accent"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                  <ChevronDown
                    size={12}
                    className={cn(
                      "transition-transform duration-200",
                      openDropdown === item.label && "rotate-180"
                    )}
                  />
                </button>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 py-2 min-w-[160px] bg-background/90 backdrop-blur-xl border border-white/[0.06] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-4 py-2 text-sm transition-colors",
                          pathname === child.href
                            ? "text-accent"
                            : "text-foreground-muted hover:text-foreground hover:bg-background-elevated"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors",
                  pathname === item.href
                    ? "text-accent"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          )}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm transition-colors",
                  pathname.startsWith("/dashboard")
                    ? "text-accent"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={toggle}
            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={toggle}
            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-foreground-muted hover:text-foreground"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span
                className={cn(
                  "block h-px bg-current transition-all duration-300",
                  mobileOpen && "translate-y-[5px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-px bg-current transition-all duration-300",
                  mobileOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-px bg-current transition-all duration-300",
                  mobileOpen && "-translate-y-[5px] -rotate-45"
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="relative md:hidden bg-background/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "text-sm transition-colors",
                pathname === "/"
                  ? "text-accent"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              Home
            </Link>
            {NAV_ITEMS.map((item) =>
              isDropdown(item) ? (
                <div key={item.label} className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
                    {item.label}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "text-sm pl-3 transition-colors",
                        pathname === child.href
                          ? "text-accent"
                          : "text-foreground-muted hover:text-foreground"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "text-sm transition-colors",
                    pathname === item.href
                      ? "text-accent"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-accent hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
