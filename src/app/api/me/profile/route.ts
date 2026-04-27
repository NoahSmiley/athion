import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/roles";
import { isValidUsername } from "@/lib/username";

const MAX_DISPLAY_NAME = 64;
const MAX_BIO = 500;

export async function PATCH(request: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : null;
  const displayNameRaw = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const bioRaw = typeof body?.bio === "string" ? body.bio : "";

  if (!username || !isValidUsername(username)) {
    return NextResponse.json({ error: "Username must be lowercase letters/numbers with optional hyphens or underscores, 2–32 chars" }, { status: 400 });
  }
  if (displayNameRaw.length > MAX_DISPLAY_NAME) {
    return NextResponse.json({ error: `Display name max ${MAX_DISPLAY_NAME} characters` }, { status: 400 });
  }
  if (bioRaw.length > MAX_BIO) {
    return NextResponse.json({ error: `Bio max ${MAX_BIO} characters` }, { status: 400 });
  }

  // Username uniqueness
  const taken = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, username), ne(users.id, me.id)))
    .limit(1);
  if (taken.length > 0) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  await db
    .update(users)
    .set({
      username,
      displayName: displayNameRaw || null,
      bio: bioRaw || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, me.id));

  return NextResponse.json({ ok: true });
}
