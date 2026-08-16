# Athion operations

Updated: 2026-08-16

## Scope

This repository serves only:

- the `athion.me` service index;
- Athion account login, recovery, settings, and administrator-issued access codes;
- the Prime authentication and media proxy APIs;
- a small public status page; and
- health checks.

Minecraft content lives at `minecraft.athion.me`. Prime lives at
`prime.athion.me`.

OpenDock, Ledger, the collective/application system, billing, public profiles,
chat, central documentation, and the old service directory are archived. Their
production database rows and source history were intentionally not destroyed.

## Local checks

```sh
npm install
npm run build
npm audit --omit=dev
```

Database-backed pages require a reachable Postgres instance through
`DATABASE_URL`. Do not point ordinary local development at production data.

## Production

The Next.js app runs as `athion.service` in the Athion web container. Caddy
terminates local HTTP routing and Cloudflare Tunnel handles public ingress.

Deployments should:

1. build before replacing the running release;
2. restart `athion.service` only after a successful build;
3. verify `/api/health`, `/`, `/login`, `/status`, and Prime authentication;
4. verify removed routes return 404; and
5. retain a rollback copy of the previous release and proxy configuration.

Secrets belong only in the production environment file or secret manager. No
passwords, API keys, tokens, or private keys belong in this repository.
