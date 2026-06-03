"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/opendock/releases", label: "Opendock Releases" },
  // The lead pipeline lives on the demos.athion.me subdomain (SSO lets admins
  // straight in). External link → opens in a new tab.
  { href: "https://demos.athion.me/", label: "Leads", external: true },
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
      {SECTIONS.map((s) =>
        s.external ? (
          <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="nav-link">
            {s.label}
          </a>
        ) : (
          <Link key={s.href} href={s.href} className="nav-link" style={{ color: pathname === s.href || pathname.startsWith(s.href + "/") ? "#c8c8c8" : undefined }}>
            {s.label}
          </Link>
        ),
      )}
    </nav>
  );
}
