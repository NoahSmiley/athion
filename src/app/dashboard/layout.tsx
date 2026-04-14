import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { labPermissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Footer } from "@/components/footer";

const links = [
  ["/dashboard", "Overview"], ["/dashboard/setup", "Setup"], ["/dashboard/billing", "Billing"],
  ["/dashboard/downloads", "Downloads"], ["/dashboard/settings", "Settings"],
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const [labPerm] = await db.select().from(labPermissions).where(eq(labPermissions.userId, user.id)).limit(1);
  const displayName = user.displayName || user.email.split("@")[0] || "User";

  return (
    <>
      <div style={{ position: "fixed", left: 80, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 500, textDecoration: "none", marginBottom: 8 }}>Athion</Link>
          {links.map(([href, label]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}
          {labPerm && (
            <>
              <span style={{ height: 4 }} />
              <a href="https://labs.athion.me" className="nav-link">Labs &#8599;</a>
            </>
          )}
          <span style={{ height: 12 }} />
          <span style={{ color: "#828282", fontSize: 11 }}>{displayName}</span>
          <span style={{ color: "#555", fontSize: 11 }}>{user.email}</span>
        </nav>
      </div>
      <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
        <main style={{ maxWidth: 700, width: "100%", padding: "0 10px", pointerEvents: "auto" }}>{children}</main>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Footer />
      </div>
    </>
  );
}
