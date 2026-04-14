import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { labPermissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/setup", label: "Setup" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/downloads", label: "Downloads" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const [labPerm] = await db
    .select()
    .from(labPermissions)
    .where(eq(labPermissions.userId, user.id))
    .limit(1);

  const hasLabAccess = !!labPerm;

  const displayName =
    user.displayName || user.email.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-background flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
          >
            <span className="font-bold text-base">Athion</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors rounded-[6px]"
            >
              {link.label}
            </Link>
          ))}
          {hasLabAccess && (
            <>
              <div className="h-px bg-border my-2" />
              <a
                href="https://labs.athion.me"
                className="px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors rounded-[6px] flex items-center gap-2"
              >
                Labs
                <span className="ml-auto text-[10px] text-foreground-muted/50">&#8599;</span>
              </a>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-sm text-foreground truncate">{displayName}</p>
          <p className="text-xs text-foreground-muted truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
