import { pgTable, uuid, text, timestamp, boolean, serial, integer, type AnyPgColumn } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberNumber: serial("member_number").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("member"), // founder | admin | member (later: veteran, architect)
  invitedBy: uuid("invited_by").references((): AnyPgColumn => users.id),
  invitesAvailable: integer("invites_available").notNull().default(0),
  invitesGrantedAt: timestamp("invites_granted_at", { withTimezone: true }),
  joinCooldownUntil: timestamp("join_cooldown_until", { withTimezone: true }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  stripeCustomerId: text("stripe_customer_id"),
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

export const accessRequests = pgTable("access_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  githubUrl: text("github_url"),
  vouchers: text("vouchers"),
  // status flow: pending -> in_review -> {interview_scheduled, needs_more_info} -> approved | denied | withdrawn
  status: text("status").notNull().default("pending"),
  interviewAt: timestamp("interview_at", { withTimezone: true }),
  interviewDurationMinutes: integer("interview_duration_minutes").notNull().default(30),
  interviewNote: text("interview_note"),
  decisionNote: text("decision_note"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  inviteCodeId: uuid("invite_code_id").references(() => inviteCodes.id, { onDelete: "set null" }),
  lastApplicantMessageAt: timestamp("last_applicant_message_at", { withTimezone: true }),
  lastAdminSeenAt: timestamp("last_admin_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatChannels = pgTable("chat_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  kind: text("kind").notNull().default("general"), // general | interview
  applicationId: uuid("application_id").references(() => accessRequests.id, { onDelete: "cascade" }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id").notNull().references(() => chatChannels.id, { onDelete: "cascade" }),
  // Null when posted by an applicant who doesn't have an account yet (interview channels).
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  // Snapshot of name + member number at post time. Useful for applicant identity (no users row)
  // and survives if an account is later deleted.
  authorName: text("author_name"),
  authorMemberNumber: integer("author_member_number"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  product: text("product").notNull(),
  stripePriceId: text("stripe_price_id"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Opendock desktop app releases. Each row is a published version on a channel
// (stable | beta). Artifacts (per-platform binaries + Tauri update signatures)
// live in opendock_release_artifacts. yanked=true hides the row from the
// updater endpoint and download pages without deleting it.
export const opendockReleases = pgTable("opendock_releases", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: text("version").notNull(),
  channel: text("channel").notNull().default("stable"),
  notes: text("notes").notNull().default(""),
  pubDate: timestamp("pub_date", { withTimezone: true }).notNull().defaultNow(),
  yanked: boolean("yanked").notNull().default(false),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// One row per (release, target). target uses Tauri's `<os>-<arch>` form, e.g.
// `darwin-aarch64`, `darwin-x86_64`, `windows-x86_64`, `linux-x86_64`.
// `url` is what the updater downloads (the .tar.gz/.zip Tauri-update artifact).
// `installerUrl` is the user-installable .dmg/.nsis (download page links here).
// `signature` is the contents of the .sig file Tauri produces — required for
// the updater to accept the artifact.
export const opendockReleaseArtifacts = pgTable("opendock_release_artifacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  releaseId: uuid("release_id").notNull().references(() => opendockReleases.id, { onDelete: "cascade" }),
  target: text("target").notNull(),
  url: text("url").notNull(),
  installerUrl: text("installer_url"),
  signature: text("signature").notNull(),
  sha256: text("sha256").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
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

