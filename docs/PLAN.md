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

## Done (cont.)

### Phase 2.2 — Roles (2026-04-26)
- `users.tier` → `users.role`. Migration 0002.
- `src/lib/auth/admin.ts` → `src/lib/auth/roles.ts` with helpers (`getCurrentUser`, `getAdminUser`, `getFounderUser`, `isAdmin`, `isFounder`).
- Admin sidebar shows current user's role.
- `/admin/members` (founder-only): lists all users with role dropdown to change roles. PATCH `/api/admin/users/[id]/role` with last-founder protection.

### Phase 2.3 — Application messaging (2026-04-26)
- `application_messages` table. Migration 0003.
- GET/POST `/api/access-requests/[id]/messages` — same endpoint for applicant (unauth, UUID-gated) and admin (auth, identity recorded from session).
- Closed applications reject new messages (409).
- Thread component on `/application/[id]` and `/admin/applications/[id]` with chat-style bubbles, 8s polling, auto-scroll to bottom, perspective-flipping `asAdmin` flag.

### Phase 2.4 — Member chat (in-house, Rust) (2026-04-26)
- `chat_channels` + `chat_messages` tables. Migration 0004. Seeded with `#general`.
- `services/chat/` — standalone Rust binary (axum + tokio + sqlx + jsonwebtoken).
  WebSocket endpoint `/ws/<channel_slug>`. Reads athion's `auth_token` cookie,
  verifies HS256 with the same `JWT_SECRET`, looks up the user from Postgres.
  Per-channel `tokio::broadcast` for fan-out.
- `/chat` page on athion.me, opens `wss://athion.me/ws/general`. Caddy proxies
  `/ws/*` → `localhost:3001`. Auto-reconnect, last 100 messages on connect,
  member-number badges, Enter to send.
- `athion-chat.service` systemd unit on CT 109. Builds with `cargo build --release`.

### Phase 2.5 — Email notifications (2026-04-26)
- `src/lib/mail.ts` with `sendMail()` no-op fallback (logs when
  `RESEND_API_KEY` is unset/placeholder). Templates as pure functions.
- Hooks: applicationReceived (on submit), applicationInReview, interviewScheduled,
  approved (with invite code), denied, newMessage (admin → applicant only).
- Mail errors never break the user-visible request. To activate: set a real
  `RESEND_API_KEY` on CT 109 + verify athion.me DKIM/SPF in Resend.

### Phase 2.7 — Invite budget (2026-04-26)
- `src/lib/invites.ts` with `refreshInvites()` that brings counters up to
  date on demand (1 grant per 30 days, capped at 3, paused during the
  30-day new-member cooldown). Founders/admins are unlimited.
- `/invites` page: budget, generate button, history with copy-link and
  revoke actions.
- POST `/api/invites` decrements budget; DELETE `/api/invites/[id]`
  refunds it. Codes expire after 14 days.
- Signup sets `joinCooldownUntil = now + 30 days`.

### Phase 2.10 — E2E hardening pass (2026-04-27)
Found and fixed during a thorough edge-case audit:
- Rate limit was consuming quota on validation failures, dedup hits, and
  cooldown rejections. Now consumed only on actual new-application creates.
- 7 routes returned 500 on bad UUIDs (Postgres throws on non-UUID input):
  `/application/[id]`, `/application/[id]/interview`,
  `/admin/applications/[id]`, `/api/access-requests/[id]/withdraw`,
  `/api/admin/applications/[id]` PATCH, `/api/invites/[id]` DELETE,
  `/api/admin/users/[id]/role` PATCH. All now return 404.
- API routes returned HTML redirect to `/request-access` for unauthed
  callers instead of JSON 401. Now `/api/*` (outside the public allowlist)
  returns `{"error":"Unauthorized"}` 401.
- `request_more_info` action accepted empty notes (banner showed nothing
  useful to applicant). Now requires non-empty trimmed note.
- Email format validation added to `/api/access-requests` (was accepting
  arbitrary strings, e.g. `x@y.com'; DROP TABLE...` got stored).
- GitHub URL length validation (max 200 chars).
- Vouchers field length capped at 200 chars.
- Mobile: navbar's inline `height: 24` was overriding the responsive
  column-flex rule, causing nav links to crowd into a single 24px-tall
  row. Moved height to a desktop-only CSS rule.
- Login + signup did `router.push + router.refresh` after success but the
  navbar's auth state didn't propagate (it's a client component, useEffect
  only runs once). Replaced with `window.location.href = "/"` for a hard
  navigation that re-mounts the navbar.

Verified working:
- Application lifecycle: pending → in_review → interview_scheduled →
  needs_more_info → approved/denied/withdrawn, with founder reopen.
- Re-application gating: dedup, withdraw → re-apply allowed,
  deny → 30-day cooldown, approved → 409.
- Rate limit: 5 submits/IP/hour, validated paths don't burn quota.
- WebSocket: applicant + admin connect, broadcast both ways, history
  on reconnect, idle-keepalive, multi-device, empty/oversized/malformed
  bodies dropped, closed-channel reads-only with sends ignored.
- Auth: garbage cookies treated as null, role-based gates correct
  (founder-only members page, admin queue redirect for members).
- Validation: SQL injection inputs return 400, XSS payloads escaped by
  React, profile field length checks.
- Mobile: navbar wraps to column, content fits 542px viewport, chat
  textarea + send button stack appropriately.

### Phase 2.9 — Application + interview polish (2026-04-26)
- Stepper: 4 steps → 3 (Received / Reviewing / Decision)
- Approval shows "Create your account →" button + decision note
- Applicant can withdraw their own application
- Admin: "Request more info" action (status = needs_more_info, banner on
  applicant page)
- Founder-only: "Reopen" closed (denied/withdrawn) applications
- 30-day re-application cooldown after a denial; withdrawn apps re-apply freely
- Rate limit on /api/access-requests: 5/IP/hour
- Admin queue: unread bullet for applications with new applicant messages
  (Rust service sets last_applicant_message_at, admin detail page sets
  last_admin_seen_at on view)

### Phase 2.8 — Interview rooms (2026-04-26)
- Chat refit: instead of one `#general`, the chat is per-application.
- `chat_channels.kind` (general/interview), `application_id`, `closed_at`.
  `chat_messages.author_id` nullable; snapshots `author_name` +
  `author_member_number` for applicants who don't have a user row.
- Rust service adds `/ws-app/<application_id>` for unauthenticated
  applicant connections (UUID is the secret, same trust model as
  `/application/<id>`).
- `ensureInterviewChannel()` on `mark_in_review` / `schedule_interview`,
  `closeInterviewChannel()` on approve/deny.
- New `InterviewRoom` component on `/application/[id]` (applicant view)
  and `/admin/applications/[id]` (admin view). Read-only after close.
- Removed: `Thread` polling component, `/api/access-requests/[id]/messages`
  endpoint, `Chat` link from navbar.

### Phase 2.6 — Member profiles (2026-04-26)
- `/u/[username]` member-only profile pages: member number, role, bio,
  joined date, invited-by + invitees (linked).
- `/settings` for self-service editing (username, display name, bio with
  500-char limit). Username slug rules enforced server-side.
- `/api/me/profile` PATCH with uniqueness check.
- `src/lib/username.ts` helpers (`isValidUsername`, `slugify`,
  `pickUniqueUsername`).
- Signup re-enabled (was stubbed in phase 2): consumes invite codes,
  auto-generates a unique username, pre-fills `?code=` from URL.
- `getSession()` and `/api/auth/me` now expose `username` so the navbar
  links to `/u/<username>`. Nav cluster: name · Settings · Logout.

## Next up

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
