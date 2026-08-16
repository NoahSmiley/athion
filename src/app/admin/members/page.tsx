import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getFounderUser } from "@/lib/auth/roles";
import { RoleSelect } from "./role-select";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  const founder = await getFounderUser();
  if (!founder) redirect("/");

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  return (
    <>
      <h1>Accounts</h1>
      <p className="muted">{rows.length} active account{rows.length === 1 ? "" : "s"}.</p>

      <table className="admin-apps-table">
        <thead>
          <tr>
            <th>Email</th>
            <th className="hide-mobile">Name</th>
            <th>Role</th>
            <th className="hide-mobile">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr key={user.id}>
              <td className="email-cell">{user.email}</td>
              <td className="muted hide-mobile">{user.displayName ?? "—"}</td>
              <td><RoleSelect userId={user.id} role={user.role} isSelf={user.id === founder.id} /></td>
              <td className="muted hide-mobile">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
