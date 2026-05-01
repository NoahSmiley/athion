-- Opendock desktop app releases + per-platform artifacts.
--
-- Drives:
--   - the in-app auto-updater (GET /api/opendock/updates/:target/:version)
--   - the public download page (/opendock/download)
--   - the public release history (/opendock/releases)
--
-- channel: 'stable' | 'beta'. updater endpoint filters by channel.
-- yanked:  true hides the release from updater + public pages without deleting.
-- target:  Tauri-style '<os>-<arch>' (e.g. 'darwin-aarch64').
-- url:     updater artifact (signed .tar.gz/.zip) — what the in-app updater downloads.
-- installer_url: human-installable .dmg/.nsis link shown on the download page.
-- signature: contents of the .sig file Tauri's signer produces; required for updater verification.
CREATE TABLE IF NOT EXISTS "opendock_releases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "version" text NOT NULL,
  "channel" text NOT NULL DEFAULT 'stable',
  "notes" text NOT NULL DEFAULT '',
  "pub_date" timestamptz NOT NULL DEFAULT now(),
  "yanked" boolean NOT NULL DEFAULT false,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "opendock_releases_version_channel_unique" UNIQUE ("version", "channel")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opendock_releases_channel_pub_date_idx"
  ON "opendock_releases" ("channel", "pub_date" DESC)
  WHERE "yanked" = false;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opendock_release_artifacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "release_id" uuid NOT NULL REFERENCES "opendock_releases"("id") ON DELETE CASCADE,
  "target" text NOT NULL,
  "url" text NOT NULL,
  "installer_url" text,
  "signature" text NOT NULL,
  "sha256" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "opendock_release_artifacts_release_target_unique" UNIQUE ("release_id", "target")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opendock_release_artifacts_release_idx"
  ON "opendock_release_artifacts" ("release_id");
