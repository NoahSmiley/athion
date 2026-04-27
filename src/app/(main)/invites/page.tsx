import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { refreshInvites } from "@/lib/invites";
import { InvitesPanel } from "./panel";
import { db } from "@/lib/db";
import { inviteCodes, users } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const state = await refreshInvites(me.id);

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
          .select({ id: users.id, username: users.username, memberNumber: users.memberNumber, displayName: users.displayName })
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
              memberNumber: usersById.get(c.usedBy)!.memberNumber,
              displayName: usersById.get(c.usedBy)!.displayName,
            }
          : null)
      : null,
  }));

  return (
    <>
      <h1>Invites</h1>
      <p className="muted">Members get one invite per month, capped at three. Cooldown for new members is 30 days from joining.</p>

      <InvitesPanel
        initialState={{
          available: state.available,
          cap: state.cap,
          cooldownActive: state.cooldownActive,
          cooldownUntil: state.cooldownUntil ? state.cooldownUntil.toISOString() : null,
          nextGrantAt: state.nextGrantAt ? state.nextGrantAt.toISOString() : null,
          unlimited: state.unlimited,
        }}
        initialCodes={codes}
      />
    </>
  );
}
