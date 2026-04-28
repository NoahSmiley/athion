import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{1,31}$/;

// Reserved names that would let a member spoof an admin/system identity
// or collide with a route segment. Compared after lowercasing.
const RESERVED = new Set([
  "admin", "administrator", "root", "system", "support", "help", "moderator", "mod",
  "athion", "official", "staff", "team", "owner", "founder", "noah",
  "api", "auth", "login", "signup", "logout", "settings", "invites", "docs", "blog",
  "software", "infra", "members", "about", "process", "request-access", "reset-password",
  "privacy", "terms", "security", "transparency", "careers", "u", "me", "you",
  "null", "undefined", "anonymous", "guest", "test",
]);

// `current` allows a user to keep a name they were already assigned (e.g., founder
// kept "noah" before reserved-name enforcement existed). Pass null/undefined for
// signup or admin-name-rename flows where no grandfathering should apply.
export function isValidUsername(s: string, current?: string | null): boolean {
  if (!USERNAME_RE.test(s)) return false;
  if (RESERVED.has(s) && s !== current) return false;
  return true;
}

// Slug a string into a username candidate: lowercase, replace runs of
// non-alphanum with a single hyphen, trim leading/trailing hyphens.
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

// Pick a unique username from a base. If the base is taken, append a
// short random suffix and retry.
export async function pickUniqueUsername(base: string): Promise<string> {
  const seed = slugify(base) || "member";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? seed : `${seed}-${Math.random().toString(36).slice(2, 6)}`;
    if (!isValidUsername(candidate)) continue;
    const taken = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, candidate))
      .limit(1);
    if (taken.length === 0) return candidate;
  }
  // Last resort: random
  return `member-${Math.random().toString(36).slice(2, 8)}`;
}
