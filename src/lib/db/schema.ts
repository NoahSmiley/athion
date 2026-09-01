import { pgTable, uuid, text, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("member"),
  invitedBy: uuid("invited_by").references((): AnyPgColumn => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inviteCodes = pgTable("invite_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  issuedBy: uuid("issued_by").references(() => users.id, { onDelete: "set null" }),
  usedBy: uuid("used_by").references(() => users.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Stores SHA-256 hashes of reset tokens (never raw tokens) so a database leak
// can't be used to take over accounts. Tokens are single-use; usedAt is set
// when redeemed and the row is kept so replays return the same "expired" path.
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});



// Per-user Jellyfin identity. One row per athion user that has used Athion Prime.
// Created lazily on first /api/prime/jellyfin-token request. The Jellyfin password
// is NOT stored — it's deterministically derived server-side from the athion user
// id + JELLYFIN_USER_PASSWORD_SECRET so it can be reproduced when issuing tokens.
// Device-code activation for Prime on TV: the TV creates a row and polls it;
// the phone (signed-in session) claims the code, which stores a one-shot
// config payload the TV's next poll consumes. Codes are short-lived and
// single-use; pollSecret stops third parties from polling someone else's code.
export const primeDeviceCodes = pgTable("prime_device_codes", {
  code: text("code").primaryKey(),
  pollSecret: text("poll_secret").notNull(),
  status: text("status").notNull().default("pending"), // pending | claimed | consumed
  claimedBy: uuid("claimed_by").references(() => users.id, { onDelete: "set null" }),
  payload: text("payload"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jellyfinUsers = pgTable("jellyfin_users", {
  athionUserId: uuid("athion_user_id")
    .primaryKey()
    .references((): AnyPgColumn => users.id, { onDelete: "cascade" }),
  jellyfinUserId: text("jellyfin_user_id").notNull().unique(),
  jellyfinUsername: text("jellyfin_username").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Long-lived renewal credential for an activated Prime TV. Only the sha256 of
// the token is stored; the plaintext lives in the device's Keychain and lets
// it silently re-provision a Jellyfin session if its token ever dies.
export const primeDevices = pgTable("prime_devices", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // The Jellyfin device identity minted at claim ("prime-tv:<uid>:<code>") —
  // renewals reuse it so each TV stays one device record server-side.
  deviceId: text("device_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastRenewedAt: timestamp("last_renewed_at", { withTimezone: true }),
});
