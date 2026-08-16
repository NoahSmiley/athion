import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Administration">
      <Link href="/admin/members" className="nav-link">Accounts</Link>
    </nav>
  );
}
