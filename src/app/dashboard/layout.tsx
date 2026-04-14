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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 10px", display: "flex", gap: 80, flex: 1, width: "100%" }}>
        <div style={{ width: 100, display: "flex", alignItems: "center", marginLeft: -40 }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <Link href="/" style={{ fontSize: 15, fontWeight: 500, textDecoration: "none", marginBottom: 8 }}>Athion</Link>
            {links.map(([href, label]) => <Link key={href} href={href} style={{ color: "#828282", textDecoration: "none" }}>{label}</Link>)}
            {labPerm && (
              <>
                <span style={{ height: 4 }} />
                <a href="https://labs.athion.me" style={{ color: "#828282", textDecoration: "none" }}>Labs &#8599;</a>
              </>
            )}
            <span style={{ height: 12 }} />
            <span style={{ color: "#828282", fontSize: 11 }}>{displayName}</span>
            <span style={{ color: "#555", fontSize: 11 }}>{user.email}</span>
          </nav>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
