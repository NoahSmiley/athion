import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth/roles";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pre-resolve the user on the server so the nav SSRs in the right state.
  // Without this, the nav renders as logged-out, hydrates, fetches /api/auth/me,
  // and visibly snaps to logged-in on every refresh.
  const me = await getCurrentUser();
  const initialUser = me
    ? { id: me.id, username: me.username, displayName: me.displayName, role: me.role }
    : null;
  return (
    <>
      <div className="main-sidebar">
        <Navbar initialUser={initialUser} />
      </div>
      <div className="main-stage">
        <main>{children}</main>
      </div>
      <div className="main-footer-wrap">
        <Footer initialAuthed={!!me} />
      </div>
    </>
  );
}
