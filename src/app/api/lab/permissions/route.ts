import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { labPermissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [perm] = await db
    .select()
    .from(labPermissions)
    .where(eq(labPermissions.userId, user.id))
    .limit(1);

  if (!perm) {
    return NextResponse.json({ error: "No lab access" }, { status: 403 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    permissions: {
      role: perm.role,
      allowedMachines: perm.allowedMachines ? JSON.parse(perm.allowedMachines) : null,
      canControl: perm.canControl,
      canTerminal: perm.canTerminal,
      canRcon: perm.canRcon,
    },
  });
}
