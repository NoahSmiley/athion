# Athion build plan

Living document of what's done, what's in flight, and what's next. Update as phases close.

---

## Done

### Phase 0 — Site refresh (pre-this-doc)
- Top-bar navigation, ASCII homepage with 8 randomly-selected variants, click-to-shuffle
- /labs, /software pages
- Navbar morph between regular and labs mode (View Transitions API)
- Mobile responsiveness

### Phase 1 — Homelab cutover (2026-04-26)
- athion.me migrated from Vercel/Neon → Proxmox homelab
- CT 109 `athion-web` runs Next.js (`athion.service`, port 3000)
- CT 107 `opendock-db` runs Postgres 17 with `athion` database
- Caddy on CT 109 reverse-proxies → Next.js
- Cloudflare tunnel routes `athion.me` / `www.athion.me` / `staging.athion.me` → CT 109:80
- Vercel/Neon kept as orphaned fallback
- Repo source: `github.com/NoahSmiley/athion` (private), local `~/projects/athion`

Memory: `~/.claude/projects/-Users-noahsmile/memory/reference_athion_deploy.md`

### Phase 2 — Invite system + gated routes (2026-04-26)
- Schema: invite_codes, access_requests, users updated with member_number / username / tier / invitedBy / invitesAvailable / etc.
- /request-access form — email, GitHub URL, optional vouchers. POST /api/access-requests
- /application/[id] public status page — horizontal stepper (received → in review → interview → decision)
- /admin/applications queue + detail with action buttons
  (mark_in_review, schedule_interview, approve, deny). Approve generates a single-use invite code valid 14 days
- /api/auth/signup consumes invite codes
- Founder seed: `npm run seed:founder <email> <password>`
- Auth pages moved into (main) so they share navbar+footer
- Middleware gates everything except a public allowlist (/, /login, /signup, /request-access, /application/<id>, /privacy, /terms, /about, /process)
- /dashboard removed entirely; OAuth + lab-permissions code stripped

### Phase 2.1 — Public pages + docs (2026-04-26)
- /about — concentric ASCII animation + "tech collective with dues" framing
- /process — animated ASCII vignettes for the 5 application steps
- /docs (renamed from /design) — two-tier nav, four sections (Overview, Architecture, Stacks, Repository)
- Architecture split into: overview / state / antipatterns / monorepo
- Stack pages: Tauri, SwiftUI, React, Rust (real content) + TypeScript, Toolkit, Next.js (scaffolds)
- /docs/dev removed (content distributed)
- Homepage corner links ("What is this?", "How to join") only when logged out
- GitHub links removed from nav and footer
- Subtle focus states on inputs, hidden scrollbars on .main-stage

---

## Next up

### Phase 2.2 — Roles (smallest, unblocks downstream work)

Right now `tier === "founder"` is the only admin gate. Need a role system.

**Schema change**
- Rename `users.tier` → `users.role` (clearer naming).
- Allowed values: `founder | admin | member` (and later: `veteran`, `architect` as visible badges).
- Founder = full power (manage roles, ban, edit any data). Admin = review applications, schedule interviews, approve/deny. Member = regular access.

**Code change**
- `src/lib/auth/admin.ts` becomes `src/lib/auth/roles.ts` with helpers:
  `getCurrentUser()`, `requireRole('admin' | 'founder')`, `isFounder()`, `isAdmin()`.
- Update `/admin/*` pages to allow `role IN ('admin', 'founder')`, not just founder.
- Founder-only operations (changing roles, banning) get a separate `requireRole('founder')` guard.

**UI**
- Admin sidebar shows current user's role next to email.
- Future: founder-only `/admin/members` page to list all members and edit their roles.

**Estimate:** ~30 min of focused work. Schema migration + ~5 file edits.

### Phase 2.3 — Application messaging (text interview)

Async text-thread on each application. Replaces the "schedule interview" placeholder.

**Schema**
- New table `application_messages`:
  - `id` uuid pk
  - `application_id` uuid fk → access_requests
  - `author_id` uuid fk → users (nullable for applicant messages — they don't have an account yet)
  - `author_role` text (`applicant` | `admin` | `founder`)
  - `body` text
  - `created_at` timestamp

**Routes**
- `GET /api/access-requests/[id]/messages` — fetch thread (no auth needed; gated by knowing the application UUID)
- `POST /api/access-requests/[id]/messages` — applicant posts. No auth (UUID is the auth).
- `POST /api/admin/applications/[id]/messages` — admin posts. Requires admin role.

**UI**
- Applicant view (`/application/[id]`): when status is `interview_scheduled`, show a chat thread. Applicant can post replies. Auto-scroll to bottom.
- Admin view (`/admin/applications/[id]`): same thread, plus admin controls (approve/deny stays at the bottom).
- Multiple admins can post; their messages tagged with display name.

**Approval flow refinement**
- Drop the rigid `interview_scheduled` step in favor of "interview can start any time, decision can come any time". The stepper still shows progress, but "Interview" is just "are messages being exchanged."
- Add `needs_more_info` as a status — admin can request more info, applicant replies, status flips back to `in_review`.

**Estimate:** ~2 hours.

### Phase 2.4 — Member chat room

For approved members only. Real-time chat.

**Three tech options to choose from:**

1. **Build it (Rust + WebSocket server)** — most athion-coded, fits the homelab+rust ethos. New CT or service on CT 109. Real chunk of work (~1-2 weeks part-time).

2. **Self-hosted Matrix/Synapse** — open source, federated, mature. Run on a new CT. Members join via SSO from athion. Heavyweight but full-featured. (~2-3 days setup.)

3. **Self-hosted Mattermost** — simpler than Matrix, Slack-like. Single CT. (~1 day setup.)

4. **Discord** — easiest, but third-party. Skip if going on-prem.

**Recommendation:** Start with **#3 (Mattermost)** for time-to-value. Migrate to **#1 (custom Rust)** later if it becomes a priority for the brand. **#2 (Matrix)** if federation matters; probably doesn't here.

**Member access**
- Mattermost (or chosen platform) is gated behind athion.me SSO — only logged-in members can join.
- One default channel: `#general`. Add more as needed.

**Estimate:** ~1 day for Mattermost on a new CT + SSO bridge.

---

## Later (no commitments yet)

- Monthly invite budget for members (1/month, max 3 banked, 30-day cooldown for new members)
- Member profiles at /u/[username] with member number, bio, tier badges, who invited them, who they invited
- Member count + last-seen presence in footer
- Tier auto-promotion (Veteran at 1yr, Architect by manual grant)
- Real email sending (Resend) for application notifications and invite codes
- Member dues / Stripe billing integration for membership
- Status page at status.athion.me (LAN service health: Minecraft, OpenDock dev, etc.)
- Decommission Vercel/Neon fallback once homelab proven for ~30 days
- Move repo deploy auth from HTTPS-public to deploy key (CT 109 ssh)

---

## Open questions / decisions to make

- **Final pricing for membership dues** ($/year). Currently mentioned as "annual dues" with no number.
- **What admins are allowed to do vs. founders** — current sketch above; refine when needed.
- **Whether membership grants free access to OpenDock** vs. members pay separately. Affects OpenDock's pricing page.
- **Whether to drop the `vouchers` field from access_requests** — currently optional, no backend treatment. Either build vouching mechanics or remove the field.

---

## Conventions for picking up where we left off

- Repo: `~/projects/athion`. Live deploy: CT 109 (`/opt/athion/app`).
- Local dev: `npx next dev -p 3737` (configured to hit homelab DB at 192.168.0.42 via .env.local).
- Founder credentials (local + prod, same DB): `noahsmiley123@gmail.com` / `Bigbear11` — member #1.
- Deploy steps in `reference_athion_deploy.md` memory.
- Commit history is the source of truth for what landed; this PLAN.md is the source of truth for what's coming.
