import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/roles";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  // Logged-out users are bounced by middleware. If we get here without an admin
  // it means the viewer is a logged-in member who just doesn't have admin role —
  // send them home rather than to /login (which would bounce them right back).
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
        <Footer initialAuthed={true} />
      </div>
    </>
  );
}
