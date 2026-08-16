import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/roles";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  // Authentication is handled by the proxy; authorization remains server-side.
  if (!admin) redirect("/");

  const initialUser = {
    id: admin.id,
    username: admin.username,
    displayName: admin.displayName,
    role: admin.role,
  };

  return (
    <>
      <div className="main-sidebar">
        <Navbar initialUser={initialUser} />
      </div>
      <div className="main-stage">
        <main>
          <div className="admin-page">
            <AdminNav />
            {children}
          </div>
        </main>
      </div>
      <div className="main-footer-wrap">
        <Footer />
      </div>
    </>
  );
}
