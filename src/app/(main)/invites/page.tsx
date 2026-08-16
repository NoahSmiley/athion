import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/roles";
import { InvitesPanel } from "./panel";
import { db } from "@/lib/db";
import { inviteCodes, users } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  const me = await getAdminUser();
  if (!me) redirect("/");

  const myCodes = await db
    .select({
      id: inviteCodes.id,
      code: inviteCodes.code,
      usedAt: inviteCodes.usedAt,
      usedBy: inviteCodes.usedBy,
      revokedAt: inviteCodes.revokedAt,
      expiresAt: inviteCodes.expiresAt,
      createdAt: inviteCodes.createdAt,
    })
    .from(inviteCodes)
    .where(eq(inviteCodes.issuedBy, me.id))
    .orderBy(desc(inviteCodes.createdAt))
    .limit(50);

  const usedByIds = myCodes.map((c) => c.usedBy).filter((x): x is string => !!x);
  const usedByUsers =
    usedByIds.length === 0
      ? []
      : await db
          .select({ id: users.id, username: users.username, displayName: users.displayName })
          .from(users)
          .where(inArray(users.id, usedByIds));
  const usersById = new Map(usedByUsers.map((u) => [u.id, u]));

  const codes = myCodes.map((c) => ({
    id: c.id,
    code: c.code,
    usedAt: c.usedAt ? c.usedAt.toISOString() : null,
    revokedAt: c.revokedAt ? c.revokedAt.toISOString() : null,
    expiresAt: c.expiresAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    usedByUser: c.usedBy
      ? (usersById.get(c.usedBy)
          ? {
              username: usersById.get(c.usedBy)!.username,
              displayName: usersById.get(c.usedBy)!.displayName,
            }
          : null)
      : null,
  }));

  return (
    <>
      <h1>Access codes</h1>
      <p className="muted">Create a one-time code for a trusted user. Codes expire after 14 days.</p>

      <InvitesPanel initialCodes={codes} />
    </>
  );
}
