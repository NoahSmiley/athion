ALTER TABLE "prime_devices" ADD COLUMN "revoked_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "prime_devices" ADD COLUMN "label" text;
--> statement-breakpoint
ALTER TABLE "prime_devices" ADD COLUMN "last_seen_at" timestamp with time zone;
