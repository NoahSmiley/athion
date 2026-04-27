import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth/roles";
import { Footer } from "@/components/footer";

const links = [
  ["/admin/applications", "Applications"],
  ["/admin/members", "Members"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  // Logged-out users are bounced by middleware. If we get here without an admin
  // it means the viewer is a logged-in member who just doesn't have admin role —
  // send them home rather than to /login (which would bounce them right back).
  if (!admin) redirect("/");

  return (
    <>
      <div className="dash-sidebar">
        <nav className="athion-nav" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 500, textDecoration: "none", marginBottom: 8 }}>Athion · Admin</Link>
          {links.map(([href, label]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}
          <span style={{ height: 12 }} />
          <span className="dash-user-name" style={{ color: "#828282", fontSize: 11 }}>{admin.email}</span>
          <span className="dash-user-email" style={{ color: "#555", fontSize: 11 }}>{admin.role}</span>
        </nav>
      </div>
      <div className="dash-stage">
        <main>{children}</main>
      </div>
      <div className="main-footer-wrap">
        <Footer />
      </div>
    </>
  );
}
