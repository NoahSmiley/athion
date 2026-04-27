import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getFounderUser } from "@/lib/auth/roles";
import { RoleSelect } from "./role-select";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const founder = await getFounderUser();
  if (!founder) redirect("/admin/applications");

  const rows = await db
    .select({
      id: users.id,
      memberNumber: users.memberNumber,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.memberNumber));

  return (
    <>
      <h1>Members</h1>
      <p className="muted">{rows.length} member{rows.length === 1 ? "" : "s"}. Founder-only — change roles below.</p>

      <table style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td className="muted" style={{ fontFamily: "var(--font-mono)" }}>{String(u.memberNumber).padStart(3, "0")}</td>
              <td>{u.email}</td>
              <td className="muted">{u.displayName ?? "—"}</td>
              <td>
                <RoleSelect userId={u.id} role={u.role} isSelf={u.id === founder.id} />
              </td>
              <td className="muted" style={{ fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
