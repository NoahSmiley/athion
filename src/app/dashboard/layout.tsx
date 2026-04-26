import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Footer } from "@/components/footer";

const links = [
  ["/dashboard", "Overview"], ["/dashboard/setup", "Setup"], ["/dashboard/billing", "Billing"],
  ["/dashboard/downloads", "Downloads"], ["/dashboard/settings", "Settings"],
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const displayName = user.displayName || user.email.split("@")[0] || "User";

  return (
    <>
      <div className="dash-sidebar">
        <nav className="athion-nav" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 500, textDecoration: "none", marginBottom: 8 }}>Athion</Link>
          {links.map(([href, label]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}
          <span style={{ height: 12 }} />
          <span className="dash-user-name" style={{ color: "#828282", fontSize: 11 }}>{displayName}</span>
          <span className="dash-user-email" style={{ color: "#555", fontSize: 11 }}>{user.email}</span>
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
