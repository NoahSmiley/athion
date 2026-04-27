"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/members", label: "Members" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin sections"
      style={{
        display: "flex",
        gap: 16,
        marginBottom: 24,
        paddingBottom: 12,
        borderBottom: "1px solid #1a1a1a",
        fontSize: 13,
        flexWrap: "wrap",
      }}
    >
      {SECTIONS.map((s) => {
        const active = pathname === s.href || pathname.startsWith(s.href + "/");
        return (
          <Link key={s.href} href={s.href} className="nav-link" style={{ color: active ? "#c8c8c8" : undefined }}>
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
