"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TOP = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/stacks", label: "Stacks" },
  { href: "/docs/repository", label: "Repository" },
];

const ARCH_SUB = [
  { href: "/docs/architecture", label: "Overview" },
  { href: "/docs/architecture/state", label: "State" },
  { href: "/docs/architecture/antipatterns", label: "Anti-patterns" },
  { href: "/docs/architecture/monorepo", label: "Monorepo" },
];

const STACKS_SUB = [
  { href: "/docs/stacks/tauri", label: "Tauri" },
  { href: "/docs/stacks/swiftui", label: "SwiftUI" },
  { href: "/docs/stacks/tvos", label: "tvOS" },
  { href: "/docs/stacks/react", label: "React" },
  { href: "/docs/stacks/typescript", label: "TypeScript" },
  { href: "/docs/stacks/rust", label: "Rust" },
  { href: "/docs/stacks/toolkit", label: "Toolkit" },
  { href: "/docs/stacks/nextjs", label: "Next.js" },
];

const OVERVIEW_SUB: { href: string; label: string }[] = [];
const REPO_SUB: { href: string; label: string }[] = [];

function topActiveHref(pathname: string): string {
  if (pathname.startsWith("/docs/architecture")) return "/docs/architecture";
  if (pathname.startsWith("/docs/stacks")) return "/docs/stacks";
  if (pathname.startsWith("/docs/repository")) return "/docs/repository";
  return "/docs";
}

function subItemsFor(top: string) {
  if (top === "/docs/architecture") return ARCH_SUB;
  if (top === "/docs/stacks") return STACKS_SUB;
  if (top === "/docs/repository") return REPO_SUB;
  return OVERVIEW_SUB;
}

export function DocsNav() {
  const pathname = usePathname();
  const topActive = topActiveHref(pathname);
  const sub = subItemsFor(topActive);

  return (
    <nav aria-label="Docs sections" style={{ marginBottom: 24 }}>
      {/* Top tier */}
      <div
        style={{
          display: "flex",
          gap: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #1a1a1a",
          fontSize: 13,
          flexWrap: "wrap",
        }}
      >
        {TOP.map((s) => {
          const active = s.href === topActive;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="nav-link"
              style={{ color: active ? "#c8c8c8" : undefined }}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom tier — only renders when the section has sub-pages. */}
      {sub.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 14,
            paddingTop: 10,
            paddingBottom: 12,
            borderBottom: "1px solid #1a1a1a",
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          {sub.map((s) => {
            const active =
              pathname === s.href ||
              (s.href !== "/docs/architecture" && s.href !== "/docs/stacks" && pathname.startsWith(s.href + "/"));
            return (
              <Link
                key={s.href}
                href={s.href}
                className="nav-link"
                style={{ color: active ? "#c8c8c8" : undefined }}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
