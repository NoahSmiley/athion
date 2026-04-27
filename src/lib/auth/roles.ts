import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "./session";

export type Role = "founder" | "admin" | "member";

export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
  displayName: string | null;
};

// Returns the current user with their role, or null if no session.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;
  const rows = await db
    .select({ id: users.id, email: users.email, role: users.role, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);
  const u = rows[0];
  if (!u) return null;
  return { id: u.id, email: u.email, role: u.role as Role, displayName: u.displayName };
}

// Admin pages and APIs: founder OR admin can access.
export async function getAdminUser(): Promise<CurrentUser | null> {
  const u = await getCurrentUser();
  if (!u) return null;
  if (u.role !== "founder" && u.role !== "admin") return null;
  return u;
}

// Founder-only operations: managing roles, banning, etc.
export async function getFounderUser(): Promise<CurrentUser | null> {
  const u = await getCurrentUser();
  if (!u) return null;
  if (u.role !== "founder") return null;
  return u;
}

export function isAdmin(role: Role | string): boolean {
  return role === "founder" || role === "admin";
}

export function isFounder(role: Role | string): boolean {
  return role === "founder";
}
