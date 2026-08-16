# athion.me cleanup audit

Updated: 2026-08-16

## Decision

Keep only the parts with a current job:

- `athion.me`: service index and account control plane;
- `minecraft.athion.me`: Minecraft and Cold Brew;
- `prime.athion.me`: private streaming;
- `status.athion.me`: current public service checks; and
- `labs.athion.me`: the active homelab dashboard.

OpenDock and Ledger are dead. The old collective, applications, interviews,
billing, public profiles, chat, blog, central docs, project directory, generic
service pages, and duplicated project landing pages are retired.

## Result

| Measure | Before | After |
| --- | ---: | ---: |
| Page routes | 52 | 10 |
| API routes | 31 | 18 |
| Application source | about 10,800 lines | about 3,000 lines |
| Installed packages | 226 | 71 |
| Production dependency findings | 10 | 0 |

The homepage now lists only Minecraft, Prime, and Status. The remaining private
site is limited to login, recovery, settings, administrator-issued access
codes, account administration, and Prime APIs.

Removed code includes:

- OpenDock pages, updater APIs, artifacts, and release administration;
- Ledger's Plaid callback and Apple association file;
- access requests, applications, interviews, and applicant messaging;
- Stripe checkout, portal, webhook, and subscription code;
- the Rust chat service and its Caddy WebSocket routes;
- public profiles and invite budgets/cooldowns;
- empty blog, central docs, pricing, security claims, transparency, contact,
  infrastructure, software, tools, services, and server-directory pages; and
- Tailwind, MDX, Stripe, and other packages that no surviving route uses.

Production data was not erased. Retired tables, release files, containers, and
Git history remain available for recovery. They are no longer referenced by the
application schema or exposed by public routes.

## Infrastructure action

- OpenDock services were disabled and CT 108 was powered down; the container
  and its disk remain intact.
- The retired Athion chat service was disabled.
- OpenDock download and chat proxy rules were removed from Caddy.
- `mods.athion.me` and `staging.athion.me` were removed from tunnel ingress.
- DNS records for `opendock-api`, `mods`, `staging`, `demos`, and `simex` were
  removed after their exact Cloudflare targets were backed up.
- Unused OpenDock-era contact, encryption, and Stripe variables were removed
  from the live app environment after it was backed up.
- Existing tunnel and Caddy configurations were backed up before changes.

## Still open

These are real findings, not cleanup polish:

1. Rotate the founder password that once appeared in Git history. Removing it
   from the current file does not invalidate the old credential.
2. `auth_token` still uses `Domain=.athion.me` because the active Labs dashboard
   reads that cookie directly. Replace this with a short-lived, Labs-scoped
   handoff, then make the Athion cookie host-only.
3. `prox.athion.me` still exposes the Proxmox login without Cloudflare Access.
   Put it behind Access/Tailscale or remove its public ingress rule.
4. Local database-backed development is not reproducible: the configured
   homelab Postgres rejects the developer workstation. Add a local database and
   seed workflow rather than treating production as the development database.
