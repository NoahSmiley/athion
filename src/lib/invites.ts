import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const INVITE_CAP = 3;
const GRANT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;
const NEW_MEMBER_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
export const INVITE_CODE_TTL_DAYS = 14;

export type InviteState = {
  available: number;
  cap: number;
  cooldownUntil: Date | null;
  cooldownActive: boolean;
  nextGrantAt: Date | null;
  unlimited: boolean; // true for founders/admins
};

export function isUnlimited(role: string): boolean {
  return role === "founder" || role === "admin";
}

// Bring a user's invite counters up to date. Grants any backlog (1 per
// 30-day window since last grant, capped). Returns the resulting state.
export async function refreshInvites(userId: string): Promise<InviteState> {
  const rows = await db
    .select({
      role: users.role,
      invitesAvailable: users.invitesAvailable,
      invitesGrantedAt: users.invitesGrantedAt,
      joinCooldownUntil: users.joinCooldownUntil,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const u = rows[0];
  if (!u) {
    return {
      available: 0,
      cap: INVITE_CAP,
      cooldownUntil: null,
      cooldownActive: false,
      nextGrantAt: null,
      unlimited: false,
    };
  }

  if (isUnlimited(u.role)) {
    return {
      available: u.invitesAvailable,
      cap: u.invitesAvailable,
      cooldownUntil: null,
      cooldownActive: false,
      nextGrantAt: null,
      unlimited: true,
    };
  }

  const now = Date.now();
  const cooldownUntil = u.joinCooldownUntil ?? new Date(u.createdAt.getTime() + NEW_MEMBER_COOLDOWN_MS);
  const cooldownActive = now < cooldownUntil.getTime();

  // If there's no granted timestamp yet, treat the cooldown end as the first grant time.
  const lastGrant = u.invitesGrantedAt ?? cooldownUntil;
  let available = u.invitesAvailable;
  let granted = lastGrant.getTime();

  // Don't grant while cooldown is active.
  if (!cooldownActive) {
    while (available < INVITE_CAP && now - granted >= GRANT_INTERVAL_MS) {
      available += 1;
      granted += GRANT_INTERVAL_MS;
    }
  }

  if (available !== u.invitesAvailable || granted !== lastGrant.getTime()) {
    await db
      .update(users)
      .set({ invitesAvailable: available, invitesGrantedAt: new Date(granted) })
      .where(eq(users.id, userId));
  }

  const nextGrantAt = available >= INVITE_CAP ? null : new Date(granted + GRANT_INTERVAL_MS);

  return {
    available,
    cap: INVITE_CAP,
    cooldownUntil,
    cooldownActive,
    nextGrantAt,
    unlimited: false,
  };
}

export function generateCode(): string {
  // 12-char URL-safe code (~72 bits)
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}
