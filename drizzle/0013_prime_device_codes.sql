CREATE TABLE "prime_device_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"poll_secret" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"claimed_by" uuid,
	"payload" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prime_device_codes" ADD CONSTRAINT "prime_device_codes_claimed_by_users_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
