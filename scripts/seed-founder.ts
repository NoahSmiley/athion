import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3] ?? process.env.SEED_PASSWORD;
  if (!email || !password) {
    console.error("Usage: tsx scripts/seed-founder.ts <email> <password>  (or set SEED_PASSWORD)");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const existing = await db.select({ id: users.id, memberNumber: users.memberNumber })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    console.log(`User already exists: ${email} (member #${existing[0].memberNumber})`);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);

  const inserted = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    displayName: "Founder",
    role: "founder",
    invitesAvailable: 999,
  }).returning();

  console.log(`Founder created: ${inserted[0].email} as member #${inserted[0].memberNumber}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
