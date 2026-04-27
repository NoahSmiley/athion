import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "./session";

// Admin = founder tier. Returns the user record if the caller is an admin, else null.
export async function getAdminUser() {
  const session = await getSession();
  if (!session) return null;
  const rows = await db
    .select({ id: users.id, email: users.email, tier: users.tier })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);
  const u = rows[0];
  if (!u || u.tier !== "founder") return null;
  return u;
}
